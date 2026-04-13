/**
 * Utilidades para el cálculo de vacaciones en base a la Ley "Vacaciones Dignas" (2023).
 */

export function countWorkingDays(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let workingDaysCount = 0;
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday
    if (dayOfWeek !== 0) {
      workingDaysCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDaysCount;
}

export function calculateVacationDays(fechaIngreso: Date | string | null): number {
  if (!fechaIngreso) {
    return 0; // Sin fecha de ingreso no hay días base. O podríamos asumir 12.
  }

  const startDate = new Date(fechaIngreso);
  const today = new Date();
  
  let yearsOfService = today.getFullYear() - startDate.getFullYear();
  const m = today.getMonth() - startDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < startDate.getDate())) {
    yearsOfService--;
  }

  if (yearsOfService < 1) {
    return 0; // O proporcional si la lógica de la empresa lo dictamina, por ahora 0.
  }

  // Ley 2023:
  // 1 año -> 12 días
  // 2 años -> 14 días
  // 3 años -> 16 días
  // 4 años -> 18 días
  // 5 años -> 20 días
  // 6 - 10 años -> 22 días
  // 11 - 15 años -> 24 días
  // 16 - 20 años -> 26 días
  // etc.
  
  if (yearsOfService >= 1 && yearsOfService <= 5) {
    return 12 + (yearsOfService - 1) * 2;
  }
  if (yearsOfService >= 6 && yearsOfService <= 10) return 22;
  if (yearsOfService >= 11 && yearsOfService <= 15) return 24;
  if (yearsOfService >= 16 && yearsOfService <= 20) return 26;
  if (yearsOfService >= 21 && yearsOfService <= 25) return 28;
  if (yearsOfService >= 26 && yearsOfService <= 30) return 30;
  if (yearsOfService >= 31 && yearsOfService <= 35) return 32;

  return 32; // Tope de la tabla típica, podría seguir subiendo
}
