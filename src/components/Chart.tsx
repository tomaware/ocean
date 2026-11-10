// Graphique uPlot : note (barres) + une ou deux grandeurs physiques (lignes), heure de Paris.
import { useEffect, useRef } from 'preact/hooks';
import uPlot from 'uplot';

export type Line = { label: string; values: (number | null)[]; color: string; unit: string; scale?: string; dash?: number[] };
const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888';

export function Chart({ times, score, lines, height = 240, title }: { times: number[]; score?: (number | null)[]; lines: Line[]; height?: number; title: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current || !times.length) return;
    // trou de plus d'une heure (nuit, série coupée) : point vide pour ne pas relier les courbes
    const gapAt = times.map((t, i) => i > 0 && t - times[i - 1] > 3600e3);
    const withGaps = <T,>(a: T[], fill: T | null) => a.flatMap((x, i) => (gapAt[i] ? [fill as T, x] : [x]));
    times = withGaps(times, null).map((t, i, arr) => (t === null ? (arr[i - 1] as number) + 3600e3 : t)) as number[];
    if (score) score = withGaps(score, null);
    lines = lines.map((l) => ({ ...l, values: withGaps(l.values, null) }));
    const ink = css('--c-ink-3'), grid = css('--c-line');
    const axis = { stroke: ink, grid: { stroke: grid, width: 1 }, ticks: { stroke: grid }, font: '11px Inter, system-ui' };
    const bars = uPlot.paths.bars!({ size: [0.9, 40] });
    const series: uPlot.Series[] = [{}];
    const data: uPlot.AlignedData = [times.map((t) => t / 1000)];
    if (score) {
      series.push({ label: 'Note /10', scale: 'score', paths: bars, points: { show: false }, value: (_u, v) => (v === null ? '—' : v.toFixed(1).replace('.', ',')),
        fill: (u: uPlot, si: number) => { void si; return css('--c-score-7') + '66'; }, stroke: css('--c-score-7') });
      data.push(score as number[]);
    }
    for (const l of lines) {
      series.push({ label: `${l.label} (${l.unit})`, scale: l.scale ?? l.unit, stroke: l.color, width: 2, dash: l.dash, points: { show: false }, spanGaps: false,
        value: (_u, v) => (v === null ? '—' : v.toFixed(l.unit === 'm' ? 1 : 0).replace('.', ',')) });
      data.push(l.values as number[]);
    }
    const units = [...new Set(lines.map((l) => l.scale ?? l.unit))];
    const opts: uPlot.Options = {
      width: el.current.clientWidth, height, title: undefined,
      tzDate: (ts) => uPlot.tzDate(new Date(ts * 1000), 'Europe/Paris'),
      series,
      scales: { x: { time: true }, score: { range: [0, 10] }, ...Object.fromEntries(units.map((u) => [u, { range: (_u: uPlot, mn: number, mx: number) => [Math.min(0, mn), Math.max(mx * 1.1, u === 'm' ? 1 : u === 's' ? 12 : 20)] as uPlot.Range.MinMax }])) },
      axes: [
        { ...axis, values: [[3600 * 24, '{DD}/{MM}', null, null, null, null, null, null, 1], [3600, '{H} h', '\n{DD}/{MM}', null, '\n{DD}/{MM}', null, null, null, 1]] as any },
        ...(score ? [{ ...axis, scale: 'score', size: 36, values: (_u: uPlot, v: number[]) => v.map((x) => String(x)) }] : []),
        ...units.map((u, i) => ({ ...axis, scale: u, side: 1 as const, size: 44, grid: { show: !score && i === 0, stroke: grid }, label: u, labelSize: 14 })),
      ],
      legend: { live: true },
      cursor: { points: { size: 6 } },
    };
    const u = new uPlot(opts, data, el.current);
    const ro = new ResizeObserver(() => el.current && u.setSize({ width: el.current.clientWidth, height }));
    ro.observe(el.current);
    return () => { ro.disconnect(); u.destroy(); };
  }, [times, score, lines, height]);
  return <div class="chart" ref={el} role="img" aria-label={title} />;
}
