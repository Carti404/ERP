# Resumen de Mejoras – Módulo de Producción (Abril 2026)

## Estado: ✅ Implementado (v2 – Procesos y Tiempos)

### Mejoras Previas (v1)
- Notificaciones push a trabajadores al ser asignados
- Notificación a admins cuando una orden se completa
- Optimización de delegación con validación estricta de cantidades
- Historial paginado de órdenes reportadas a MT
- Sincronización automática cada minuto con Mundo Terapeuta

### Mejoras Nuevas (v2 – 10 Abril 2026)

#### 1. Plantillas de Procesos Reutilizables (`ProductProcessTemplate`)
- **Nueva tabla**: `product_process_templates` almacena la "receta de pasos" por producto.
- Cuando el admin define procesos para una orden, se crea/actualiza automáticamente la plantilla.
- Futuras órdenes del **mismo producto** heredan automáticamente los procesos de la plantilla.
- Esto elimina la necesidad de redefinir procesos manualmente cada vez.

#### 2. Filtros en la Pestaña de Procesos
- **"Sin Procesos"**: Muestra órdenes que requieren atención inmediata del admin.
- **"Con Procesos"**: Muestra órdenes con procesos ya definidos (editables).
- Visual diferenciado con colores ámbar (sin procesos) y azul (con procesos).

#### 3. Notificaciones Inteligentes para Órdenes Sin Procesos
- Cuando llega una orden nueva de MT y **no existe plantilla** para ese producto, se envía una notificación automática a todos los admins.
- Categoría: `PRODUCTION_NO_PROCESSES`.
- Las notificaciones se **limpian automáticamente** cuando el admin entra a la pestaña de Procesos.

#### 4. Tiempo Total Estimado
- Al guardar procesos, aparece un **modal** que pregunta al admin cuánto tiempo estimado le tomará al trabajador completar toda la serie de procesos.
- Se almacena en `production_tasks.total_estimated_time_value` y `total_estimated_time_unit`.
- Unidades soportadas: minutos, horas, días, semanas.

#### 5. Duración Real en el Historial
- En la pestaña de historial, se muestra una columna **"Duración Real"** que calcula:
  - Inicio: momento en que el **primer** trabajador inicia su **primer** proceso.
  - Fin: momento en que el **último** trabajador completa su asignación.
- Formato legible: `2h 30min`, `1 día 4h`, `2 sem 3 días`, etc.

### Archivos Modificados
- **Backend**: `production.service.ts`, `production.controller.ts`, `production.module.ts`, `production-task.entity.ts`, `notification.entity.ts`, `set-processes.dto.ts`, `data-source.ts`
- **Backend (nuevo)**: `product-process-template.entity.ts`
- **Frontend**: `production.service.ts`, `admin-produccion.component.ts`, `admin-produccion.component.html`
