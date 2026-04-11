/** Valores iniciales de pantalla hasta que responde el API (misma forma que el backend). */

export interface AdminParametrosHolidayRow {
  readonly id: string;
  readonly title: string;
  readonly sub: string;
  readonly date: string;
}

export const ADMIN_PARAMETROS_INITIAL = {
  monFri: {
    entry: '08:00',
    exit: '17:00',
    tolerance: 15,
  },
  saturday: {
    entry: '08:00',
    exit: '13:00',
    tolerance: 10,
  },
  snackMin: 20,
  lunchFrom: '12:00',
  lunchDurationMin: 60,
  holidays: [] as AdminParametrosHolidayRow[],
} as const;
