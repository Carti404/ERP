/** Parámetros del sistema — administrador (demo, Stitch). */

export interface AdminParametrosHolidayMock {
  readonly id: string;
  readonly title: string;
  readonly sub: string;
}

export interface AdminParametrosCalendarCellMock {
  readonly label: string;
  readonly tone: 'muted' | 'day' | 'holiday';
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
    { id: 'h1', title: '1 de mayo', sub: 'Día del trabajador' },
    { id: 'h2', title: '21 de mayo', sub: 'Glorias navales' },
  ] as AdminParametrosHolidayMock[],
} as const;

export const ADMIN_PARAMETROS_CAL_MONTH = 'Mayo 2024';

/** Mini calendario (rejilla fija demo). */
export const ADMIN_PARAMETROS_CAL_CELLS: AdminParametrosCalendarCellMock[] = [
  { label: '29', tone: 'muted' },
  { label: '30', tone: 'muted' },
  { label: '1', tone: 'holiday' },
  { label: '2', tone: 'day' },
  { label: '3', tone: 'day' },
  { label: '4', tone: 'day' },
  { label: '5', tone: 'day' },
  { label: '6', tone: 'day' },
  { label: '7', tone: 'day' },
  { label: '8', tone: 'day' },
  { label: '9', tone: 'day' },
  { label: '10', tone: 'day' },
  { label: '11', tone: 'day' },
  { label: '12', tone: 'day' },
  { label: '13', tone: 'day' },
  { label: '14', tone: 'day' },
  { label: '15', tone: 'day' },
  { label: '16', tone: 'day' },
  { label: '17', tone: 'day' },
  { label: '18', tone: 'day' },
  { label: '19', tone: 'day' },
  { label: '20', tone: 'day' },
  { label: '21', tone: 'holiday' },
  { label: '22', tone: 'day' },
  { label: '23', tone: 'day' },
  { label: '24', tone: 'day' },
  { label: '25', tone: 'day' },
  { label: '26', tone: 'day' },
];
