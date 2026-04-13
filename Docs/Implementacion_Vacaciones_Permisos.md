# Resumen de Implementación: Módulo de Vacaciones y Permisos

Este documento detalla los cambios realizados para modernizar y poner en marcha el sistema de gestión de vacaciones y justificaciones dentro del ERP, integrando la lógica legal de México (Ley 2023) y conectando el frontend con datos reales de la API.

## 1. Backend (API)

Se ha implementado un sistema robusto para manejar el ciclo de vida de las solicitudes.

### Entidades y Base de Datos
- **`LeaveRequest`**: Almacena el tipo de solicitud (Vacaciones, Falta, Médico, Personal), fechas, motivo, evidencia (PDF) y estado actual.
- **`LeaveRequestHistory`**: Un log detallado de cada acción (Creación, Aprobación, Rechazo, Propuesta de cambio) para auditoría y negociación.
- **Sincronización**: Se añadió el campo `fecha_ingreso` a la tabla de usuarios, esencial para el cálculo dinámico de vacaciones por ley.

### Lógica de Negocio (`LeaveRequestsService`)
- **Cálculo de Saldo**: Implementado según la antigüedad del trabajador.
- **Validación de Días**: El sistema impide solicitar más días de vacaciones de los disponibles.
- **Regla Laboral**: Se integró lógica para contar solo días hábiles (Lunes a Sábado), excluyendo domingos automáticamente.

### Endpoints (`LeaveRequestsController`)
- `GET /balance`: Obtiene el saldo detallado del trabajador.
- `GET /me`: Listado personal de solicitudes.
- `GET /`: (Admin) Listado global de solicitudes para RRHH.
- `POST /`: Crear nueva solicitud.
- `PATCH /:id/status`: Cambiar estado de solicitud (Aprobar/Rechazar/Proponer Alternativa).

---

## 2. Frontend (Web)

Se han reemplazado los datos de prueba (mocks) por una integración reactiva con la API.

### Core Service
- **`LeaveRequestsService`**: Centraliza las llamadas HTTP, tipado de datos y manejo de respuestas del servidor.

### Vista del Trabajador (`TrabajadorPermisosComponent`)
- **Signals**: Se migró el estado a Angular Signals (`signal()`, `computed()`) para mejor rendimiento y reactividad.
- **Carga de Datos**: Al iniciar sesión, el trabajador ve su saldo real de días disponibles y su historial desde la base de datos.
- **Formulario Dinámico**: El envío de solicitudes valida la selección en el calendario y envía motivos/evidencia directamente a PostgreSQL.

### Vista de Administrador (`AdminPermisosComponent`)
- **KPIs en Vivo**: El panel superior ahora cuenta las solicitudes pendientes en tiempo real.
- **Gantt Administrativo**: Las barras del gráfico de Gantt se generan dinámicamente según las fechas y estados de las solicitudes reales.
- **Panel de Decisión**: Las acciones de Aprobar y Rechazar están conectadas para impactar inmediatamente en el historial y saldo del empleado.

---

## 3. Correcciones de Estabilidad (Hotfix)

- **Auth 401 Unauthorized**: Se identificaron errores de autenticación causados por tokens expirados tras cambios en el secreto JWT; resuelto invitando al relogueo.
- **TS Errors**: Se corrigieron errores de compilación en los templates HTML y en la enumeración de tipos de acción en el backend.
- **Relaciones de DB**: Se ajustó la inserción en `AttendanceService` para usar objetos relacionales correctos, evitando fallos de integridad.

---

> [!IMPORTANT]
> **Próximo Paso Recomentado**: Realizar una migración de datos manual o vía script para asignar la `fecha_ingreso` real a todos los trabajadores antiguos, asegurando que sus saldos de vacaciones se calculen correctamente de inmediato.
