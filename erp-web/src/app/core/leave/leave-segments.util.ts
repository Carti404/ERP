export interface LeaveSegmentDto {
  start: string;
  end: string;
  count: number;
}

/** Normaliza a YYYY-MM-DD */
export function normalizeDateStr(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d.includes('T') ? d : `${d}T12:00:00`) : d;
  return date.toISOString().slice(0, 10);
}

/** Compara dos listas de segmentos (orden independiente). */
export function segmentsEqual(a: LeaveSegmentDto[], b: LeaveSegmentDto[]): boolean {
  const key = (segs: LeaveSegmentDto[]) =>
    [...segs]
      .map((s) => `${normalizeDateStr(s.start)}|${normalizeDateStr(s.end)}|${s.count}`)
      .sort()
      .join(',');
  return key(a) === key(b);
}

/** Convierte ms de días seleccionados a segmentos ISO. */
export function msSetToSegments(
  sortedMs: number[],
  countFn: (startMs: number, endMs: number) => number,
): LeaveSegmentDto[] {
  if (sortedMs.length === 0) return [];

  const segments: Array<{ start: number; end: number; count: number }> = [];
  let currentStart = sortedMs[0];
  let currentEnd = sortedMs[0];

  for (let i = 1; i < sortedMs.length; i++) {
    const dayMs = 24 * 60 * 60 * 1000;
    const diff = sortedMs[i] - currentEnd;
    const currEndDate = new Date(currentEnd);
    const isContiguous =
      diff <= dayMs + 1000 ||
      (currEndDate.getDay() === 6 && diff <= 2 * dayMs + 1000) ||
      (currEndDate.getDay() === 5 && diff <= 3 * dayMs + 1000);

    if (isContiguous) {
      currentEnd = sortedMs[i];
    } else {
      segments.push({
        start: currentStart,
        end: currentEnd,
        count: countFn(currentStart, currentEnd),
      });
      currentStart = sortedMs[i];
      currentEnd = sortedMs[i];
    }
  }
  segments.push({
    start: currentStart,
    end: currentEnd,
    count: countFn(currentStart, currentEnd),
  });

  return segments.map((s) => ({
    start: new Date(s.start).toISOString().slice(0, 10),
    end: new Date(s.end).toISOString().slice(0, 10),
    count: s.count,
  }));
}

/** Expande segmentos a timestamps de cada día (sin domingos opcional). */
export function segmentsToDateMsSet(
  segments: LeaveSegmentDto[],
  skipSunday = false,
): Set<number> {
  const set = new Set<number>();
  for (const seg of segments) {
    const start = new Date(normalizeDateStr(seg.start) + 'T12:00:00');
    const end = new Date(normalizeDateStr(seg.end) + 'T12:00:00');
    const cur = new Date(start);
    while (cur <= end) {
      if (!skipSunday || cur.getDay() !== 0) {
        set.add(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()).getTime());
      }
      cur.setDate(cur.getDate() + 1);
    }
  }
  return set;
}

export function countWorkingDaysBetween(startMs: number, endMs: number): number {
  let count = 0;
  const current = new Date(startMs);
  const end = new Date(endMs);
  while (current <= end) {
    if (current.getDay() !== 0) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function formatSegmentsSummary(segments: LeaveSegmentDto[]): string {
  if (!segments.length) return '';
  return segments
    .map((s) => {
      const a = new Date(s.start + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      const b = new Date(s.end + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      return a === b ? `${a} (${s.count}d)` : `${a} – ${b} (${s.count}d)`;
    })
    .join(' · ');
}
