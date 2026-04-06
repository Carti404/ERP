export interface ScheduleBlockDto {
  entry: string;
  exit: string;
  tolerance: number;
  active: boolean;
}

export interface HolidayRowDto {
  id: string;
  date: string;
  title: string;
  sub: string;
}

export interface SystemParametersSnapshot {
  monFri: ScheduleBlockDto;
  saturday: ScheduleBlockDto;
  snackMin: number;
  lunchFrom: string;
  lunchDurationMin: number;
  holidays: HolidayRowDto[];
}

/** Cuerpo PUT: festivos sin id (el servidor regenera filas). */
export interface HolidayPutRow {
  date: string;
  title: string;
  sub: string;
}

export interface PutSystemParametersPayload {
  monFri: ScheduleBlockDto;
  saturday: ScheduleBlockDto;
  snackMin: number;
  lunchFrom: string;
  lunchDurationMin: number;
  holidays: HolidayPutRow[];
}
