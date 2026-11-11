#Requires -Version 5.1
<#
  OCEAN — widget de bureau pour Windows (vent du spot + créneaux wing)
  Mêmes données, mêmes étoiles et mêmes créneaux que l'app OCEAN (https://tomaware.github.io/ocean/)
  et que les widgets iPhone. PowerShell + WPF, déjà inclus dans Windows 10 et 11 : rien à installer.

  Deux cartes, chacune en petit, moyen ou grand (ou masquée) :
    • Vent      : un spot au choix, le vent maintenant et dans 2 h, puis 4 jours (étoiles, vent max, créneau).
    • Créneaux  : les meilleurs créneaux tous spots confondus ; en grand, la grille spots × 5 jours.
  Tout se règle au clic droit (spot, mode, tailles, thème, écran…). Glisser pour déplacer. Clic : ouvre OCEAN.

  Utilisation :
    installer        : double-clic sur installer.cmd      (… -File ocean-widget.ps1 -Install)
    désinstaller     : double-clic sur desinstaller.cmd   (… -File ocean-widget.ps1 -Uninstall)
    lancer à la main : powershell -ExecutionPolicy Bypass -STA -File ocean-widget.ps1
  Pour les tests : -Model <sortie.json> -DataFile <données.json> -Now <ms> [-Reglages '{json}'] [-LiveFile <balises.json>]
                   -Capture <dossier> (images PNG de chaque carte, sans fenêtre)
#>
param([switch]$Install, [switch]$Uninstall, [string]$Model, [string]$Capture, [string]$DataFile, [double]$Now = 0, [string]$Reglages, [string]$LiveFile)

# ---------------------------------------------------------------- Constantes
$DATA_URL = 'https://tomaware.github.io/ocean/data/widget-wind.json'
$APP_URL  = 'https://tomaware.github.io/ocean/'
$NEAR     = @('la-grande-motte', 'le-ponant', 'port-camargue')   # < 55 km de Montpellier (comme les Sessions 2H)
$LIVE_MAX_MIN = 90                                               # balise plus vieille : on affiche la prévision de l'heure
$DATA_REFRESH_MIN = 15
$LIVE_REFRESH_MIN = 5

$APP_NAME    = 'OCEANWidget'
$SCRIPT_NAME = 'ocean-widget.ps1'
$BASE_DIR    = if ($env:LOCALAPPDATA) { $env:LOCALAPPDATA } else { [IO.Path]::GetTempPath() }
$INSTALL_DIR = Join-Path $BASE_DIR 'OCEAN'
$RUN_KEY     = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
$POWERSHELL  = if ($env:SystemRoot) { Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe' } else { 'powershell' }
$SETTINGS_FILE = Join-Path $INSTALL_DIR 'reglages.json'
$CACHE_FILE    = Join-Path $INSTALL_DIR 'donnees.json'
$SP_FILE       = Join-Path $INSTALL_DIR 'superprevision.dat'   # lien privé, chiffré pour ton compte Windows (DPAPI)
$OLD_SP_FILE   = Join-Path (Join-Path $BASE_DIR 'WindsUp') 'prevision.txt'   # lien déjà saisi dans l'ancien widget Winds-Up

$DEFAULTS = [ordered]@{ spot = 'la-grande-motte'; mode = 'secu'; vent = 'moyen'; creneaux = 'moyen'; creneauxSpots = 'tous'
  disposition = 'cote'; theme = 'auto'; ecran = 1; x = $null; y = $null }

# ---------------------------------------------------------------- Installation
function Stop-Widget {
  Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -like "*$SCRIPT_NAME*" -and $_.CommandLine -notlike '*-Install*' -and $_.CommandLine -notlike '*-Uninstall*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

if ($Install) {
  Write-Host '=== Installation du widget OCEAN ==='
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
    Write-Host '=== Terminé ! Le widget apparaît en haut à droite du bureau (Windows + D pour le voir). ==='
    Write-Host 'Clic droit dessus pour choisir le spot, le mode, la taille des cartes…'
  } catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
    exit 1
  }
  exit 0
}

