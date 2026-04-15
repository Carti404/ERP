/**
 * Utilidades para el cálculo de vacaciones en base a la Ley "Vacaciones Dignas" (2023).
 */

export function countWorkingDays(startDate: Date | string, endDate: Date | string, holidayDates: string[] = []): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Convertimos a Set para búsqueda O(1)
  const holidaySet = new Set(holidayDates.map(d => d.slice(0, 10)));

  let workingDaysCount = 0;
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    const isoDate = currentDate.toISOString().slice(0, 10);
    
    // 0 = Sunday
    // Descontamos si es domingo O si es uno de los festivos registrados
    if (dayOfWeek !== 0 && !holidaySet.has(isoDate)) {
      workingDaysCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDaysCount;
}

export function calculateVacationDays(fechaIngreso: Date | string | null, deductionDays = 0): number {
  if (!fechaIngreso) {
    return 0; // Sin fecha de ingreso no hay días base.
  }

  const startDate = new Date(fechaIngreso);
  const today = new Date();
  
  let yearsOfService = today.getFullYear() - startDate.getFullYear();
  const m = today.getMonth() - startDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < startDate.getDate())) {
    yearsOfService--;
  }

  if (yearsOfService < 1) {
    return 0; // O proporcional si la lógica de la empresa lo dictamina.
  }

  // Ley 2023:
  let legalDays = 12;
  
  if (yearsOfService >= 1 && yearsOfService <= 5) {
    legalDays = 12 + (yearsOfService - 1) * 2;
  } else if (yearsOfService >= 6 && yearsOfService <= 10) {
    legalDays = 22;
  } else if (yearsOfService >= 11 && yearsOfService <= 15) {
    legalDays = 24;
  } else if (yearsOfService >= 16 && yearsOfService <= 20) {
    legalDays = 26;
  } else if (yearsOfService >= 21 && yearsOfService <= 25) {
    legalDays = 28;
  } else if (yearsOfService >= 26 && yearsOfService <= 30) {
    legalDays = 30;
  } else if (yearsOfService >= 31 && yearsOfService <= 35) {
    legalDays = 32;
  } else {
    legalDays = 32;
  }

  // Se restan los días festivos/obligatorios que la empresa descuenta por política
  return Math.max(0, legalDays - deductionDays);
}
