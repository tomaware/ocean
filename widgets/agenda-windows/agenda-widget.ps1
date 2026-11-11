#Requires -Version 5.1
<#
  Agenda — widget de bureau pour Windows, avec la charte du widget OCEAN (mêmes cartes, couleurs, thèmes)
  Affiche les événements de Google Agenda des prochains jours, lus par le petit script Google « agenda-google.gs »
  (il tourne sous ton compte Google, donc il voit tous tes agendas : perso, BO, collègues, jours fériés…).
  PowerShell + WPF, déjà inclus dans Windows 10 et 11 : rien à installer.

  Une carte en petit, moyen ou grand. Clic droit : agendas affichés (cases à cocher), taille, jours, thème, écran…
  Glisser pour déplacer (la position est retenue). Clic sur un événement : ouvre Google Agenda à ce jour.

  Utilisation :
    installer        : double-clic sur installer.cmd      (… -File agenda-widget.ps1 -Install)
    désinstaller     : double-clic sur desinstaller.cmd   (… -File agenda-widget.ps1 -Uninstall)
    lancer à la main : powershell -ExecutionPolicy Bypass -STA -File agenda-widget.ps1
  Pour les tests : -Model <sortie.json> -DataFile <agenda.json> -Now <ms> [-Reglages '{json}']
                   -Capture <dossier> (images PNG de la carte, sans fenêtre)   -TestLien (lien chiffré relu)
#>
param([switch]$Install, [switch]$Uninstall, [string]$Model, [string]$Capture, [string]$DataFile, [double]$Now = 0, [string]$Reglages, [switch]$TestLien)

# ---------------------------------------------------------------- Constantes
$GCAL_URL     = 'https://calendar.google.com/calendar/r'
$GCAL_NEW_URL = 'https://calendar.google.com/calendar/r/eventedit'
$REFRESH_MIN  = 5

