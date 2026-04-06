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
    active: true,
  },
  saturday: {
    entry: '08:00',
    exit: '13:00',
    tolerance: 10,
    active: true,
  },
  snackMin: 20,
  lunchFrom: '12:00',
  lunchDurationMin: 60,
  holidays: [
    {
      id: 'local-seed',
      title: '1 de mayo',
      sub: 'Día del trabajador',
      date: '2024-05-01',
    },
    {
      id: 'local-seed-2',
      title: '21 de mayo',
      sub: 'Glorias navales',
      date: '2024-05-21',
    },
  ] as AdminParametrosHolidayRow[],
} as const;