if ($Uninstall) {
  Write-Host '=== Désinstallation du widget OCEAN ==='
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
$INV  = [Globalization.CultureInfo]::InvariantCulture
$DIR16 = [string[]]@('N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO')
$JOURS = [string[]]@('Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.')

function Get-NowMs { [double][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
function To-Local([double]$t) { [DateTimeOffset]::FromUnixTimeMilliseconds([int64]$t).LocalDateTime }
function Get-DayKey([double]$t) { (To-Local $t).ToString('yyyy-MM-dd', $INV) }
function Get-Hour([double]$t) { (To-Local $t).Hour }
function Get-DayLabel([string]$key, [double]$now, [switch]$Demain) {
  if ($key -eq (Get-DayKey $now)) { return 'Auj.' }
  if ($Demain -and $key -eq (Get-DayKey ($now + 86400000))) { return 'Demain' }
  $JOURS[[int][datetime]::ParseExact($key, 'yyyy-MM-dd', $INV).DayOfWeek]
}
function Get-Compass($d) { if ($null -eq $d) { '' } else { $DIR16[[int][math]::Round([double]$d / 22.5) % 16] } }
function Get-FromText($o) {
  $k = [array]::IndexOf($DIR16, ([string]$o).ToUpper().Replace('W', 'O'))
  if ($k -lt 0) { $null } else { $k * 22.5 }
}
function Get-Norm([string]$s) {
  $d = ([string]$s).ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  ($d -replace '\p{Mn}', '') -replace '[^a-z0-9]+', '-'
}
function Get-Stars($score) { if ($null -eq $score) { 0 } elseif ($score -ge 8.5) { 3 } elseif ($score -ge 7) { 2 } elseif ($score -ge 5) { 1 } else { 0 } }
function Get-Ago([double]$t, [double]$now) {
  $m = [math]::Max(0, [int][math]::Round(($now - $t) / 60000))
  if ($m -lt 60) { "$m min" } else { '{0} h {1:00}' -f [math]::Floor($m / 60), ($m % 60) }
}
function Get-Round($v) { if ($null -eq $v) { '–' } else { [string][int][math]::Round([double]$v) } }
function Get-Span($s) { '{0}–{1} h' -f (Get-Hour $s.s), (Get-Hour $s.e) }

# ---------------------------------------------------------------- Réglages
function Read-Reglages {
  $r = [ordered]@{}
  foreach ($k in $DEFAULTS.Keys) { $r[$k] = $DEFAULTS[$k] }
  $src = $null
  if ($Reglages) { $src = $Reglages } elseif (Test-Path $SETTINGS_FILE) { $src = Get-Content $SETTINGS_FILE -Raw -Encoding UTF8 }
  if ($src) {
    try { $j = $src | ConvertFrom-Json; foreach ($p in $j.PSObject.Properties) { if ($r.Contains($p.Name)) { $r[$p.Name] = $p.Value } } }
    catch { Write-Log "Réglages illisibles : $_" }
  }
  $r
}
function Save-Reglages {
  try {
    New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
    ([pscustomobject]$script:reg | ConvertTo-Json) | Set-Content -Path $SETTINGS_FILE -Encoding UTF8
  } catch { Write-Log "Réglages non enregistrés : $_" }
}

# Lien de la super prévision (mode perso) : chiffré pour le compte Windows, jamais en clair dans un fichier OCEAN
function Get-SuperPrevisionUrl {
  try {
    if (Test-Path $SP_FILE) {
      $ss = Get-Content $SP_FILE -Raw | ConvertTo-SecureString
      $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
      try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
    }
    if (Test-Path $OLD_SP_FILE) {
      return Get-Content $OLD_SP_FILE -Encoding UTF8 | ForEach-Object { $_.Trim() } |
        Where-Object { $_ -match '^https://script\.google\.com/' -and $_ -notmatch '/dev(\?|$)' } | Select-Object -First 1
    }
  } catch { Write-Log "Lien super prévision illisible : $_" }
  $null
}
function Set-SuperPrevisionUrl([string]$url) {
  New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
  if ($url) { ConvertTo-SecureString $url -AsPlainText -Force | ConvertFrom-SecureString | Set-Content -Path $SP_FILE }
  else { Remove-Item $SP_FILE -ErrorAction SilentlyContinue }
}

# ---------------------------------------------------------------- Ce qui est affiché (mêmes règles que les widgets iPhone)
function Find-Spot($data, [string]$q) {
  $n = Get-Norm $q
  $s = $data.spots | Where-Object { $_.id -eq $n } | Select-Object -First 1
  if (-not $s) { $s = $data.spots | Where-Object { (Get-Norm $_.short) -eq $n -or (Get-Norm $_.name) -eq $n } | Select-Object -First 1 }
  if (-not $s) { $s = $data.spots | Where-Object { (Get-Norm $_.name).Contains($n) -or (Get-Norm $_.short).Contains($n) -or $_.id.Contains($n) } | Select-Object -First 1 }
  if (-not $s) { $s = $data.spots | Where-Object { $_.id -eq $DEFAULTS.spot } | Select-Object -First 1 }
  if (-not $s) { $s = @($data.spots)[0] }
  $s
}

function Get-Sessions($spot, [string]$level) { @($spot.sessions.$level | Where-Object { $_ }) }

<# Vent en direct : 1) balise Winds-Up via la super prévision (mode perso) ; 2) mesure publique publiée par OCEAN (Le Jaï : Marignane). #>
function Get-Live($spot, $data, $superLive, [double]$now) {
  if ($superLive -and $superLive.spots) {
    foreach ($p in $superLive.spots.PSObject.Properties) {
      $x = $p.Value; $n = Get-Norm $x.nom
      if (-not ($n -eq $spot.id -or $n.StartsWith($spot.id + '-') -or $n.Contains($spot.id))) { continue }
      if ($x.panne) { return [pscustomobject]@{ panne = $true; src = 'balise' } }
      if ($null -ne $x.t -and ($now - [double]$x.t) -lt $LIVE_MAX_MIN * 60000) {
        return [pscustomobject]@{ t = [double]$x.t; kn = $x.v; gust = $x.max; dir = (Get-FromText $x.o); dirTxt = [string]$x.o; src = 'balise'; panne = $false }
      }
    }
  }
  $o = $null
  if ($data.obs) { $o = $data.obs.($spot.id) }
  if ($o -and ($now - [double]$o.t) -lt $LIVE_MAX_MIN * 60000) {
    return [pscustomobject]@{ t = [double]$o.t; kn = $o.kn; gust = $o.gust; dir = $o.dir; dirTxt = (Get-Compass $o.dir); src = 'Marignane'; panne = $false }
  }
  $null
}

function Get-VentModel($data, $spot, [string]$level, $live, [double]$now) {
  $L = if ($level -eq 'offshore') { 6 } else { 5 }
  $rows = @(foreach ($h in $spot.hours) { [pscustomobject]@{ t = [double]$h[0]; kn = $h[1]; gust = $h[2]; dir = $h[3]; day = [bool]$h[4]; score = $h[$L] } })
  $nearest = {
    param([double]$t)
    $b = $null
    foreach ($r in $rows) { if (-not $b -or [math]::Abs($r.t - $t) -lt [math]::Abs($b.t - $t)) { $b = $r } }
    if ($b -and [math]::Abs($b.t - $t) -le 3600000) { $b } else { $null }
  }
  $cur = & $nearest $now
  $in2 = & $nearest ($now + 7200000)
  $sess = Get-Sessions $spot $level
  $days = @(foreach ($d in @($data.days)[0..3]) {
    $rr = @($rows | Where-Object { $_.day -and (Get-DayKey $_.t) -eq $d })
    $best = $null; $max = $null
    foreach ($r in $rr) {
      if ($null -ne $r.score -and (-not $best -or $r.score -gt $best.score)) { $best = $r }
      if ($null -ne $r.kn -and (-not $max -or $r.kn -gt $max.kn)) { $max = $r }
    }
    $ss = @($sess | Where-Object { (Get-DayKey $_.s) -eq $d })
    $strip = @(foreach ($hr in 7..21) {
      $r = $rr | Where-Object { (Get-Hour $_.t) -eq $hr } | Select-Object -First 1
      if ($r) { Get-Stars $r.score } else { -1 }
    })
    [pscustomobject]@{ key = $d; label = (Get-DayLabel $d $now); stars = $(if ($best) { Get-Stars $best.score } else { 0 })
      kn = $(if ($max) { $max.kn } else { $null }); dir = $(if ($max) { $max.dir } else { $null })
      cr = $(if ($ss.Count) { Get-Span $ss[0] } else { '—' }); strip = $strip }
  })
  $nowV = $null
  if ($live -and -not $live.panne) { $nowV = $live }
  elseif ($cur) { $nowV = [pscustomobject]@{ t = $cur.t; kn = $cur.kn; gust = $cur.gust; dir = $cur.dir; dirTxt = (Get-Compass $cur.dir); src = 'prévu'; panne = $false } }
  # grand format : aujourd'hui et demain heure par heure, 7 h → 21 h (Tom, 11/11 : « juste le jour même et le lendemain, avec plus de détail »)
  $k0 = if ((To-Local $now).Hour -ge 21) { 1 } else { 0 }        # après 21 h : demain et après-demain
  $detail = @(foreach ($k in $k0, ($k0 + 1)) {
    $d = Get-DayKey ($now + $k * 86400000)
    $rr = @($rows | Where-Object { (Get-DayKey $_.t) -eq $d })
    $hours = @(foreach ($hr in 7..21) {
      $r = $rr | Where-Object { (Get-Hour $_.t) -eq $hr } | Select-Object -First 1
      [pscustomobject]@{ h = $hr; kn = $(if ($r) { $r.kn } else { $null }); gust = $(if ($r) { $r.gust } else { $null }); dir = $(if ($r) { $r.dir } else { $null })
        stars = $(if ($r -and $r.day) { Get-Stars $r.score } else { 0 }); has = [bool]$r; past = [bool]($r -and $r.t + 3600000 -le $now) }
    })
    $have = @($hours | Where-Object { $_.has -and -not $_.past })
    $max = $null; $gmax = $null; $best = 0
    foreach ($x in $have) {
      if ($null -ne $x.kn -and (-not $max -or $x.kn -gt $max.kn)) { $max = $x }
      if ($null -ne $x.gust -and ($null -eq $gmax -or $x.gust -gt $gmax)) { $gmax = $x.gust }
      if ($x.stars -gt $best) { $best = $x.stars }
    }
    $ss = @($sess | Where-Object { (Get-DayKey $_.s) -eq $d -and [double]$_.e -gt $now })
    [pscustomobject]@{ key = $d; label = $(if ($k -eq 0) { "Aujourd'hui" } elseif ($k -eq 1) { 'Demain' } else { 'Après-demain' })
      date = ([datetime]::ParseExact($d, 'yyyy-MM-dd', $INV)).ToString('dddd d', [Globalization.CultureInfo]::new('fr-FR'))
      stars = $best; kn = $(if ($max) { $max.kn } else { $null }); dir = $(if ($max) { $max.dir } else { $null }); gust = $gmax
      cr = $(if ($ss.Count) { ($ss | ForEach-Object { Get-Span $_ }) -join ' · ' } else { 'pas de créneau' }); hours = $hours }
  })
  [pscustomobject]@{ spot = $spot; level = $level; now = $nowV; panne = [bool]($live -and $live.panne); in2 = $in2; days = $days; detail = $detail
    next = @($rows | Where-Object { $_.t -ge $now - 3600000 } | Select-Object -First 12) }
}

function Get-CreneauxModel($data, $reg, [double]$now) {
  $level = if ($reg.mode -eq 'offshore') { 'offshore' } else { 'secu' }
  $onlyNear = $reg.creneauxSpots -eq 'proches'   # (PowerShell ne distingue pas $near de $NEAR)
  $spots = @($data.spots)
  if ($onlyNear) { $spots = @($spots | Where-Object { $NEAR -contains $_.id }) }
  $all = @(foreach ($sp in $spots) { foreach ($s in (Get-Sessions $sp $level)) { if ([double]$s.e -gt $now) {
    [pscustomobject]@{ spot = $sp; s = [double]$s.s; e = [double]$s.e; h = $s.h; p = $s.p; kn = $s.kn; g = $s.g; dir = $s.dir; stars = (Get-Stars $s.p) } } } })
  # du meilleur au moins bon : étoiles, puis durée (8 h valent mieux que 2 h), puis note, puis le plus tôt
  $list = @($all | Sort-Object -Property @{ Expression = 'stars'; Descending = $true }, @{ Expression = 'h'; Descending = $true }, @{ Expression = 'p'; Descending = $true }, @{ Expression = 's'; Descending = $false })
  $days = @(@($data.days)[0..4])
  $grid = @(foreach ($sp in ($spots | Select-Object -First 8)) {
    $sess = Get-Sessions $sp $level
    $cells = @(for ($i = 0; $i -lt $days.Count; $i++) {
      $x = @($sp.daily.$level)[$i]
      $ses = @($sess | Where-Object { (Get-DayKey $_.s) -eq $days[$i] })
      # vent max de la journée (heures de jour), affiché dans les cases sans créneau, comme l'ancien widget
      $kmax = ($sp.hours | Where-Object { $_[4] -and (Get-DayKey $_[0]) -eq $days[$i] -and $null -ne $_[1] } | ForEach-Object { [double]$_[1] } | Measure-Object -Maximum).Maximum
      if (-not $ses.Count -or -not $x) { [pscustomobject]@{ has = $false; n = @(0, 0, 0, 1); label = ''; kn = $kmax } }
      else {
        $top = if ($x[2]) { 3 } elseif ($x[1]) { 2 } else { 1 }
        $hours = if ($x[$top - 1]) { $x[$top - 1] } else { ($ses | Measure-Object -Property h -Sum).Sum }
        [pscustomobject]@{ has = $true; n = @($x); label = "${hours}h"; kn = $kmax }
      }
    })
    [pscustomobject]@{ spot = $sp; cells = $cells }
  })
  [pscustomobject]@{ level = $level; label = "$(if ($level -eq 'offshore') { 'OffShore' } else { 'Sécu first' })$(if ($onlyNear) { ' · proches' } else { '' })"
    list = $list; grid = $grid; days = $days; dayLabels = @($days | ForEach-Object { Get-DayLabel $_ $now }) }
}

function Get-CreneauLink($c) { "$($APP_URL)#/spot/$($c.spot.id)?day=$([uri]::EscapeDataString((To-Local $c.s).ToString('dd/MM/yyyy', $INV)))" }
function Get-CreneauWhen($c, [double]$now) { "$(Get-DayLabel (Get-DayKey $c.s) $now -Demain) $(Get-Span $c)" }

# ---------------------------------------------------------------- Sortie pour les tests (sans interface)
if ($Model) {
  $data = Get-Content $DataFile -Raw -Encoding UTF8 | ConvertFrom-Json
  $now = if ($Now) { $Now } else { Get-NowMs }
  $script:reg = Read-Reglages
  $superLive = if ($LiveFile) { Get-Content $LiveFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }
  $spot = Find-Spot $data $script:reg.spot
  $live = Get-Live $spot $data $superLive $now
  $vm = Get-VentModel $data $spot $(if ($script:reg.mode -eq 'offshore') { 'offshore' } else { 'secu' }) $live $now
  $cm = Get-CreneauxModel $data $script:reg $now
  $out = [pscustomobject]@{
    vent = [pscustomobject]@{ spot = $vm.spot.id; short = $vm.spot.short; level = $vm.level
      now = $(if ($vm.now) { [pscustomobject]@{ kn = $vm.now.kn; gust = $vm.now.gust; dir = $vm.now.dirTxt; src = $vm.now.src } } else { $null })
      panne = $vm.panne; in2 = $(if ($vm.in2) { $vm.in2.kn } else { $null })
      days = @($vm.days | ForEach-Object { [pscustomobject]@{ label = $_.label; stars = $_.stars; kn = $_.kn; cr = $_.cr; strip = ($_.strip -join ',') } })
      next = @($vm.next | ForEach-Object { Get-Hour $_.t })
      detail = @($vm.detail | ForEach-Object { [pscustomobject]@{ label = $_.label; date = $_.date; stars = $_.stars; kn = $_.kn; gust = $_.gust; cr = $_.cr
        kns = (($_.hours | ForEach-Object { if ($_.has) { Get-Round $_.kn } else { '' } }) -join ','); starsH = (($_.hours | ForEach-Object { $_.stars }) -join ',')
        past = (($_.hours | Where-Object { $_.past } | ForEach-Object { $_.h }) -join ',') } }) }
    creneaux = [pscustomobject]@{ label = $cm.label; days = $cm.dayLabels
      list = @($cm.list | Select-Object -First 4 | ForEach-Object { [pscustomobject]@{ spot = $_.spot.short; when = (Get-CreneauWhen $_ $now); stars = $_.stars; kn = $_.kn; dir = (Get-Compass $_.dir); link = (Get-CreneauLink $_) } })
      grid = @($cm.grid | ForEach-Object { [pscustomobject]@{ spot = $_.spot.short; cells = (($_.cells | ForEach-Object { $_.label }) -join ','); kn = (($_.cells | ForEach-Object { Get-Round $_.kn }) -join ',') } }) }
  }
  [IO.File]::WriteAllText($Model, ($out | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))
  exit 0
}

# ---------------------------------------------------------------- Interface (WPF)
if (-not $Capture) {
  # une seule instance à la fois
  $createdNew = $false
  $script:mutex = New-Object System.Threading.Mutex($true, "Local\$APP_NAME", [ref]$createdNew)
  if (-not $createdNew) { exit 0 }
}

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Windows.Forms, System.Net.Http, Microsoft.VisualBasic
Add-Type -Namespace OCEAN -Name Native -MemberDefinition @'
[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetClassName(IntPtr hWnd, System.Text.StringBuilder buf, int max);
[DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
[DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr hWnd, int index);
[DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr hWnd, int index, int value);
'@
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

# Couleurs OCEAN (clair / sombre), échelle de vent façon Windguru (comme les tableaux de l'app)
$PALETTES = @{
  clair  = @{ BG = '#FFFFFF'; CELL = '#F2F3F0'; INK = '#152B33'; INK2 = '#3E5157'; INK3 = '#5C6E74'; LIVE = '#17804F'; OFF = '#D6DCD6'; LINE = '#E4E8E4'; NONE = '#E6E9E5'
    S1 = '#23A26A'; S2 = '#EE7F1B'; S3 = '#8A4FD8'; SOFT1 = '#E3F4EC'; SOFT2 = '#FDEBDC'; SOFT3 = '#F3ECFC' }
  sombre = @{ BG = '#16262C'; CELL = '#1E3138'; INK = '#EAF1EF'; INK2 = '#B7C8C6'; INK3 = '#8EA4A3'; LIVE = '#4CC38A'; OFF = '#33494F'; LINE = '#25393F'; NONE = '#25393F'
    S1 = '#4CC38A'; S2 = '#F5A04A'; S3 = '#B38BF5'; SOFT1 = '#1D3A30'; SOFT2 = '#3A2A1A'; SOFT3 = '#2E2440' }
}
$FILL = @{ 1 = '#23A26A'; 2 = '#EE7F1B'; 3 = '#8A4FD8' }   # remplissage des cases : couleurs fixes, lisibles dans les deux thèmes
$SCALE = @(@(5, '#FFFFFF', '#3E5157'), @(8, '#DDF3FA', '#152B33'), @(11, '#A9E3EE', '#152B33'), @(14, '#7FDDB0', '#0F3322'), @(17, '#B5EA62', '#21360A'),
  @(20, '#F2EC4E', '#383300'), @(23, '#FFC94D', '#3A2700'), @(26, '#FFA04A', '#3A1A00'), @(30, '#F66A4B', '#FFFFFF'), @(999, '#D9386E', '#FFFFFF'))
$SIZES = @{ petit = @(170, 170); moyen = @(364, 170); grand = @(364, 382) }

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
function Get-WindColors($kn) { $v = if ($null -eq $kn) { 0 } else { [double]$kn }; foreach ($s in $SCALE) { if ($v -lt $s[0]) { return $s } }; $SCALE[-1] }
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

function New-Arrow($from, [double]$size, $brush) {
  # flèche dans le sens où va le vent (vent « de » from)
  if ($null -eq $from) { return $null }
  $c = [System.Windows.Controls.Canvas]::new(); $c.Width = $size; $c.Height = $size
  $r = $size / 2
  $p = [System.Windows.Shapes.Polygon]::new()
  $p.Points = [System.Windows.Media.PointCollection]::new([System.Windows.Point[]]@(
    [System.Windows.Point]::new($r, $r - $r * 0.9), [System.Windows.Point]::new($r + $r * 0.6, $r + $r * 0.7),
    [System.Windows.Point]::new($r, $r + $r * 0.35), [System.Windows.Point]::new($r - $r * 0.6, $r + $r * 0.7)))
  $p.Fill = $brush
  $p.RenderTransform = [System.Windows.Media.RotateTransform]::new(([double]$from + 180) % 360, $r, $r)
  [void]$c.Children.Add($p)
  $c
}
function New-Stars([int]$k, [double]$size, [bool]$all = $true) {
  $t = [System.Windows.Controls.TextBlock]::new(); $t.FontSize = $size; $t.FontWeight = 'Bold'
  $t.FontFamily = [System.Windows.Media.FontFamily]::new('Segoe UI Symbol')
  if ($k -gt 0) { $r = [System.Windows.Documents.Run]::new('★' * $k); $r.Foreground = C "S$k"; $t.Inlines.Add($r) }
  if ($all -and $k -lt 3) { $r = [System.Windows.Documents.Run]::new('★' * (3 - $k)); $r.Foreground = C 'OFF'; $t.Inlines.Add($r) }
  $t
}
function New-CellNum($kn, [double]$w, [double]$h, [double]$size) {
  $sc = Get-WindColors $kn
  $b = New-Box (Get-Brush $sc[1]) 5 $null; $b.Width = $w; $b.Height = $h
  $t = T (Get-Round $kn) $size (Get-Brush $sc[2]) 'Black'; $t.HorizontalAlignment = 'Center'; $t.VerticalAlignment = 'Center'
  $b.Child = $t; $b
}
function Center($el) { if ($null -ne $el) { $el.HorizontalAlignment = 'Center' }; $el }

# ------------------------------------------------ Carte Vent
function Get-SrcText($m, [double]$now, [switch]$Short) {
  if ($m.panne) { return 'balise en panne' }
  if (-not $m.now) { return 'pas de vent' }
  if ($m.now.src -eq 'prévu') { return 'prévu' }
  if ($Short) { return "● $(Get-Ago $m.now.t $now)" }
  "● $(if ($m.now.src -eq 'balise') { 'balise' } else { 'Marignane' }) · $(Get-Ago $m.now.t $now)"
}
function Get-SrcBrush($m) { if ($m.now -and $m.now.src -ne 'prévu') { C 'LIVE' } else { C 'INK3' } }
function New-BigNow($m, [double]$size) {
  $s = New-Stack 'Horizontal'
  $n = Add $s (T $(if ($m.now) { Get-Round $m.now.kn } else { '–' }) $size (C 'INK') 'Black'); $n.Margin = Th 0 0 6 0
  $c = Add $s (New-Stack); $c.VerticalAlignment = 'Center'
  if ($m.now) { [void](Add $c (New-Arrow $m.now.dir ([math]::Round($size / 2.2)) (C 'INK'))) }
  $dt = if ($m.now) { if ($m.now.dirTxt) { $m.now.dirTxt } else { Get-Compass $m.now.dir } } else { '' }
  [void](Add $c (T "nd $dt" ([math]::Max(10, [math]::Round($size / 3.7))) (C 'INK') 'Bold'))
  $s
}
function Get-GustText($m) {
  if ($m.now -and $null -ne $m.now.gust) { "$(if ($m.now.src -eq 'balise') { 'max' } else { 'rafales' }) $(Get-Round $m.now.gust) nd" } else { '' }
}
function New-VentCard($m, [string]$size, [double]$now) {
  $spot = $m.spot
  $root = New-Dock
  if ($size -eq 'petit') {
    $top = Add $root (Dock (New-Dock) 'Top')
    [void](Add $top (Dock (T (Get-SrcText $m $now) 10 (Get-SrcBrush $m) 'Bold') 'Right'))
    [void](Add $top (T $spot.short 14 (C 'INK') 'Black'))
    $bottom = Add $root (Dock (New-Dock) 'Bottom')
    [void](Add $bottom (Dock (New-Stars $(if ($m.days.Count) { $m.days[0].stars } else { 0 }) 12) 'Right'))
    [void](Add $bottom (T "Dans 2 h $(if ($m.in2) { Get-Round $m.in2.kn } else { '–' })" 12 (C 'INK2') 'SemiBold'))
    $g = Add $root (Dock (T (Get-GustText $m) 12 (C 'INK2')) 'Bottom'); $g.Margin = Th 0 0 0 6
    $big = Add $root (New-BigNow $m 44); $big.VerticalAlignment = 'Center'
    return $root
  }
  if ($size -eq 'moyen') {
    $row = New-Stack 'Horizontal'
    $left = Add $row (New-Dock); $left.Width = 108; $left.Margin = Th 0 0 10 0
    [void](Add $left (Dock (T $spot.short 14 (C 'INK') 'Black') 'Top'))
    [void](Add $left (Dock (T (Get-SrcText $m $now -Short) 10 (Get-SrcBrush $m) 'Bold') 'Top'))
    $gust = if ($m.now -and $null -ne $m.now.gust) { "raf. $(Get-Round $m.now.gust) · " } else { '' }
    [void](Add $left (Dock (T "${gust}2 h : $(if ($m.in2) { Get-Round $m.in2.kn } else { '–' })" 11 (C 'INK2')) 'Bottom'))
    $big = Add $left (New-BigNow $m 38); $big.VerticalAlignment = 'Center'
    foreach ($d in $m.days) {
      $col = Add $row (New-Box (C 'CELL') 10 (Th 2 6 2 6)); $col.Width = 50; $col.Margin = Th 0 0 4 0
      $st = New-Stack; $col.Child = $st
      [void](Add $st (Center (T $d.label 11 (C 'INK') 'Black')))
      $x = Add $st (Center (New-Stars $d.stars 10)); $x.Margin = Th 0 3 0 3
      [void](Add $st (Center (New-CellNum $d.kn 36 20 13)))
      $a = Add $st (Center (New-Arrow $d.dir 13 (C 'INK2'))); if ($a) { $a.Margin = Th 0 4 0 4 }
      [void](Add $st (Center (T $d.cr 10 (C 'INK2') 'SemiBold')))
    }
    $root.Children.Add($row) | Out-Null
    return $root
  }
  # grand
  $st = New-Stack; [void]$root.Children.Add($st)
  $top = Add $st (New-Dock)
  [void](Add $top (Dock (T (Get-SrcText $m $now) 10 (Get-SrcBrush $m) 'Bold') 'Right'))
  [void](Add $top (T $spot.name 15 (C 'INK') 'Black'))
  $r = Add $st (New-Dock); $r.Margin = Th 0 4 0 8
  $rr = Add $r (Dock (New-Stack) 'Right'); $rr.VerticalAlignment = 'Center'
  [void](Add $rr (T (Get-GustText $m) 12 (C 'INK2') 'SemiBold'))
  [void](Add $rr (T $(if ($m.in2) { "dans 2 h : $(Get-Round $m.in2.kn) nd $(Get-Compass $m.in2.dir)" } else { '' }) 12 (C 'INK2') 'SemiBold'))
  [void](Add $r (New-BigNow $m 34))
  # aujourd'hui et demain, heure par heure de 7 h à 21 h : vent, rafales, direction, étoiles (heures passées estompées)
  $cw = 21.6
  foreach ($d in $m.detail) {
    $hd = Add $st (New-Dock); $hd.Margin = Th 0 6 0 3
    $right = Add $hd (Dock (New-Stack 'Horizontal') 'Right')
    if ($null -ne $d.kn) {
      [void](Add $right (T "max $(Get-Round $d.kn) nd $(Get-Compass $d.dir)" 11 (C 'INK') 'Bold'))
      if ($null -ne $d.gust) { [void](Add $right (T " · raf. $(Get-Round $d.gust)" 11 (C 'INK2'))) }
    }
    $left = Add $hd (New-Stack 'Horizontal')
    [void](Add $left (T $d.label 13 (C 'INK') 'Black'))
    $dt = Add $left (T " $($d.date)" 11 (C 'INK3')); $dt.VerticalAlignment = 'Bottom'
    $sx = Add $left (New-Stars $d.stars 11 $false); $sx.Margin = Th 6 0 0 0; $sx.VerticalAlignment = 'Center'
    $box = Add $st (New-Box (C 'CELL') 10 (Th 4 5 4 4))
    $g = [System.Windows.Controls.Grid]::new(); $box.Child = $g
    foreach ($i in 0..4) { $rd = [System.Windows.Controls.RowDefinition]::new(); $rd.Height = [System.Windows.GridLength]::Auto; $g.RowDefinitions.Add($rd) }
    $col = 0
    foreach ($x in $d.hours) {
      $cd = [System.Windows.Controls.ColumnDefinition]::new(); $cd.Width = [System.Windows.GridLength]::new($cw); $g.ColumnDefinitions.Add($cd)
      $cells = @()
      $hl = T ([string]$x.h) 9 (C 'INK3') 'SemiBold'; $hl.HorizontalAlignment = 'Center'; $cells += , @($hl, 0)
      if ($x.has) {
        $n = New-CellNum $x.kn ($cw - 2) 18 11; $n.HorizontalAlignment = 'Center'; $n.Margin = Th 0 1 0 1; $cells += , @($n, 1)
        $gt = T $(if ($null -ne $x.gust) { Get-Round $x.gust } else { '' }) 9 (C 'INK2'); $gt.HorizontalAlignment = 'Center'; $cells += , @($gt, 2)
        $ar = New-Arrow $x.dir 11 (C 'INK2'); if ($ar) { $ar.HorizontalAlignment = 'Center'; $ar.Margin = Th 0 1 0 2; $cells += , @($ar, 3) }
      }
      $sb = New-Box $(if ($x.stars -gt 0) { C "S$($x.stars)" } else { C 'NONE' }) 2 $null; $sb.Height = 5; $sb.Margin = Th 1 1 1 0; $cells += , @($sb, 4)
      foreach ($c in $cells) {
        [System.Windows.Controls.Grid]::SetColumn($c[0], $col); [System.Windows.Controls.Grid]::SetRow($c[0], $c[1])
        if ($x.past -or -not $x.has) { $c[0].Opacity = 0.35 }
        [void]$g.Children.Add($c[0])
      }
      $col++
    }
    $cr = Add $st (T "Créneau : $($d.cr)" 11 (C 'INK2') 'SemiBold'); $cr.Margin = Th 2 3 0 0
  }
  $lg = Add $st (T 'nœuds · rafales · direction · étoiles (vert ★, orange ★★, violet ★★★)' 9 (C 'INK3')); $lg.Margin = Th 0 6 0 0
  return $root
}

# ------------------------------------------------ Carte Créneaux
function New-Fill($n, [double]$w, [double]$h) {
  # case remplie selon les heures à 3, 2 et 1 étoiles (comme la Prévision 5 jours de l'app) : bandes violet, orange, vert
  $tot = [math]::Max(1, [double]$n[3]); $used = 0.0
  $grid = [System.Windows.Controls.Grid]::new(); $grid.Width = $w; $grid.Height = $h
  $grid.Clip = [System.Windows.Media.RectangleGeometry]::new([System.Windows.Rect]::new(0, 0, $w, $h), 6, 6)
  $col = 0
  foreach ($k in 3, 2, 1) {
    $part = [math]::Min([double]$n[$k - 1], $tot - $used); if ($part -le 0) { continue }
    $cd = [System.Windows.Controls.ColumnDefinition]::new(); $cd.Width = [System.Windows.GridLength]::new($part, 'Star'); $grid.ColumnDefinitions.Add($cd)
    $r = [System.Windows.Shapes.Rectangle]::new(); $r.Fill = Get-Brush $FILL[$k]
    [System.Windows.Controls.Grid]::SetColumn($r, $col); [void]$grid.Children.Add($r)
    $used += $part; $col++
  }
  if ($used -lt $tot) { $cd = [System.Windows.Controls.ColumnDefinition]::new(); $cd.Width = [System.Windows.GridLength]::new($tot - $used, 'Star'); $grid.ColumnDefinitions.Add($cd) }
  $grid
}
function New-NoCreneau($cm) {
  $d = New-Dock
  [void](Add $d (Dock (T 'Créneaux vent' 14 (C 'INK') 'Black') 'Top'))
  [void](Add $d (Dock (T $cm.label 10 (C 'INK3')) 'Bottom'))
  $t = Add $d (T 'Pas de créneau dans les 5 jours' 13 (C 'INK2') 'SemiBold'); $t.TextWrapping = 'Wrap'; $t.VerticalAlignment = 'Center'
  $d
}
function New-CreneauxCard($cm, [string]$size, [double]$now) {
  $list = @($cm.list)
  if ($size -ne 'grand' -and -not $list.Count) { return New-NoCreneau $cm }
  if ($size -eq 'petit') {
    $c = $list[0]
    $d = New-Dock; $d.Tag = Get-CreneauLink $c
    [void](Add $d (Dock (T 'MEILLEUR CRÉNEAU' 10 (C 'INK3') 'Bold') 'Top'))
    $s = Add $d (Dock (New-Stars $c.stars 18 $false) 'Top'); $s.Margin = Th 0 4 0 0
    [void](Add $d (Dock (T "$(Get-Round $c.kn) nd $(Get-Compass $c.dir)$(if ($c.g) { " · raf. $($c.g)" } else { '' })" 12 (C 'INK') 'Bold') 'Bottom'))
    $mid = Add $d (New-Stack); $mid.VerticalAlignment = 'Bottom'; $mid.Margin = Th 0 0 0 4
    [void](Add $mid (T $c.spot.short 18 (C 'INK') 'Black'))
    [void](Add $mid (T (Get-CreneauWhen $c $now) 13 (C 'INK2') 'SemiBold'))
    return $d
  }
  if ($size -eq 'moyen') {
    $c = $list[0]
    $row = New-Dock
    $best = Add $row (Dock (New-Box (C "SOFT$($c.stars)") 14 (Th 10 10 10 10)) 'Left'); $best.Width = 120; $best.Margin = Th 0 0 12 0; $best.Tag = Get-CreneauLink $c
    if (-not $c.stars) { $best.Background = C 'CELL' }
    $bd = New-Dock; $best.Child = $bd
    [void](Add $bd (Dock (New-Stars $c.stars 16 $false) 'Top'))
    [void](Add $bd (Dock (T "$(Get-Round $c.kn) nd $(Get-Compass $c.dir)" 12 (C 'INK') 'Bold') 'Bottom'))
    $bm = Add $bd (New-Stack); $bm.VerticalAlignment = 'Bottom'; $bm.Margin = Th 0 0 0 4
    [void](Add $bm (T $c.spot.short 15 (C 'INK') 'Black'))
    [void](Add $bm (T (Get-CreneauWhen $c $now) 12 (C 'INK2') 'SemiBold'))
    $right = Add $row (New-Dock)
    [void](Add $right (Dock (T $cm.label 9 (C 'INK3')) 'Bottom'))
    $rs = Add $right (New-Stack)
    foreach ($x in ($list | Select-Object -Skip 1 -First 3)) {
      $it = Add $rs (New-Stack); $it.Margin = Th 0 0 0 6; $it.Tag = Get-CreneauLink $x; $it.Background = [System.Windows.Media.Brushes]::Transparent
      $a = Add $it (New-Dock); [void](Add $a (Dock (New-Stars $x.stars 11 $false) 'Right')); [void](Add $a (T $x.spot.short 13 (C 'INK') 'Black'))
      $b = Add $it (New-Dock); [void](Add $b (Dock (T "$(Get-Round $x.kn) nd $(Get-Compass $x.dir)" 11 (C 'INK') 'Bold') 'Right')); [void](Add $b (T (Get-CreneauWhen $x $now) 11 (C 'INK2')))
    }
    if ($list.Count -lt 2) { [void](Add $rs (T "Pas d'autre créneau en vue" 11 (C 'INK3'))) }
    return $row
  }
  # grand (Tom, 11/11 : « comme l'ancien ») : meilleur créneau en haut, puis spots en colonnes et jours en lignes
  $st = New-Stack
  $head = Add $st (New-Dock); $head.Margin = Th 0 0 0 8
  [void](Add $head (Dock (T $cm.label 10 (C 'INK3')) 'Right')); [void](Add $head (T 'Créneaux vent' 15 (C 'INK') 'Black'))
  if ($list.Count) {
    $c = $list[0]
    $b = Add $st (New-Box $(if ($c.stars) { C "SOFT$($c.stars)" } else { C 'CELL' }) 14 (Th 12 9 12 10)); $b.Margin = Th 0 0 0 10; $b.Tag = Get-CreneauLink $c
    $bs = New-Stack; $b.Child = $bs
    $l1 = Add $bs (New-Dock)
    $pill = Add $l1 (Dock (New-Box $(if ($c.stars) { Get-Brush $FILL[[int]$c.stars] } else { C 'OFF' }) 8 (Th 7 1 7 1)) 'Right'); $pill.Child = T "$($c.h)h" 11 (Get-Brush '#FFFFFF') 'Black'
    [void](Add $l1 (T 'MEILLEUR CRÉNEAU' 10 (C 'INK3') 'Bold'))
    $day = (To-Local $c.s).ToString('dddd d', [Globalization.CultureInfo]::new('fr-FR'))
    $day = $day.Substring(0, 1).ToUpper() + $day.Substring(1)
    $w = Add $bs (T "$day · $(Get-Hour $c.s) h – $(Get-Hour $c.e) h" 19 (C 'INK') 'Black'); $w.Margin = Th 0 2 0 0
    $l3 = Add $bs (New-Stack 'Horizontal'); $l3.Margin = Th 0 1 0 2
    [void](Add $l3 (T $c.spot.name 13 (C 'INK') 'SemiBold'))
    $sx = Add $l3 (New-Stars $c.stars 13 $false); $sx.Margin = Th 8 0 0 0
    [void](Add $bs (T "$(Get-Round $c.kn) nd $(Get-Compass $c.dir)$(if ($c.g) { " · raf. $(Get-Round $c.g)" } else { '' })" 12 (C 'INK2') 'Bold'))
  } else { $t = Add $st (T 'Pas de créneau dans les 5 jours' 13 (C 'INK2') 'SemiBold'); $t.Margin = Th 0 0 0 10 }
  $HEAD = @{ 'la-franqui' = 'Franqui'; 'espiguette' = 'Espig.'; 'almanarre' = 'Alman.'; 'la-grande-motte' = 'G-Motte' }
  $nameW = 40; $n = [math]::Max(1, $cm.grid.Count); $cw = [math]::Floor((336 - $nameW) / $n) - 3
  $hdr = Add $st (New-Stack 'Horizontal'); $hdr.Margin = Th $nameW 0 0 3
  foreach ($g in $cm.grid) {
    $lab = if ($HEAD.ContainsKey($g.spot.id)) { $HEAD[$g.spot.id] } else { $g.spot.short }
    $h = Add $hdr (T $lab 9 (C 'INK3') 'Bold'); $h.Width = $cw; $h.Margin = Th 3 0 0 0; $h.TextAlignment = 'Center'; $h.TextTrimming = 'None'
  }
  for ($i = 0; $i -lt $cm.days.Count; $i++) {
    $r = Add $st (New-Stack 'Horizontal'); $r.Margin = Th 0 0 0 3
    $dl = [datetime]::ParseExact($cm.days[$i], 'yyyy-MM-dd', $INV)
    $lab = if ($i -eq 0) { 'Auj.' } else { $dl.ToString('ddd d', [Globalization.CultureInfo]::new('fr-FR')).Replace('.', '') }
    $dn = Add $r (T ($lab.Substring(0, 1).ToUpper() + $lab.Substring(1)) 11 (C 'INK') 'Black'); $dn.Width = $nameW; $dn.VerticalAlignment = 'Center'
    foreach ($g in $cm.grid) {
      $x = $g.cells[$i]
      $cell = Add $r (New-Box (C 'CELL') 6 $null); $cell.Width = $cw; $cell.Height = 28; $cell.Margin = Th 3 0 0 0
      if ($x.has) {
        $cell.Tag = "$($APP_URL)#/spot/$($g.spot.id)?day=$([uri]::EscapeDataString($dl.ToString('dd/MM/yyyy', $INV)))"
        $layers = [System.Windows.Controls.Grid]::new(); $cell.Child = $layers
        [void]$layers.Children.Add((New-Fill $x.n $cw 28))
        $pill = New-Box (C 'BG') 7 (Th 4 1 4 1); $pill.HorizontalAlignment = 'Center'; $pill.VerticalAlignment = 'Center'
        $pill.Child = T $x.label 10 (C 'INK') 'Black'; [void]$layers.Children.Add($pill)
      } elseif ($null -ne $x.kn) {
        $t = T (Get-Round $x.kn) 10 (C 'INK3') 'SemiBold'; $t.HorizontalAlignment = 'Center'; $t.VerticalAlignment = 'Center'; $cell.Child = $t
      }
    }
  }
  $lg = Add $st (T 'case : heures au meilleur niveau (vert ★, orange ★★, violet ★★★) ; sinon vent max du jour' 9 (C 'INK3')); $lg.Margin = Th 0 4 0 0; $lg.TextWrapping = 'Wrap'
  $st
}

# ------------------------------------------------ Assemblage
function New-Card($content, [string]$size, [string]$url, [string]$foot) {
  $wh = $SIZES[$size]
  $b = New-Box (C 'BG') 22 (Th 14 14 14 12); $b.Width = $wh[0]; $b.MinHeight = $wh[1]; $b.Margin = Th 12 12 12 12
  $b.BorderBrush = C 'LINE'; $b.BorderThickness = Th 1 1 1 1
  $sh = [System.Windows.Media.Effects.DropShadowEffect]::new(); $sh.BlurRadius = 20; $sh.ShadowDepth = 4; $sh.Direction = 270; $sh.Opacity = $(if ($script:isDark) { 0.45 } else { 0.18 })
  $b.Effect = $sh; $b.Tag = $url; $b.Cursor = [System.Windows.Input.Cursors]::Hand
  if ($foot) {
    $d = New-Dock; $f = Add $d (Dock (T $foot 9 (C 'INK3')) 'Bottom'); $f.Margin = Th 0 2 0 0
    [void]$d.Children.Add($content); $b.Child = $d
  } else { $b.Child = $content }
  $b
}
function New-Message([string]$title, [string]$msg) {
  $s = New-Stack; [void](Add $s (T $title 14 (C 'INK') 'Black')); $t = Add $s (T $msg 12 (C 'INK2')); $t.TextWrapping = 'Wrap'; $t.Margin = Th 0 6 0 0
  New-Card $s 'petit' $APP_URL $null
}
function New-WidgetContent($data, $superLive, [bool]$cached, [double]$now) {
  $reg = $script:reg
  Set-Palette $reg.theme
  $panel = New-Stack $(if ($reg.disposition -eq 'colonne') { 'Vertical' } else { 'Horizontal' })
  if (-not $data) { [void](Add $panel (New-Message 'OCEAN' 'Pas de données pour le moment (hors ligne ?). Nouvel essai dans quelques minutes.')); return $panel }
  $foot = if ($cached) { 'hors ligne : dernières données' } else { $null }
  $level = if ($reg.mode -eq 'offshore') { 'offshore' } else { 'secu' }
  if ($reg.vent -ne 'masque') {
    $spot = Find-Spot $data $reg.spot
    $m = Get-VentModel $data $spot $level (Get-Live $spot $data $superLive $now) $now
    [void](Add $panel (New-Card (New-VentCard $m $reg.vent $now) $reg.vent "$($APP_URL)#/spot/$($spot.id)" $foot))
  }
  if ($reg.creneaux -ne 'masque') {
    $cm = Get-CreneauxModel $data $reg $now
    [void](Add $panel (New-Card (New-CreneauxCard $cm $reg.creneaux $now) $reg.creneaux "$($APP_URL)#/wind/prevision" $foot))
  }
  $panel
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
  New-Item -ItemType Directory -Force -Path $Capture | Out-Null
  $data = if ($DataFile) { Get-Content $DataFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }
  $now = if ($Now) { $Now } else { Get-NowMs }
  $base = Read-Reglages
  $cases = @(
    @{ n = 'vent-petit-clair'; r = @{ vent = 'petit'; creneaux = 'masque'; theme = 'clair' } },
    @{ n = 'vent-moyen-clair'; r = @{ vent = 'moyen'; creneaux = 'masque'; theme = 'clair' } },
    @{ n = 'vent-grand-sombre'; r = @{ vent = 'grand'; creneaux = 'masque'; theme = 'sombre' } },
    @{ n = 'creneaux-petit-sombre'; r = @{ vent = 'masque'; creneaux = 'petit'; theme = 'sombre' } },
    @{ n = 'creneaux-moyen-clair'; r = @{ vent = 'masque'; creneaux = 'moyen'; theme = 'clair' } },
    @{ n = 'creneaux-grand-sombre'; r = @{ vent = 'masque'; creneaux = 'grand'; theme = 'sombre' } },
    @{ n = 'ensemble-moyen-sombre'; r = @{ vent = 'moyen'; creneaux = 'moyen'; theme = 'sombre' } },
    @{ n = 'ensemble-grand-clair-offshore'; r = @{ vent = 'grand'; creneaux = 'grand'; theme = 'clair'; mode = 'offshore'; spot = 'Beauduc' } },
    @{ n = 'hors-ligne'; r = @{ vent = 'moyen'; creneaux = 'moyen'; theme = 'clair' }; nodata = $true })
  foreach ($c in $cases) {
    $script:reg = [ordered]@{}; foreach ($k in $base.Keys) { $script:reg[$k] = $base[$k] }; foreach ($k in $c.r.Keys) { $script:reg[$k] = $c.r[$k] }
    $el = New-WidgetContent $(if ($c.nodata) { $null } else { $data }) $null $false $now
    $frame = New-Box $(if ($script:isDark) { Get-Brush '#0B1418' } else { Get-Brush '#D9DED9' }) 0 (Th 8 8 8 8); $frame.Child = $el
    Save-Png $frame (Join-Path $Capture "$($c.n).png")
    Write-Host "[image] $($c.n).png"
  }
  exit 0
}

# ---------------------------------------------------------------- Fenêtre
$script:reg = Read-Reglages
$script:data = $null; $script:cached = $false; $script:superLive = $null
$script:fetch = $null; $script:liveFetch = $null
$script:http = [System.Net.Http.HttpClient]::new(); $script:http.Timeout = [TimeSpan]::FromSeconds(20)

function Read-Cache {
  try { if (Test-Path $CACHE_FILE) { $script:data = Get-Content $CACHE_FILE -Raw -Encoding UTF8 | ConvertFrom-Json; $script:cached = $true } }
  catch { Write-Log "Cache illisible : $_" }
}
function Start-DataFetch { if (-not $script:fetch) { $script:fetch = $script:http.GetByteArrayAsync($DATA_URL + '?t=' + [int64](Get-NowMs)) } }
function Start-LiveFetch {
  $u = Get-SuperPrevisionUrl
  if (-not $u) { $script:superLive = $null; return }
  if (-not $script:liveFetch) { $script:liveFetch = $script:http.GetByteArrayAsync($u + $(if ($u.Contains('?')) { '&' } else { '?' }) + 'action=live') }
}
function Receive-Fetches {
  $changed = $false
  if ($script:fetch -and $script:fetch.IsCompleted) {
    $f = $script:fetch; $script:fetch = $null
    try {
      if ($f.IsFaulted) { throw $f.Exception.GetBaseException() }
      $txt = [Text.Encoding]::UTF8.GetString($f.Result)
      $j = $txt | ConvertFrom-Json
      if (-not $j.spots) { throw 'données vides' }
      $script:data = $j; $script:cached = $false; $changed = $true
      try { New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null; [IO.File]::WriteAllText($CACHE_FILE, $txt, [Text.UTF8Encoding]::new($false)) } catch {}
    } catch {
      Write-Log "Données OCEAN : $_"
      if (-not $script:cached -and $script:data) { $script:cached = $true; $changed = $true }
    }
  }
  if ($script:liveFetch -and $script:liveFetch.IsCompleted) {
    $f = $script:liveFetch; $script:liveFetch = $null
    try {
      if ($f.IsFaulted) { throw $f.Exception.GetBaseException() }
      $script:superLive = [Text.Encoding]::UTF8.GetString($f.Result) | ConvertFrom-Json; $changed = $true
    } catch { Write-Log "Balise (super prévision) : $_" }
  }
  if ($changed) { Update-Widget }
}

$win = [System.Windows.Window]::new()
$win.Title = 'OCEAN'
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
  if ([int]$script:reg.ecran -ge 2) {
    $others = @([System.Windows.Forms.Screen]::AllScreens | Where-Object { -not $_.Primary } | Sort-Object { $_.Bounds.X })
    if ($others.Count) { $target = $others[[math]::Min($others.Count, [int]$script:reg.ecran - 1) - 1] }
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
  # par défaut : en haut à droite de l'écran choisi
  $wa = (Get-TargetScreen).WorkingArea
  $src = [System.Windows.PresentationSource]::FromVisual($win)
  $tl = [System.Windows.Point]::new($wa.Left, $wa.Top); $br = [System.Windows.Point]::new($wa.Right, $wa.Bottom)
  if ($src) { $tl = $src.CompositionTarget.TransformFromDevice.Transform($tl); $br = $src.CompositionTarget.TransformFromDevice.Transform($br) }
  $left = $br.X - $win.ActualWidth - 12; $top = $tl.Y + 28
  if ($win.Left -ne $left) { $win.Left = $left }; if ($win.Top -ne $top) { $win.Top = $top }
}

function Find-Url($o) {
  while ($o) {
    if ($o -is [System.Windows.FrameworkElement] -and $o.Tag -is [string] -and $o.Tag.StartsWith('http')) { return $o.Tag }
    if ($o -is [System.Windows.Media.Visual] -or $o -is [System.Windows.Media.Media3D.Visual3D]) { $o = [System.Windows.Media.VisualTreeHelper]::GetParent($o) }
    else { $o = [System.Windows.LogicalTreeHelper]::GetParent($o) }
  }
  $APP_URL
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
  # jamais les deux cartes masquées
  if ($value -eq 'masque' -and (($key -eq 'vent' -and $script:reg.creneaux -eq 'masque') -or ($key -eq 'creneaux' -and $script:reg.vent -eq 'masque'))) { return }
  $script:reg[$key] = $value
  if ($key -eq 'ecran') { $script:reg.x = $null; $script:reg.y = $null }
  Save-Reglages; Update-Widget
}
function New-WidgetMenu {
  $menu = [System.Windows.Controls.ContextMenu]::new()
  [void]$menu.Items.Add((New-MenuItem 'Ouvrir OCEAN' { Start-Process $APP_URL }))
  [void]$menu.Items.Add((New-MenuItem 'Actualiser' { Start-DataFetch; Start-LiveFetch }))
  [void]$menu.Items.Add([System.Windows.Controls.Separator]::new())
  $spots = if ($script:data) { @($script:data.spots | ForEach-Object { , @($_.id, $_.name) }) } else { @(, @($script:reg.spot, $script:reg.spot)) }
  [void]$menu.Items.Add((New-ChoiceMenu 'Spot du vent' 'spot' $spots))
  [void]$menu.Items.Add((New-ChoiceMenu 'Mode' 'mode' @(@('secu', 'Sécu first'), @('offshore', 'OffShore'))))
  $tailles = @(@('petit', 'Petit'), @('moyen', 'Moyen'), @('grand', 'Grand'), @('masque', 'Masquée'))
  [void]$menu.Items.Add((New-ChoiceMenu 'Carte Vent' 'vent' $tailles))
  [void]$menu.Items.Add((New-ChoiceMenu 'Carte Créneaux' 'creneaux' $tailles))
  [void]$menu.Items.Add((New-ChoiceMenu 'Spots des créneaux' 'creneauxSpots' @(@('tous', 'Tous les spots'), @('proches', 'Proches de Montpellier (< 55 km)'))))
  [void]$menu.Items.Add((New-ChoiceMenu 'Disposition' 'disposition' @(@('cote', 'Côte à côte'), @('colonne', 'L''une sous l''autre'))))
  [void]$menu.Items.Add((New-ChoiceMenu 'Thème' 'theme' @(@('auto', 'Comme Windows'), @('clair', 'Clair'), @('sombre', 'Sombre'))))
  $screens = @(@(1, 'Écran principal'))
  $n = @([System.Windows.Forms.Screen]::AllScreens).Count
  for ($i = 2; $i -le $n; $i++) { $screens += , @($i, $(if ($i -eq 2) { 'Deuxième écran' } else { "Écran $i" })) }
  [void]$menu.Items.Add((New-ChoiceMenu 'Écran' 'ecran' $screens))
  [void]$menu.Items.Add((New-MenuItem 'Remettre en haut à droite' { $script:reg.x = $null; $script:reg.y = $null; Save-Reglages; Set-WidgetPosition }))
  [void]$menu.Items.Add([System.Windows.Controls.Separator]::new())
  $hasSp = [bool](Get-SuperPrevisionUrl)
  [void]$menu.Items.Add((New-MenuItem $(if ($hasSp) { 'Balise en direct : branchée (changer le lien…)' } else { 'Mode perso : brancher ma super prévision…' }) {
    $u = [Microsoft.VisualBasic.Interaction]::InputBox("Lien …/exec?key=… de ton script Google « super prévision ».`nIl est gardé chiffré sur ce PC, pour ton compte Windows. Laisse vide pour le retirer.", 'OCEAN · balise en direct', '').Trim()
    if ($u -match '^https://script\.google\.com/.+/exec') { Set-SuperPrevisionUrl $u; Start-LiveFetch }
    elseif (-not $u) { Set-SuperPrevisionUrl $null; $script:superLive = $null; Update-Widget }
    else { [System.Windows.MessageBox]::Show('Ce lien ne ressemble pas à un lien …/exec de script Google : rien n''a été changé.', 'OCEAN') | Out-Null }
  }))
  [void]$menu.Items.Add((New-MenuItem 'Quitter le widget' { $win.Close() }))
  $menu
}

function Update-Widget {
  try {
    $now = Get-NowMs
    $win.Content = New-WidgetContent $script:data $script:superLive $script:cached $now
    if (-not ($win.ContextMenu -and $win.ContextMenu.IsOpen)) { $win.ContextMenu = New-WidgetMenu }
  } catch {
    Write-Log "Affichage : $_ $($_.ScriptStackTrace)"
  }
}

# fenêtre outil : pas d'entrée dans Alt+Tab
$win.add_SourceInitialized({
  $script:hwnd = [System.Windows.Interop.WindowInteropHelper]::new($win).Handle
  $ex = [OCEAN.Native]::GetWindowLong($script:hwnd, -20)
  [void][OCEAN.Native]::SetWindowLong($script:hwnd, -20, ($ex -bor 0x80))
})
$win.add_SizeChanged({ Set-WidgetPosition })
$win.add_StateChanged({ if ($win.WindowState -eq 'Minimized') { $win.WindowState = 'Normal' } })

# comme un widget de bureau : par-dessus le bureau quand on l'affiche (Windows + D), derrière les fenêtres sinon
function Update-ZOrder {
  $fg = [OCEAN.Native]::GetForegroundWindow()
  if ($fg -eq [IntPtr]::Zero) { return }
  [uint32]$fgPid = 0
  [void][OCEAN.Native]::GetWindowThreadProcessId($fg, [ref]$fgPid)
  if ($fgPid -eq $PID) { return }
  $sb = [System.Text.StringBuilder]::new(64)
  [void][OCEAN.Native]::GetClassName($fg, $sb, 64)
  $onDesktop = @('WorkerW', 'Progman') -contains $sb.ToString()
  if ($win.Topmost -ne $onDesktop) { $win.Topmost = $onDesktop }
}

$fast = [System.Windows.Threading.DispatcherTimer]::new(); $fast.Interval = [TimeSpan]::FromMilliseconds(250)
$fast.add_Tick({ Receive-Fetches; Update-ZOrder })
$minute = [System.Windows.Threading.DispatcherTimer]::new(); $minute.Interval = [TimeSpan]::FromMinutes(1)
$script:ticks = 0
$minute.add_Tick({
  $script:ticks++
  if ($script:ticks % $DATA_REFRESH_MIN -eq 0) { Start-DataFetch }
  if ($script:ticks % $LIVE_REFRESH_MIN -eq 0) { Start-LiveFetch }
  Update-Widget            # le temps passe (« dans 2 h », âge de la balise) et le thème de Windows peut changer
  Set-WidgetPosition       # suit un écran branché / débranché
})

Read-Cache
Update-Widget
$win.add_Loaded({ Set-WidgetPosition; Start-DataFetch; Start-LiveFetch; $fast.Start(); $minute.Start() })

$app = [System.Windows.Application]::new()
$app.ShutdownMode = 'OnMainWindowClose'
$app.add_DispatcherUnhandledException({ param($s, $e) Write-Log "Erreur : $($e.Exception.Message)"; $e.Handled = $true })
[void]$app.Run($win)