$APP_NAME    = 'OCEANAgenda'
$SCRIPT_NAME = 'agenda-widget.ps1'
$BASE_DIR    = if ($env:LOCALAPPDATA) { $env:LOCALAPPDATA } else { [IO.Path]::GetTempPath() }
$INSTALL_DIR = Join-Path $BASE_DIR 'OCEAN-Agenda'
$RUN_KEY     = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
$POWERSHELL  = if ($env:SystemRoot) { Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe' } else { 'powershell' }
$SETTINGS_FILE = Join-Path $INSTALL_DIR 'reglages.json'
$CACHE_FILE    = Join-Path $INSTALL_DIR 'agenda.json'
$LINK_FILE     = Join-Path $INSTALL_DIR 'lien.dat'                                   # lien privé, chiffré pour ton compte Windows (DPAPI)
$OLD_LINK_FILE = Join-Path (Join-Path $BASE_DIR 'WindsUp') 'agenda.txt'             # lien déjà saisi dans l'ancien widget Winds-Up

# agendas : choix faits dans le widget, par nom d'agenda (true = affiché, false = masqué) ; sinon comme dans Google Agenda
$DEFAULTS = [ordered]@{ taille = 'grand'; jours = 7; passes = 'estompes'; agendas = @{}; theme = 'auto'; ecran = 1; x = $null; y = $null }

# ---------------------------------------------------------------- Installation
function Stop-Widget {
  Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -like "*$SCRIPT_NAME*" -and $_.CommandLine -notlike '*-Install*' -and $_.CommandLine -notlike '*-Uninstall*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

if ($Install) {
  Write-Host '=== Installation du widget Agenda ==='
  Write-Host ''
  $ErrorActionPreference = 'Stop'
  try {
    Stop-Widget
    New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
    $target = Join-Path $INSTALL_DIR $SCRIPT_NAME
    if ($PSCommandPath -ne $target) { Copy-Item -LiteralPath $PSCommandPath -Destination $target -Force }
    Unblock-File -LiteralPath $target -ErrorAction SilentlyContinue
    Write-Host "[OK] Widget copié dans $INSTALL_DIR"
    $cmdArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File `"$target`""
    if (-not (Test-Path $RUN_KEY)) { New-Item -Path $RUN_KEY -Force | Out-Null }
    Set-ItemProperty -Path $RUN_KEY -Name $APP_NAME -Value "`"$POWERSHELL`" $cmdArgs"
    Write-Host '[OK] Il se lancera tout seul au démarrage de Windows.'
    Start-Process -FilePath $POWERSHELL -ArgumentList $cmdArgs -WindowStyle Hidden
    Write-Host '[OK] Widget lancé.'
    Write-Host ''
    Write-Host '=== Terminé ! Le widget apparaît en haut à gauche du bureau (Windows + D pour le voir). ==='
    Write-Host 'Glisse-le où tu veux. Clic droit dessus pour choisir les agendas, la taille…'
  } catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
    exit 1
  }
  exit 0
}

if ($Uninstall) {
  Write-Host '=== Désinstallation du widget Agenda ==='
  Write-Host ''
  Stop-Widget
  Remove-ItemProperty -Path $RUN_KEY -Name $APP_NAME -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $INSTALL_DIR -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host '[OK] Widget arrêté et supprimé, lancement automatique retiré.'
  exit 0
}

function Write-Log($msg) {
  try {
    New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
    Add-Content -Path (Join-Path $INSTALL_DIR 'erreur.log') -Value "$(Get-Date -Format s)  $msg" -Encoding UTF8
  } catch {}
}

# ---------------------------------------------------------------- Outils
$INV = [Globalization.CultureInfo]::InvariantCulture
$FR  = [Globalization.CultureInfo]::new('fr-FR')
$LETTRES = [string[]]@('D', 'L', 'M', 'M', 'J', 'V', 'S')
$JOURS   = [string[]]@('Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.')
$DEFAULT_COLOR = '#4C8DF6'

function Get-NowMs { [double][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
function To-Local([double]$t) { [DateTimeOffset]::FromUnixTimeMilliseconds([int64]$t).LocalDateTime }
function Get-Cap([string]$s) { if ($s) { $s.Substring(0, 1).ToUpper() + $s.Substring(1) } else { $s } }
function Get-HM([datetime]$d) { '{0}:{1:00}' -f $d.Hour, $d.Minute }
function Get-Color([string]$c) {
  $h = ([string]$c).Trim().TrimStart('#')
  if ($h -match '^[0-9A-Fa-f]{3}$') { $h = -join ($h.ToCharArray() | ForEach-Object { "$_$_" }) }
  if ($h -match '^[0-9A-Fa-f]{8}$') { $h = $h.Substring(2) }
  if ($h -match '^[0-9A-Fa-f]{6}$') { "#$($h.ToUpper())" } else { $DEFAULT_COLOR }
}
function Get-DayUrl([datetime]$d) { "$GCAL_URL/day/$($d.Year)/$($d.Month)/$($d.Day)" }
function Get-DayTitle([datetime]$d, [datetime]$today) {
  $i = [int]($d - $today).TotalDays
  if ($i -eq 0) { return 'Aujourd''hui' }
  if ($i -eq 1) { return 'Demain' }
  Get-Cap $d.ToString('dddd', $FR)
}
function Get-DayShort([datetime]$d, [datetime]$today) {
  $i = [int]($d - $today).TotalDays
  if ($i -eq 0) { return 'Auj.' }
  if ($i -eq 1) { return 'Demain' }
  "$($JOURS[[int]$d.DayOfWeek]) $($d.Day)"
}

# ---------------------------------------------------------------- Réglages
function Read-Reglages {
  $r = [ordered]@{}
  foreach ($k in $DEFAULTS.Keys) { $r[$k] = $DEFAULTS[$k] }
  $r.agendas = @{}
  $src = $null
  if ($Reglages) { $src = $Reglages } elseif (Test-Path $SETTINGS_FILE) { $src = Get-Content $SETTINGS_FILE -Raw -Encoding UTF8 }
  if ($src) {
    try {
      $j = $src | ConvertFrom-Json
      foreach ($p in $j.PSObject.Properties) {
        if ($p.Name -eq 'agendas') { if ($p.Value) { foreach ($a in $p.Value.PSObject.Properties) { $r.agendas[$a.Name] = [bool]$a.Value } } }
        elseif ($r.Contains($p.Name)) { $r[$p.Name] = $p.Value }
      }
    } catch { Write-Log "Réglages illisibles : $_" }
  }
  $n = 7; if ([int]::TryParse([string]$r.jours, [ref]$n)) { $r.jours = [math]::Min(14, [math]::Max(1, $n)) } else { $r.jours = 7 }
  $r
}
function Save-Reglages {
  try {
    New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
    ([pscustomobject]$script:reg | ConvertTo-Json -Depth 4) | Set-Content -Path $SETTINGS_FILE -Encoding UTF8
  } catch { Write-Log "Réglages non enregistrés : $_" }
}

# Lien du script Google (…/exec?key=…) : chiffré pour le compte Windows ; repris de l'ancien widget Winds-Up s'il y est
function Get-AgendaUrl {
  try {
    if (Test-Path $LINK_FILE) {
      $ss = (Get-Content $LINK_FILE -Raw).Trim() | ConvertTo-SecureString
      $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
      try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
    }
    if (Test-Path $OLD_LINK_FILE) {
      return Get-Content $OLD_LINK_FILE -Encoding UTF8 | ForEach-Object { $_.Trim() } |
        Where-Object { $_ -match '^https://script\.google\.com/.+/exec' } | Select-Object -First 1
    }
  } catch { Write-Log "Lien de l'agenda illisible : $_" }
  $null
}
function Set-AgendaUrl([string]$url) {
  New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
  if ($url) { ConvertTo-SecureString $url -AsPlainText -Force | ConvertFrom-SecureString | Set-Content -Path $LINK_FILE }
  else { Remove-Item $LINK_FILE -ErrorAction SilentlyContinue }
}
function Get-FetchUrl([string]$u, [int]$jours) { $u + $(if ($u.Contains('?')) { '&' } else { '?' }) + "days=$jours&t=$([int64](Get-NowMs))" }

if ($TestLien) {
  $u = 'https://script.google.com/macros/s/TEST/exec?key=essai'
  Set-AgendaUrl $u
  $ok = (Get-AgendaUrl) -eq $u
  Remove-Item $LINK_FILE -ErrorAction SilentlyContinue
  if ($ok) { Write-Host '[OK] lien relu à l''identique'; exit 0 } else { Write-Host '[ERREUR] lien illisible après enregistrement'; exit 1 }
}

# ---------------------------------------------------------------- Ce qui est affiché
# Agendas connus : ceux que renvoie le script (version 2 : tous, cochés ou non dans Google Agenda),
# complétés par ceux qui ont des événements (version 1 : seulement les agendas cochés).
function Get-Calendars($data, $reg) {
  $cals = [ordered]@{}
  foreach ($c in @($data.calendars)) {
    if (-not $c -or -not $c.name) { continue }
    $n = [string]$c.name
    if (-not $cals.Contains($n)) { $cals[$n] = [pscustomobject]@{ name = $n; color = (Get-Color $c.color); selected = ($c.selected -ne $false); visible = $false } }
  }
  foreach ($e in @($data.events)) {
    if (-not $e) { continue }
    $n = if ($e.calendar) { [string]$e.calendar } else { 'Agenda' }
    if (-not $cals.Contains($n)) { $cals[$n] = [pscustomobject]@{ name = $n; color = (Get-Color $e.color); selected = $true; visible = $false } }
  }
  foreach ($c in $cals.Values) { $c.visible = if ($reg.agendas.ContainsKey($c.name)) { [bool]$reg.agendas[$c.name] } else { $c.selected } }
  , @($cals.Values)
}

function Get-Events($data, $cals, [datetime]$nowDt) {
  $vis = @{}; foreach ($c in $cals) { if ($c.visible) { $vis[$c.name] = $c } }
  $seen = @{}
  $out = New-Object System.Collections.ArrayList
  foreach ($e in @($data.events)) {
    if (-not $e) { continue }
    $n = if ($e.calendar) { [string]$e.calendar } else { 'Agenda' }
    if (-not $vis.ContainsKey($n)) { continue }
    $ad = [bool]$e.allDay
    try {
      if ($ad) {
        $s = [datetime]::ParseExact([string]$e.start, 'yyyy-MM-dd', $INV)
        $en = if ($e.end) { [datetime]::ParseExact([string]$e.end, 'yyyy-MM-dd', $INV) } else { $s.AddDays(1) }
        if ($en -le $s) { $en = $s.AddDays(1) }
      } else {
        $s = To-Local ([double]$e.start)
        $en = if ($null -ne $e.end) { To-Local ([double]$e.end) } else { $s }
        if ($en -lt $s) { $en = $s }
      }
    } catch { continue }
    # une réunion présente dans plusieurs agendas affichés : une seule fois (le script v2 donne l'identifiant)
    if ($e.uid) { if ($seen.ContainsKey([string]$e.uid)) { continue }; $seen[[string]$e.uid] = $true }
    $title = if ($e.title) { [string]$e.title } else { '(Sans titre)' }
    [void]$out.Add([pscustomobject]@{ title = $title; calendar = $n; color = (Get-Color $(if ($e.color) { $e.color } else { $vis[$n].color }))
      allDay = $ad; start = $s; end = $en
      ended = $(if ($ad) { $en -le $nowDt.Date } else { $en -le $nowDt })
      ongoing = (-not $ad -and $s -le $nowDt -and $en -gt $nowDt) })
  }
  , @($out | Sort-Object @{ e = { $_.start.Date } }, @{ e = { -not $_.allDay } }, @{ e = { $_.start } }, @{ e = { $_.title } })
}

function Test-OnDay($it, [datetime]$d) {
  $next = $d.AddDays(1)
  if ($it.allDay) { return ($it.start -lt $next -and $it.end -gt $d) }
  if ($it.start -ge $d -and $it.start -lt $next) { return $true }
  ($it.start -lt $d -and $it.end -gt $d)             # commencé la veille (soirée, nuit), encore en cours ce jour-là
}

function Get-TimeText($it, [datetime]$d) {
  if ($it.allDay) { return 'Journée' }
  if ($it.start -lt $d) { return "→ $(Get-HM $it.end)" }
  Get-HM $it.start
}
function Get-EndText($it, [datetime]$d) {
  if ($it.allDay -or $it.start -lt $d -or $it.end -le $it.start) { return '' }
  if ($it.end -ge $d.AddDays(1)) { return "→ $(Get-HM $it.end)" }
  Get-HM $it.end
}

function Get-AgendaModel($data, $reg, [double]$now) {
  $nowDt = To-Local $now; $today = $nowDt.Date
  $cals = Get-Calendars $data $reg
  $evs = Get-Events $data $cals $nowDt
  $hidePast = $reg.passes -eq 'masques'
  $days = @()
  for ($i = 0; $i -lt [int]$reg.jours; $i++) {
    $d = $today.AddDays($i)
    $items = @($evs | Where-Object { (Test-OnDay $_ $d) -and -not ($hidePast -and $_.ended) })
    $days += , [pscustomobject]@{ day = $d; label = (Get-DayTitle $d $today); short = (Get-DayShort $d $today)
      date = $d.ToString('dddd d MMMM', $FR); url = (Get-DayUrl $d); items = $items }
  }
  # à venir (petit et moyen) : en cours puis prochains, aujourd'hui d'abord ; journées entières en tête de leur jour
  $next = @()
  foreach ($dd in $days) { foreach ($it in $dd.items) { if (-not $it.ended) { $next += , [pscustomobject]@{ it = $it; day = $dd } } } }
  $week = @()
  for ($i = 0; $i -lt 7; $i++) {
    $d = $today.AddDays($i)
    $colors = @($evs | Where-Object { Test-OnDay $_ $d } | ForEach-Object { $_.color } | Select-Object -Unique | Select-Object -First 3)
    $week += , [pscustomobject]@{ day = $d; letter = $LETTRES[[int]$d.DayOfWeek]; num = $d.Day; today = ($i -eq 0); colors = $colors; url = (Get-DayUrl $d) }
  }
  [pscustomobject]@{ now = $nowDt; today = $today; calendars = $cals; days = $days; next = $next; week = $week
    todayLeft = @($days[0].items | Where-Object { -not $_.ended }).Count }
}

# ---------------------------------------------------------------- Sortie pour les tests (sans interface)
function Get-ItemText($it, [datetime]$d) {
  $st = if ($it.ongoing) { ' (en cours)' } elseif ($it.ended) { ' (passé)' } else { '' }
  "$(Get-TimeText $it $d) $($it.title) · $($it.calendar)$st"
}
if ($Model) {
  $data = Get-Content $DataFile -Raw -Encoding UTF8 | ConvertFrom-Json
  $now = if ($Now) { $Now } else { Get-NowMs }
  $script:reg = Read-Reglages
  $m = Get-AgendaModel $data $script:reg $now
  $out = [pscustomobject]@{
    calendars = @($m.calendars | ForEach-Object { [pscustomobject]@{ name = $_.name; color = $_.color; visible = $_.visible } })
    days = @($m.days | ForEach-Object { $d = $_.day; [pscustomobject]@{ label = $_.label; date = $_.date; url = $_.url; items = @($_.items | ForEach-Object { Get-ItemText $_ $d }) } })
    next = @($m.next | Select-Object -First 4 | ForEach-Object { "$($_.day.short) $(Get-ItemText $_.it $_.day.day)" })
    week = @($m.week | ForEach-Object { "$($_.letter)$($_.num):$($_.colors.Count)" })
    todayLeft = $m.todayLeft
  }
  [IO.File]::WriteAllText($Model, ($out | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))
  exit 0
}

# ---------------------------------------------------------------- Interface (WPF)
if (-not $Capture) {
  $createdNew = $false
  $script:mutex = New-Object System.Threading.Mutex($true, "Local\$APP_NAME", [ref]$createdNew)
  if (-not $createdNew) { exit 0 }
}

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Windows.Forms, System.Net.Http, Microsoft.VisualBasic
Add-Type -Namespace OCEANAgenda -Name Native -MemberDefinition @'
[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetClassName(IntPtr hWnd, System.Text.StringBuilder buf, int max);
[DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
[DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr hWnd, int index);
[DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr hWnd, int index, int value);
'@
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

# Couleurs OCEAN (clair / sombre) : les mêmes que le widget vent
$PALETTES = @{
  clair  = @{ BG = '#FFFFFF'; CELL = '#F2F3F0'; INK = '#152B33'; INK2 = '#3E5157'; INK3 = '#5C6E74'; LIVE = '#17804F'; OFF = '#D6DCD6'; LINE = '#E4E8E4'; NONE = '#E6E9E5'
    S1 = '#23A26A'; S2 = '#EE7F1B'; S3 = '#8A4FD8'; TINT = '22'; TINT_ON = '3A' }
  sombre = @{ BG = '#16262C'; CELL = '#1E3138'; INK = '#EAF1EF'; INK2 = '#B7C8C6'; INK3 = '#8EA4A3'; LIVE = '#4CC38A'; OFF = '#33494F'; LINE = '#25393F'; NONE = '#25393F'
    S1 = '#4CC38A'; S2 = '#F5A04A'; S3 = '#B38BF5'; TINT = '30'; TINT_ON = '55' }
}
$SIZES = @{ petit = @(170, 170); moyen = @(364, 170); grand = @(364, 330) }
$MAX_ROWS = 9   # grand : nombre d'événements au plus, puis « + N autres événements »

function Test-WindowsDark {
  try { (Get-ItemPropertyValue 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize' -Name AppsUseLightTheme -ErrorAction Stop) -eq 0 }
  catch { $false }
}
function Set-Palette([string]$theme) {
  $dark = if ($theme -eq 'sombre') { $true } elseif ($theme -eq 'clair') { $false } else { Test-WindowsDark }
  $script:P = $PALETTES[$(if ($dark) { 'sombre' } else { 'clair' })]
  $script:isDark = $dark
}
$script:brushes = @{}
function Get-Brush([string]$hex) {
  if (-not $script:brushes.ContainsKey($hex)) {
    $b = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.ColorConverter]::ConvertFromString($hex)); $b.Freeze()
    $script:brushes[$hex] = $b
  }
  $script:brushes[$hex]
}
function C([string]$key) { Get-Brush $script:P[$key] }
function Get-Tint([string]$hex, [string]$alpha) { Get-Brush ('#' + $alpha + (Get-Color $hex).Substring(1)) }
function T([string]$s, [double]$size, $brush, [string]$weight = 'Normal') {
  $t = [System.Windows.Controls.TextBlock]::new()
  $t.Text = $s; $t.FontSize = $size; $t.Foreground = $brush; $t.FontWeight = [System.Windows.FontWeights]::$weight
  $t.TextTrimming = 'CharacterEllipsis'
  $t
}
function Th([double]$l, [double]$t, [double]$r, [double]$b) { [System.Windows.Thickness]::new($l, $t, $r, $b) }
function New-Stack([string]$o = 'Vertical') { $s = [System.Windows.Controls.StackPanel]::new(); $s.Orientation = $o; $s }
function Add([object]$parent, [object]$child) { if ($null -ne $child) { [void]$parent.Children.Add($child) }; $child }
function New-Dock { $d = [System.Windows.Controls.DockPanel]::new(); $d.LastChildFill = $true; $d }
function Dock($child, [string]$side) { [System.Windows.Controls.DockPanel]::SetDock($child, $side); $child }
function New-Box($bg, [double]$radius, $pad) { $b = [System.Windows.Controls.Border]::new(); $b.Background = $bg; $b.CornerRadius = [System.Windows.CornerRadius]::new($radius); if ($pad) { $b.Padding = $pad }; $b }
function Center($el) { if ($null -ne $el) { $el.HorizontalAlignment = 'Center' }; $el }
function Set-Link($el, [string]$url) { $el.Tag = $url; $el.Cursor = [System.Windows.Input.Cursors]::Hand; $el }
function New-Bar([string]$color, [double]$w = 3) { $b = New-Box (Get-Brush (Get-Color $color)) 2 $null; $b.Width = $w; $b.Margin = Th 0 0 7 0; $b }

# ------------------------------------------------ Éléments communs
# Grande date : jour de la semaine en orange (accent OCEAN), numéro en très gros, mois dessous
function New-BigDate($m, [double]$size) {
  $s = New-Stack
  [void](Add $s (T ($m.today.ToString('dddd', $FR).ToUpper()) ([math]::Max(10, [math]::Round($size / 3.4))) (C 'S2') 'Black'))
  $n = Add $s (T ([string]$m.today.Day) $size (C 'INK') 'Black'); $n.Margin = Th -1 -4 0 -4
  [void](Add $s (T ($m.today.ToString('MMMM', $FR)) ([math]::Max(10, [math]::Round($size / 3.6))) (C 'INK3') 'SemiBold'))
  $s
}
# Ligne d'événement compacte (petit, moyen) : barre couleur, heure, titre
function New-MiniRow($it, $day, [bool]$showDay, [double]$size = 12) {
  $row = New-Dock; $row.Margin = Th 0 3 0 0
  [void](Set-Link $row $day.url)
  [void](Add $row (Dock (New-Bar $it.color) 'Left'))
  $when = Get-TimeText $it $day.day
  if ($showDay) { $when = "$($day.short) · $when" }
  $tt = Add $row (Dock (T $when ($size - 1) $(if ($it.ongoing) { C 'LIVE' } else { C 'INK3' }) 'SemiBold') 'Top')
  [void](Add $row (T $it.title $size (C 'INK') 'SemiBold'))
  $row
}
# Ligne d'événement (grand) : fond teinté de la couleur de l'agenda, barre, heures, titre, agenda ; passé barré et estompé
function New-EventRow($it, $day) {
  $box = New-Box $(if ($it.ended) { C 'CELL' } elseif ($it.ongoing) { Get-Tint $it.color $script:P.TINT_ON } else { Get-Tint $it.color $script:P.TINT }) 8 (Th 0 5 8 5)
  $box.Margin = Th 0 3 0 0
  [void](Set-Link $box $day.url)
  if ($it.ended) { $box.Opacity = 0.5 }
  $dock = New-Dock; $box.Child = $dock
  $bar = Add $dock (Dock (New-Bar $it.color 4) 'Left'); $bar.Margin = Th 6 0 7 0
  $tc = Add $dock (Dock (New-Stack) 'Left'); $tc.Width = 46
  [void](Add $tc (T (Get-TimeText $it $day.day) 11 (C 'INK') 'Bold'))
  $et = Get-EndText $it $day.day
  if ($et) { [void](Add $tc (T $et 10 (C 'INK3'))) }
  if ($it.ongoing) { $b = Add $dock (Dock (T 'en cours' 10 (C 'LIVE') 'Bold') 'Right'); $b.VerticalAlignment = 'Center'; $b.Margin = Th 6 0 0 0 }
  $txt = Add $dock (New-Stack)
  $t = Add $txt (T $it.title 12 (C 'INK') 'SemiBold')
  if ($it.ended) { $t.TextDecorations = [System.Windows.TextDecorations]::Strikethrough }
  [void](Add $txt (T $it.calendar 10 (C 'INK3')))
  $box
}
function New-Nothing([string]$s) { $t = T $s 12 (C 'INK3') 'SemiBold'; $t.Margin = Th 0 6 0 0; $t }

# ------------------------------------------------ Carte Agenda
function New-AgendaCard($m, [string]$size) {
  $root = New-Dock
  if ($size -eq 'petit') {
    $top = Add $root (Dock (New-Dock) 'Top')
    [void](Add $top (Dock (New-BigDate $m 34) 'Left'))
    $rest = $m.next | Select-Object -First 2
    if (-not $rest) { [void](Add $root (New-Nothing 'Rien de prévu')); return $root }
    $list = Add $root (New-Stack); $list.VerticalAlignment = 'Bottom'
    foreach ($x in $rest) { [void](Add $list (New-MiniRow $x.it $x.day ($x.day.label -ne 'Aujourd''hui') 11)) }
    return $root
  }
  if ($size -eq 'moyen') {
    $left = Add $root (Dock (New-Dock) 'Left'); $left.Width = 96; $left.Margin = Th 0 0 10 0
    [void](Add $left (Dock (New-BigDate $m 44) 'Top'))
    $cnt = $m.todayLeft
    [void](Add $left (Dock (T $(if ($cnt -eq 0) { 'rien aujourd''hui' } elseif ($cnt -eq 1) { '1 événement' } else { "$cnt événements" }) 10 (C 'INK3')) 'Bottom'))
    [void](Add $left (New-Stack))
    $list = Add $root (New-Stack)
    if (-not $m.next) { [void](Add $list (New-Nothing 'Rien de prévu')); return $root }
    $lastDay = $null; $n = 0
    foreach ($x in $m.next) {
      if ($n -ge 4) { break }
      if ($x.day.label -ne $lastDay -and $x.day.label -ne 'Aujourd''hui') {
        if ($n -ge 3) { break }   # pas d'en-tête de jour seul en bas de carte
        $h = Add $list (T $x.day.label 11 (C 'INK') 'Black'); $h.Margin = Th 0 $(if ($n) { 5 } else { 0 }) 0 0
      }
      $lastDay = $x.day.label
      [void](Add $list (New-MiniRow $x.it $x.day $false 12)); $n++
    }
    return $root
  }
  # grand
  $st = New-Stack; [void]$root.Children.Add($st)
  $hd = Add $st (New-Dock)
  $plus = Add $hd (Dock (New-Box (C 'CELL') 14 $null) 'Right'); $plus.Width = 28; $plus.Height = 28; $plus.VerticalAlignment = 'Top'
  [void](Set-Link $plus $GCAL_NEW_URL)
  $pt = T '+' 18 (C 'INK') 'Bold'; $pt.HorizontalAlignment = 'Center'; $pt.VerticalAlignment = 'Center'; $pt.Margin = Th 0 -3 0 0; $plus.Child = $pt
  $hl = Add $hd (New-Stack 'Horizontal')
  $num = Add $hl (T ([string]$m.today.Day) 34 (C 'INK') 'Black'); $num.Margin = Th 0 -6 8 -4
  $hs = Add $hl (New-Stack); $hs.VerticalAlignment = 'Center'
  [void](Add $hs (T ($m.today.ToString('dddd', $FR).ToUpper()) 11 (C 'S2') 'Black'))
  [void](Add $hs (T ($m.today.ToString('MMMM yyyy', $FR)) 12 (C 'INK3') 'SemiBold'))
  # bandeau des 7 prochains jours : aujourd'hui entouré, une pastille par agenda qui a un événement ce jour-là
  $wk = Add $st (New-Box (C 'CELL') 10 (Th 4 5 4 5)); $wk.Margin = Th 0 8 0 4
  $g = [System.Windows.Controls.Primitives.UniformGrid]::new(); $g.Columns = 7; $g.Rows = 1; $wk.Child = $g
  foreach ($w in $m.week) {
    $c = New-Stack; [void](Set-Link $c $w.url); $c.Background = [System.Windows.Media.Brushes]::Transparent
    [void](Add $c (Center (T $w.letter 9 (C 'INK3') 'SemiBold')))
    $nb = Add $c (Center (New-Box $(if ($w.today) { C 'INK' } else { [System.Windows.Media.Brushes]::Transparent }) 11 $null)); $nb.Width = 22; $nb.Height = 22
    $nt = T ([string]$w.num) 12 $(if ($w.today) { C 'BG' } else { C 'INK' }) 'Bold'; $nt.HorizontalAlignment = 'Center'; $nt.VerticalAlignment = 'Center'; $nb.Child = $nt
    $dots = Add $c (Center (New-Stack 'Horizontal')); $dots.Height = 7; $dots.Margin = Th 0 2 0 0
    foreach ($col in $w.colors) { $dt = New-Box (Get-Brush $col) 3 $null; $dt.Width = 5; $dt.Height = 5; $dt.Margin = Th 1 0 1 0; [void](Add $dots $dt) }
    [void](Add $g $c)
  }
  # événements, jour par jour (jours sans rien sautés, sauf aujourd'hui)
  $shown = 0; $hidden = 0
  foreach ($d in $m.days) {
    $items = @($d.items)
    if (-not $items.Count -and $d.label -ne 'Aujourd''hui') { continue }
    if ($shown -ge $MAX_ROWS) { $hidden += $items.Count; continue }
    $dh = Add $st (New-Dock); $dh.Margin = Th 0 7 0 0; [void](Set-Link $dh $d.url); $dh.Background = [System.Windows.Media.Brushes]::Transparent
    $dl = Add $dh (New-Stack 'Horizontal')
    [void](Add $dl (T $d.label 13 (C 'INK') 'Black'))
    if ($d.label -eq 'Aujourd''hui' -or $d.label -eq 'Demain') { $dd = Add $dl (T " $($d.date)" 11 (C 'INK3')); $dd.VerticalAlignment = 'Bottom' }
    else { $dd = Add $dl (T " $($d.day.Day) $($d.day.ToString('MMMM', $FR))" 11 (C 'INK3')); $dd.VerticalAlignment = 'Bottom' }
    if (-not $items.Count) { [void](Add $st (New-Nothing 'Rien de prévu')); continue }
    foreach ($it in $items) {
      if ($shown -ge $MAX_ROWS) { $hidden++; continue }
      [void](Add $st (New-EventRow $it $d)); $shown++
    }
  }
  if ($hidden -gt 0) {
    $mo = Add $st (T "+ $hidden autre$(if ($hidden -gt 1) { 's' }) événement$(if ($hidden -gt 1) { 's' })" 11 (C 'INK3') 'SemiBold'); $mo.Margin = Th 2 7 0 0
    [void](Set-Link $mo $GCAL_URL)
  }
  $root
}

# ------------------------------------------------ Assemblage
function New-Card($content, [string]$size, [string]$url, [string]$foot) {
  $wh = $SIZES[$size]
  $b = New-Box (C 'BG') 22 (Th 14 14 14 12); $b.Width = $wh[0]; $b.MinHeight = $wh[1]; $b.Margin = Th 12 12 12 12
  $b.BorderBrush = C 'LINE'; $b.BorderThickness = Th 1 1 1 1
  $sh = [System.Windows.Media.Effects.DropShadowEffect]::new(); $sh.BlurRadius = 20; $sh.ShadowDepth = 4; $sh.Direction = 270; $sh.Opacity = $(if ($script:isDark) { 0.45 } else { 0.18 })
  $b.Effect = $sh; [void](Set-Link $b $url)
  if ($foot) {
    $d = New-Dock; $f = Add $d (Dock (T $foot 9 (C 'INK3')) 'Bottom'); $f.Margin = Th 0 4 0 0
    [void]$d.Children.Add($content); $b.Child = $d
  } else { $b.Child = $content }
  $b
}
function New-Message([string]$title, [string]$msg, [string]$size) {
  $s = New-Stack; [void](Add $s (T $title 14 (C 'INK') 'Black')); $t = Add $s (T $msg 12 (C 'INK2')); $t.TextWrapping = 'Wrap'; $t.Margin = Th 0 6 0 0
  New-Card $s $(if ($size -eq 'petit') { 'petit' } else { 'moyen' }) $GCAL_URL $null
}
function New-WidgetContent($data, [bool]$cached, [string]$err, [bool]$hasLink, [double]$now) {
  $reg = $script:reg
  Set-Palette $reg.theme
  if (-not $hasLink) { return New-Message 'Agenda' 'Clic droit → « Brancher mon Google Agenda… » et colle le lien …/exec?key=… de ton script Google.' $reg.taille }
  if (-not $data) {
    $msg = if ($err) { $err } else { 'Pas encore de données (hors ligne ?). Nouvel essai dans quelques minutes.' }
    return New-Message 'Agenda' $msg $reg.taille
  }
  $m = Get-AgendaModel $data $reg $now
  $foot = if ($cached) { 'hors ligne : dernières données' } elseif ($err) { $err } else { $null }
  New-Card (New-AgendaCard $m $reg.taille) $reg.taille $GCAL_URL $foot
}

# ---------------------------------------------------------------- Images de contrôle (tests, sans fenêtre)
function Save-Png($el, [string]$path) {
  $el.Measure([System.Windows.Size]::new([double]::PositiveInfinity, [double]::PositiveInfinity))
  $el.Arrange([System.Windows.Rect]::new($el.DesiredSize)); $el.UpdateLayout()
  $w = [int][math]::Ceiling($el.DesiredSize.Width * 2); $h = [int][math]::Ceiling($el.DesiredSize.Height * 2)
  $bmp = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($w, $h, 192, 192, [System.Windows.Media.PixelFormats]::Pbgra32)
  $bmp.Render($el)
  $enc = [System.Windows.Media.Imaging.PngBitmapEncoder]::new(); $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bmp))
  $fs = [IO.File]::Create($path); try { $enc.Save($fs) } finally { $fs.Close() }
}
if ($Capture) {
  $ErrorActionPreference = 'Stop'   # en test, la moindre erreur d'affichage fait échouer (sinon PowerShell continue en silence)
  New-Item -ItemType Directory -Force -Path $Capture | Out-Null
  $data = if ($DataFile) { Get-Content $DataFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }
  $now = if ($Now) { $Now } else { Get-NowMs }
  $base = Read-Reglages
  $cases = @(
    @{ n = 'agenda-petit-clair'; r = @{ taille = 'petit'; theme = 'clair' } },
    @{ n = 'agenda-petit-sombre'; r = @{ taille = 'petit'; theme = 'sombre' } },
    @{ n = 'agenda-moyen-clair'; r = @{ taille = 'moyen'; theme = 'clair' } },
    @{ n = 'agenda-moyen-sombre'; r = @{ taille = 'moyen'; theme = 'sombre' } },
    @{ n = 'agenda-grand-clair'; r = @{ taille = 'grand'; theme = 'clair' } },
    @{ n = 'agenda-grand-sombre'; r = @{ taille = 'grand'; theme = 'sombre' } },
    @{ n = 'agenda-grand-sombre-passes-masques'; r = @{ taille = 'grand'; theme = 'sombre'; passes = 'masques' } },
    @{ n = 'agenda-sans-lien'; r = @{ taille = 'moyen'; theme = 'clair' }; nolink = $true })
  foreach ($c in $cases) {
    $script:reg = [ordered]@{}; foreach ($k in $base.Keys) { $script:reg[$k] = $base[$k] }; foreach ($k in $c.r.Keys) { $script:reg[$k] = $c.r[$k] }
    $el = New-WidgetContent $data $false $null (-not $c.nolink) $now
    $frame = New-Box $(if ($script:isDark) { Get-Brush '#0B1418' } else { Get-Brush '#D9DED9' }) 0 (Th 8 8 8 8); $frame.Child = $el
    [System.Windows.Documents.TextElement]::SetFontFamily($frame, [System.Windows.Media.FontFamily]::new('Segoe UI Variable Text, Segoe UI'))
    Save-Png $frame (Join-Path $Capture "$($c.n).png")
    Write-Host "[image] $($c.n).png"
  }
  exit 0
}

# ---------------------------------------------------------------- Fenêtre
$script:reg = Read-Reglages
$script:data = $null; $script:cached = $false; $script:err = $null; $script:fetch = $null
$script:http = [System.Net.Http.HttpClient]::new(); $script:http.Timeout = [TimeSpan]::FromSeconds(40)

function Read-Cache {
  try { if (Test-Path $CACHE_FILE) { $script:data = Get-Content $CACHE_FILE -Raw -Encoding UTF8 | ConvertFrom-Json; $script:cached = $true } }
  catch { Write-Log "Cache illisible : $_" }
}
function Start-Fetch {
  $u = Get-AgendaUrl
  if (-not $u -or $script:fetch) { return }
  $script:fetch = $script:http.GetByteArrayAsync((Get-FetchUrl $u ([int]$script:reg.jours)))
}
function Receive-Fetch {
  if (-not ($script:fetch -and $script:fetch.IsCompleted)) { return }
  $f = $script:fetch; $script:fetch = $null
  try {
    if ($f.IsFaulted) { throw $f.Exception.GetBaseException() }
    $txt = [Text.Encoding]::UTF8.GetString($f.Result)
    if ($txt.TrimStart().StartsWith('<')) { throw 'le script Google a renvoyé une page au lieu des événements (déploiement ?)' }
    $j = $txt | ConvertFrom-Json
    if ($j.error) { $script:err = "Lien refusé par le script : $($j.error)"; throw $script:err }
    if ($null -eq $j.events) { throw 'réponse sans événements' }
    $script:data = $j; $script:cached = $false; $script:err = $null
    try { New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null; [IO.File]::WriteAllText($CACHE_FILE, $txt, [Text.UTF8Encoding]::new($false)) } catch {}
  } catch {
    Write-Log "Agenda : $_"
    if ($script:data) { $script:cached = $true } elseif (-not $script:err) { $script:err = 'Agenda indisponible pour le moment. Nouvel essai dans quelques minutes.' }
  }
  Update-Widget
}

$win = [System.Windows.Window]::new()
$win.Title = 'Agenda'
$win.WindowStyle = 'None'
$win.AllowsTransparency = $true
$win.Background = [System.Windows.Media.Brushes]::Transparent
$win.ShowInTaskbar = $false
$win.ShowActivated = $false
$win.ResizeMode = 'NoResize'
$win.SizeToContent = 'WidthAndHeight'
$win.Topmost = $false
$win.FontFamily = [System.Windows.Media.FontFamily]::new('Segoe UI Variable Text, Segoe UI')
[System.Windows.Media.TextOptions]::SetTextFormattingMode($win, 'Display')

function Get-TargetScreen {
  $target = [System.Windows.Forms.Screen]::PrimaryScreen
  $e = 1; if (-not [int]::TryParse([string]$script:reg.ecran, [ref]$e)) { $e = 1 }
  if ($e -ge 2) {
    $others = @([System.Windows.Forms.Screen]::AllScreens | Where-Object { -not $_.Primary } | Sort-Object { $_.Bounds.X })
    if ($others.Count) { $target = $others[[math]::Min($others.Count, $e - 1) - 1] }
  }
  $target
}
function Set-WidgetPosition {
  $r = $script:reg
  $vl = [System.Windows.SystemParameters]::VirtualScreenLeft; $vt = [System.Windows.SystemParameters]::VirtualScreenTop
  $vw = [System.Windows.SystemParameters]::VirtualScreenWidth; $vh = [System.Windows.SystemParameters]::VirtualScreenHeight
  if ($null -ne $r.x -and $null -ne $r.y -and $r.x -ge $vl - 40 -and $r.x -lt $vl + $vw - 80 -and $r.y -ge $vt - 20 -and $r.y -lt $vt + $vh - 80) {
    if ($win.Left -ne $r.x) { $win.Left = $r.x }; if ($win.Top -ne $r.y) { $win.Top = $r.y }; return
  }
  # par défaut : en haut à gauche de l'écran choisi (le widget OCEAN est en haut à droite)
  $wa = (Get-TargetScreen).WorkingArea
  $src = [System.Windows.PresentationSource]::FromVisual($win)
  $tl = [System.Windows.Point]::new($wa.Left, $wa.Top)
  if ($src) { $tl = $src.CompositionTarget.TransformFromDevice.Transform($tl) }
  $left = $tl.X + 12; $top = $tl.Y + 28
  if ($win.Left -ne $left) { $win.Left = $left }; if ($win.Top -ne $top) { $win.Top = $top }
}

function Find-Url($o) {
  while ($o) {
    if ($o -is [System.Windows.FrameworkElement] -and $o.Tag -is [string] -and $o.Tag.StartsWith('http')) { return $o.Tag }
    if ($o -is [System.Windows.Media.Visual] -or $o -is [System.Windows.Media.Media3D.Visual3D]) { $o = [System.Windows.Media.VisualTreeHelper]::GetParent($o) }
    else { $o = [System.Windows.LogicalTreeHelper]::GetParent($o) }
  }
  $GCAL_URL
}
$win.add_MouseLeftButtonDown({
  param($s, $e)
  $l0 = $win.Left; $t0 = $win.Top
  try { $win.DragMove() } catch {}
  if ([math]::Abs($win.Left - $l0) -gt 2 -or [math]::Abs($win.Top - $t0) -gt 2) {
    $script:reg.x = [math]::Round($win.Left); $script:reg.y = [math]::Round($win.Top); Save-Reglages
  } else {
    Start-Process (Find-Url $e.OriginalSource)
  }
})

function New-MenuItem([string]$header, [scriptblock]$action, [bool]$checked = $false) {
  $i = [System.Windows.Controls.MenuItem]::new(); $i.Header = $header; $i.IsChecked = $checked
  if ($action) { $i.add_Click($action) }
  $i
}
function New-ChoiceMenu([string]$header, [string]$key, $choices) {
  $m = [System.Windows.Controls.MenuItem]::new(); $m.Header = $header
  foreach ($c in $choices) {
    $it = New-MenuItem $c[1] $null ([string]$script:reg[$key] -eq [string]$c[0])
    $it.Tag = @($key, $c[0])
    $it.add_Click({ param($s, $e) Set-Reglage $s.Tag[0] $s.Tag[1] })
    [void]$m.Items.Add($it)
  }
  $m
}
function Set-Reglage([string]$key, $value) {
  $script:reg[$key] = $value
  if ($key -eq 'ecran') { $script:reg.x = $null; $script:reg.y = $null }
  Save-Reglages; Update-Widget
  if ($key -eq 'jours') { Start-Fetch }
}
# Agendas affichés : une case par agenda ; le menu reste ouvert pour en cocher plusieurs d'affilée
function New-CalendarsMenu {
  $m = [System.Windows.Controls.MenuItem]::new(); $m.Header = 'Agendas affichés'
  $cals = if ($script:data) { Get-Calendars $script:data $script:reg } else { @() }
  if (-not $cals.Count) { $x = New-MenuItem '(pas encore d''agenda reçu)' $null; $x.IsEnabled = $false; [void]$m.Items.Add($x); return $m }
  foreach ($c in $cals) {
    $it = [System.Windows.Controls.MenuItem]::new()
    $hd = New-Stack 'Horizontal'
    $dot = New-Box (Get-Brush $c.color) 5 $null; $dot.Width = 10; $dot.Height = 10; $dot.Margin = Th 0 0 7 0; $dot.VerticalAlignment = 'Center'
    [void]$hd.Children.Add($dot)
    $lab = [System.Windows.Controls.TextBlock]::new(); $lab.Text = $c.name + $(if (-not $c.selected) { '  (masqué dans Google Agenda)' } else { '' }); [void]$hd.Children.Add($lab)
    $it.Header = $hd; $it.IsCheckable = $true; $it.IsChecked = [bool]$c.visible; $it.StaysOpenOnClick = $true
    $it.Tag = @($c.name, [bool]$c.selected)
    $it.add_Click({
      param($s, $e)
      $name = $s.Tag[0]; $sel = $s.Tag[1]
      if ($s.IsChecked -eq $sel) { [void]$script:reg.agendas.Remove($name) } else { $script:reg.agendas[$name] = [bool]$s.IsChecked }
      Save-Reglages; Update-Widget
    })
    [void]$m.Items.Add($it)
  }
  [void]$m.Items.Add([System.Windows.Controls.Separator]::new())
  [void]$m.Items.Add((New-MenuItem 'Tout afficher' { foreach ($c in (Get-Calendars $script:data $script:reg)) { $script:reg.agendas[$c.name] = $true }; Save-Reglages; Update-Widget }))
  [void]$m.Items.Add((New-MenuItem 'Comme dans Google Agenda' { $script:reg.agendas = @{}; Save-Reglages; Update-Widget }))
  $m
}
function New-WidgetMenu {
  $menu = [System.Windows.Controls.ContextMenu]::new()
  [void]$menu.Items.Add((New-MenuItem 'Ouvrir Google Agenda' { Start-Process $GCAL_URL }))
  [void]$menu.Items.Add((New-MenuItem 'Nouvel événement…' { Start-Process $GCAL_NEW_URL }))
  [void]$menu.Items.Add((New-MenuItem 'Actualiser' { Start-Fetch }))
  [void]$menu.Items.Add([System.Windows.Controls.Separator]::new())
  [void]$menu.Items.Add((New-CalendarsMenu))
  [void]$menu.Items.Add((New-ChoiceMenu 'Taille' 'taille' @(@('petit', 'Petit'), @('moyen', 'Moyen'), @('grand', 'Grand'))))
  [void]$menu.Items.Add((New-ChoiceMenu 'Jours affichés' 'jours' @(@(1, 'Aujourd''hui seulement'), @(3, '3 jours'), @(7, '7 jours'), @(14, '14 jours'))))
  [void]$menu.Items.Add((New-ChoiceMenu 'Événements passés' 'passes' @(@('estompes', 'Barrés et estompés'), @('masques', 'Masqués'))))
  [void]$menu.Items.Add((New-ChoiceMenu 'Thème' 'theme' @(@('auto', 'Comme Windows'), @('clair', 'Clair'), @('sombre', 'Sombre'))))
  $screens = @(, @(1, 'Écran principal'))
  $n = @([System.Windows.Forms.Screen]::AllScreens).Count
  for ($i = 2; $i -le $n; $i++) { $screens += , @($i, $(if ($i -eq 2) { 'Deuxième écran' } else { "Écran $i" })) }
  [void]$menu.Items.Add((New-ChoiceMenu 'Écran' 'ecran' $screens))
  [void]$menu.Items.Add((New-MenuItem 'Remettre en haut à gauche' { $script:reg.x = $null; $script:reg.y = $null; Save-Reglages; Set-WidgetPosition }))
  [void]$menu.Items.Add([System.Windows.Controls.Separator]::new())
  $has = [bool](Get-AgendaUrl)
  [void]$menu.Items.Add((New-MenuItem $(if ($has) { 'Google Agenda : branché (changer le lien…)' } else { 'Brancher mon Google Agenda…' }) {
    $u = [Microsoft.VisualBasic.Interaction]::InputBox("Lien …/exec?key=… de ton script Google « agenda-google.gs ».`nIl est gardé chiffré sur ce PC, pour ton compte Windows.", 'Agenda · lien Google', '').Trim()
    if ($u -match '^https://script\.google\.com/.+/exec') { Set-AgendaUrl $u; $script:err = $null; Start-Fetch; Update-Widget }
    elseif ($u) { [System.Windows.MessageBox]::Show('Ce lien ne ressemble pas à un lien …/exec de script Google : rien n''a été changé.', 'Agenda') | Out-Null }
  }))
  [void]$menu.Items.Add((New-MenuItem 'Quitter le widget' { $win.Close() }))
  $menu
}

