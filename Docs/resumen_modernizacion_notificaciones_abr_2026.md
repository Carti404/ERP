# Resumen de Modernización: Sistema de Notificaciones Admin

Este documento detalla la implementación del sistema centralizado de notificaciones para el administrador, diseñado para automatizar el seguimiento de incidencias y agilizar la gestión de permisos.

## Backend (erp-api)

### 1. Categorización y Entidades
- **NotificationCategory**: Se expandió el catálogo para incluir `LEAVE_REQUEST` (Permisos/Vacaciones) y `ATTENDANCE_INCIDENCE` (Incidencias de Asistencia).
- **Enums**: Se añadió `WORKER_APPEAL` al `LeaveRequestStatus` para soportar formalmente el flujo de negociación de fechas entre el trabajador y el administrador.

### 2. Disparadores Automáticos (Triggers)
- **Módulo de Permisos**:
    - Alerta inmediata a administradores cuando se crea una nueva solicitud.
    - Notificación de "Apelación" cuando un trabajador propone cambios a una propuesta del administrador.
    - Feedback automático al trabajador cuando su solicitud es aprobada, rechazada o modificada por el sistema.
- **Módulo de Asistencias**:
    - Generación automática de notificaciones de tipo `Retardo` para los administradores en el momento exacto en que un trabajador realiza su registro de entrada fuera de la tolerancia.

### 3. API y Servicios
- **Limpieza Selectiva**: Nuevo endpoint `PATCH /notifications/category/:category/read` que permite marcar todas las notificaciones de un área específica como leídas sin afectar al resto.
- **Búsqueda de Administradores**: Se implementó `findAdmins` en el `UsersService` para garantizar que las alertas críticas lleguen a todo el equipo administrativo con rol activo.

---

## Frontend (erp-web)

### 1. Automatización "Read-on-view"
Se implementó un mecanismo de limpieza automática basado en la navegación del usuario:
- **Vista de Asistencias**: Al entrar a `admin/asistencias`, el sistema limpia automáticamente todas las notificaciones de la categoría `ATTENDANCE_INCIDENCE`.
- **Vista de Permisos**: Al entrar a `admin/permisos`, se marcan como leídas todas las alertas de `LEAVE_REQUEST`.

### 2. Centro de Notificaciones (Vista Unificada)
- **Visualización General**: Se eliminó el filtro restrictivo de producción para mostrar una lista cronológica de todos los eventos del sistema.
- **Iconografía Dinámica**: 
    -  **Permisos/Vacaciones**: Calendario de gestión.
    -  **Asistencias**: Icono de incidencia/retardo.
    -  **Producción**: Iconos de asignación y completado.
- **Etiquetas Descriptivas**: Cada notificación ahora incluye una etiqueta clara del módulo de origen (ej. "Incidencia Asistencia", "Permiso / Vacaciones").

---

## Estado Técnico
- **Backend**: Compilación exitosa. Triggers integrados en `LeaveRequestsService` y `AttendanceService`.
- **Frontend**: Sincronización en tiempo real de contadores de lectura. Limpieza automática funcional en componentes administrativos.
- **Base de Datos**: Requiere actualización del enum `leave_request_status_enum` si no se usa sincronización automática (ver notas de implementación).