function Update-Widget {
  try {
    $win.Content = New-WidgetContent $script:data $script:cached $script:err ([bool](Get-AgendaUrl)) (Get-NowMs)
    if (-not ($win.ContextMenu -and $win.ContextMenu.IsOpen)) { $win.ContextMenu = New-WidgetMenu }
  } catch {
    Write-Log "Affichage : $_ $($_.ScriptStackTrace)"
  }
}

$win.add_SourceInitialized({
  $script:hwnd = [System.Windows.Interop.WindowInteropHelper]::new($win).Handle
  $ex = [OCEANAgenda.Native]::GetWindowLong($script:hwnd, -20)
  [void][OCEANAgenda.Native]::SetWindowLong($script:hwnd, -20, ($ex -bor 0x80))
})
$win.add_SizeChanged({ Set-WidgetPosition })
$win.add_StateChanged({ if ($win.WindowState -eq 'Minimized') { $win.WindowState = 'Normal' } })
$win.add_ContextMenuClosing({ $win.ContextMenu = New-WidgetMenu })   # menu à jour (cases cochées) à la prochaine ouverture

function Update-ZOrder {
  $fg = [OCEANAgenda.Native]::GetForegroundWindow()
  if ($fg -eq [IntPtr]::Zero) { return }
  [uint32]$fgPid = 0
  [void][OCEANAgenda.Native]::GetWindowThreadProcessId($fg, [ref]$fgPid)
  if ($fgPid -eq $PID) { return }
  $sb = [System.Text.StringBuilder]::new(64)
  [void][OCEANAgenda.Native]::GetClassName($fg, $sb, 64)
  $onDesktop = @('WorkerW', 'Progman') -contains $sb.ToString()
  if ($win.Topmost -ne $onDesktop) { $win.Topmost = $onDesktop }
}

$fast = [System.Windows.Threading.DispatcherTimer]::new(); $fast.Interval = [TimeSpan]::FromMilliseconds(250)
$fast.add_Tick({ Receive-Fetch; Update-ZOrder })
$minute = [System.Windows.Threading.DispatcherTimer]::new(); $minute.Interval = [TimeSpan]::FromMinutes(1)
$script:ticks = 0
$minute.add_Tick({
  $script:ticks++
  if ($script:ticks % $REFRESH_MIN -eq 0) { Start-Fetch }
  Update-Widget            # « en cours », événements passés, changement de jour à minuit, thème de Windows
  Set-WidgetPosition
})

Read-Cache
Update-Widget
$win.add_Loaded({ Set-WidgetPosition; Start-Fetch; $fast.Start(); $minute.Start() })

$app = [System.Windows.Application]::new()
$app.ShutdownMode = 'OnMainWindowClose'
$app.add_DispatcherUnhandledException({ param($s, $e) Write-Log "Erreur : $($e.Exception.Message)"; $e.Handled = $true })
[void]$app.Run($win)
