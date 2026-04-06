# Horizonte técnico — Backend, datos y comunicaciones en tiempo casi real

**Propósito:** fijar **alcance y decisiones** para la implementación del backend NestJS del ERP interno: **PostgreSQL**, **Redis**, **integración con Mundo Terapeuta (MT)** vía **webhooks y/o jobs**, **WebSockets** para actualización casi inmediata en el cliente, **middlewares**, **tokens enriquecidos** y piezas transversales de seguridad y operación.

**Documento maestro de producto:** [MVP_ERP.md](./MVP_ERP.md). Este archivo **no** sustituye el MVP; lo **concreta en capa servidor** y delimita **fases** (MVP vs evolución).

---

## 1. Principios heredados del MVP

| Principio | Implicación técnica |
|-----------|---------------------|
| Servicio **independiente** de MT | Despliegue, secretos, base de datos y usuarios **propios** del ERP. |
| MT: **sin acceso directo del ERP a la BD de MT** | Toda comunicación es por **API / webhooks / jobs** acordados. La **entrada** de requerimientos puede empezar en **pull** (MVP); la **salida** de cierre de producción hacia MT (inventarios) es **requisito del circuito de abastecimiento** — ver **§4.3**. |
| Producción: **job periódico** en MVP; **casi tiempo real** después | Primera entrega: **sincronización programada** + modelo de datos listo para **eventos**; segunda fase: **webhooks** (u otro canal push) **MT → ERP** cuando exista contrato. La **retroalimentación ERP → MT** puede alinearse en la misma ventana de contrato o inmediatamente después del cierre operativo en ERP. |
| Autenticación **usuario/correo + PIN** | JWT (o cookie httpOnly) con **claims mínimos y estables**; PIN solo como credencial de login, **nunca** en el token. |
| Roles **Trabajador** y **Administrador** | Autorización en **cada capa** (guard/middleware + reglas de servicio); datos sensibles filtrados por `user_id` / rol. |

---

## 2. PostgreSQL — base relacional (fuente de verdad operativa)

### 2.1 Rol en el sistema

- **Fuente de verdad** para: usuarios del ERP, parámetros de jornada, asistencias, producción delegada y avances, mermas, permisos/vacaciones, bandeja, notificaciones de sistema, adjuntos (**metadatos en PostgreSQL**; el archivo en **Cloudinary**, **misma cuenta/servicio que Mundo Terapeuta** para compartir almacenamiento y criterios operativos).
- **Réplicas operativas** de datos “dueños” en MT: requerimientos de producción, recetas, insumos, identificadores externos (`external_id`), timestamps de última sync.

### 2.2 Lineamientos de modelado

- **Migraciones versionadas** con **TypeORM** (`migration:generate` / scripts equivalentes): ningún cambio de esquema “a mano” en producción sin script.
- **Claves foráneas y restricciones** donde el negocio lo exija (p. ej. asignación → requerimiento; merma → asignación).
- **Baja lógica** en usuarios (`activo`, `inactivo_desde`) para conservar historial; borrado físico solo si política/legal lo define.
- **Auditoría** en entidades críticas: quién creó/modificó, cuándo; en flujos de permisos/vacaciones, **historial de rondas** (ya exigido en MVP).
- **Zona horaria:** timestamps en **UTC** en BD; reglas de “día laborable” y jornada en **una sola zona horaria** operativa para todo el ERP (planta única); sin multi-planta en el diseño actual.
- **Vigencia de parámetros** (“efectivo desde”) para no reescribir histórico al cambiar jornadas o tolerancias.

### 2.3 Dominios alineados al MVP (checklist de tablas / agregados)

Referencia detallada: **§16 de MVP_ERP.md** y módulos **M8.x**. A nivel horizonte, agrupar en **bounded contexts** lógicos:

| Contexto | Contenido principal |
|----------|---------------------|
| **Identidad y acceso** | Usuarios, roles, hash de PIN, preferencias (silencio bandeja, push), `color_identificador`. |
| **Parámetros** | Días laborables, jornadas estándar/sábado, festivos, break/comida globales, vigencias. |
| **Asistencia** | Marcas de turno, break, comida; incidencias derivadas; solicitudes de justificación. |
| **Producción** | Requerimientos MT (copia), delegaciones, avances, estados, mermas. |
| **Permisos y vacaciones** | Solicitudes, periodos (día completo / por horas), rondas de negociación, estados finales. |
| **Comunicación** | Hilos/mensajes, destinatarios, lecturas, adjuntos (metadata), tipos de mensaje. |
| **Notificaciones** | Cola de eventos de sistema **separada** de la bandeja (M8.9). |
| **Integración** | Log de sync (job), cursor o watermark, payloads firmados (webhook), errores y reintentos. |

### 2.4 Índices y rendimiento (orientativo)

- Índices por: `user_id` + fecha en asistencias; `estado` + fechas en producción y permisos; `destinatario_id` + `leido` en bandeja; `external_id` único en requerimientos MT.
- Evitar N+1 en listados admin; paginación **cursor-based** o offset acotado según volumen esperado de planta.

---

## 3. Redis — usos previstos

| Uso | Objetivo | Notas |
|-----|----------|--------|
| **Sesiones / refresh / blacklist** | Invalidar logout; opcional rotación de refresh tokens. | TTL acorde a política de sesión. |
| **Rate limiting** | Proteger login PIN (fuerza bruta) por IP + identificador; límites en APIs sensibles. | Coherente con §6 del MVP (lockout / captcha si se abusa). |
| **Cache de lectura** | Parámetros del sistema, catálogos estáticos, contadores de no leídos **con TTL corto** si reduce carga. | Invalidación explícita al actualizar parámetros. |
| **Colas (BullMQ / similar)** | Jobs: sync MT, envío de push web, reintentos de webhooks salientes, limpieza. | Alineado con M8.2 (job periódico). |
| **Pub/Sub (opcional)** | Fan-out interno entre instancias NestJS antes de emitir por **WebSocket** (si hay más de una réplica API). | Ver §6. |

**Qué no delegar solo a Redis:** datos que deban sobrevivir reboot o auditoría legal → **PostgreSQL**.

---

## 4. Integración con Mundo Terapeuta — producción y evolución

**Flujo de negocio acordado (resumen):** MT **lanza** producciones para el cumplimiento de **abastecimiento de mercancía** (qué elaborar y en qué volumen según su modelo). El ERP **recibe** esos requerimientos y en planta se **determina quién o quiénes** los cumplen, con **plazos de finalización** y registro de avance, mermas y cierre con administrador (detalle en [MVP_ERP.md](./MVP_ERP.md) §7.5 / M8.2–M8.4). Cuando en el ERP quede **cerrado / validado** el cumplimiento frente a lo que MT exigió, el sistema debe **devolver a MT** los datos necesarios para que MT **actualice inventarios**: **insumos** (lo consumido o devengado por la producción) y **producto terminado** (lo efectivamente elaborado), según reglas del contrato (cantidades teóricas por receta vs ajustes por mermas/real, a definir con el equipo MT).

### 4.1 MVP: jobs programados (pull)

- **Cron / cola** con frecuencia configurable (p. ej. cada N minutos): leer API o exportación acordada con MT.
- Persistir **requerimiento** + metadatos (`external_id`, `updated_at` remoto, hash del payload opcional para detectar cambios).
- **Idempotencia:** upsert por `external_id`; no duplicar órdenes al reintentar job.
- **Registro de ejecución:** tabla o log estructurado (inicio, fin, filas afectadas, errores).

### 4.2 Fase 2: webhooks MT → ERP (push)

**Objetivo:** acercar la producción a **casi tiempo real** cuando MT pueda **notificar** eventos (nueva orden, cambio de cantidad, cierre en MT, etc.).

| Tema | Lineamiento |
|------|-------------|
| **Endpoint** | Ruta dedicada (p. ej. `POST /integrations/mt/webhooks/production`), **fuera** del prefijo JWT estándar o con esquema propio (firma + secret). |
| **Autenticación** | **Firma HMAC** (cabecera tipo `X-MT-Signature`) o **mTLS** según capacidad de MT; secretos en variables de entorno. |
| **Idempotencia** | `event_id` único de MT; tabla de **procesados** o clave Redis con TTL largo para ignorar duplicados. |
| **Respuesta** | `2xx` rápido tras validar y **encolar** trabajo pesado (no bloquear el webhook con lógica larga). |
| **Reintentos** | Asumir que MT reintenta; el ERP debe ser **idempotente**. |
| **Versionado** | Campo `schema_version` o `event_version` en payload para evolucionar contrato sin romper consumidor. |

### 4.3 Retroalimentación ERP → MT (cierre de producción e inventarios)

**Objetivo:** que MT pueda **reflejar en su modelo** (inventario de insumos y de producto terminado) el resultado de la ejecución que ocurrió **solo en el ERP** (delegación, tiempos, piezas terminadas, mermas, aprobación administrativa).

| Tema | Lineamiento |
|------|-------------|
| **Disparo** | Tras regla de negocio explícita (p. ej. **cierre aprobado por administrador** del requerimiento o de la última asignación pendiente, según se acuerde con MT). Opcionalmente eventos intermedios (avance parcial) solo si MT los expone y lo piden — no asumir sin contrato. |
| **Transporte** | Lo define el equipo MT: **POST** a endpoint REST en MT, **webhook** que MT expone para recibir payloads del ERP, o **cola/mensajería** compartida. El ERP implementa un **cliente saliente** único (servicio + cola de reintentos). |
| **Autenticación** | Simétrica a la entrada: **API key**, **HMAC** sobre cuerpo, **mTLS** u **OAuth** cliente-credenciales — lo que MT estandarice. |
| **Contenido mínimo (orientativo)** | Referencia al requerimiento MT (`external_id` u orden); **producto terminado**: cantidad **elaborada** (y unidad) notificada por el ERP. **Insumos:** **MT calcula el consumo** a partir de la **receta** (insumos y cantidades necesarias **por pieza** de producto final) × cantidad elaborada (y reglas de negocio en MT). El ERP puede enviar además **mermas** u otros datos solo si el contrato MT los exige para **ajustar** valoración o inventario; por defecto no se envían **líneas de insumo explícitas** desde el ERP. Incluir marcas de **fecha/hora de cierre** y **versión de payload**. |
| **Idempotencia** | Cada envío con `event_id` o `cierre_id` **único** generado en ERP; MT debe aceptar reenvíos sin duplicar movimientos de inventario. |
| **Reintentos** | Cola (**BullMQ** / similar): backoff, máximo de intentos, **dead letter** y tabla o log en **PostgreSQL** con payload y último error (operación y auditoría). |
| **Orden y consistencia** | Si hay varios cierres, definir si MT exige **orden** por `external_id` o acepta paralelismo; el ERP no debe marcar como “entregado” en su libro auxiliar hasta **2xx** (o acuse explícito) de MT. |
| **Desacoplamiento** | El trabajo pesado sigue siendo: persistir cierre en PostgreSQL → **encolar** notificación a MT → worker envía; igual patrón que webhooks entrantes (respuesta rápida al usuario, entrega asíncrona a MT). |

**Nota respecto al MVP en [MVP_ERP.md](./MVP_ERP.md):** allí se indica que en el MVP el ERP **no escribe en el núcleo de MT** salvo acuerdo explícito. Este documento de horizonte **sí** incorpora como **requisito del producto** esa **escritura vía integración contratada** (no SQL cruzado): el momento exacto de implementación (misma fase que recepción de órdenes o inmediatamente después) lo fijan el **contrato MT ↔ ERP** y el plan de releases.

### 4.4 Contrato de datos

- Documento aparte **“Contrato MT ↔ ERP”** (campos, enums, periodicidad): debe cubrir **entrada** (requerimientos / órdenes de producción) y **salida** (**cierre** + impacto en **insumos** y **producto terminado**).
- Este archivo fija **mecanismos**: job + webhooks MT→ERP + **cliente saliente** ERP→MT + idempotencia en ambos sentidos.

---

## 5. WebSockets — comunicación casi inmediata con el frontend

### 5.1 Motivación respecto al MVP

[MVP_ERP.md](./MVP_ERP.md) (§10–§12) permite **REST + polling** para bandeja y notificaciones. El **horizonte** incluye **Gateway WebSocket** para:

- **Notificaciones del sistema** (M8.9): nuevo evento sin esperar polling.
- **Bandeja:** opcionalmente avisar “hay nuevo mensaje” (el cuerpo sigue leyéndose vía REST).
- **Producción / admin:** actualizar contadores o listas cuando un webhook o job ingrese un requerimiento nuevo o cambie estado.
- **Vistas concurrentes:** mismo administrador en dos pestañas o varios admins viendo cola de aprobaciones.

### 5.2 Diseño recomendado (NestJS)

- **`@nestjs/websockets`** con **Socket.IO** (adapter oficial Nest + **Redis adapter** para réplicas — §5.3).
- **Autenticación de conexión:** mismo **JWT** que REST (handshake con token en `auth` o query acotada y **breve**), validado una vez al conectar.
- **Salas (rooms):** mínimo `user:{id}` para mensajes privados; opcional `role:admin`, `tenant:plant` si en el futuro hubiera multi-planta.
- **Emisión de eventos:** servicios de dominio publican “algo ocurrió” → capa de aplicación → **Gateway** emite solo a salas autorizadas (no broadcast global de datos sensibles).

### 5.3 Coherencia con Redis (escalado horizontal)

- Con **varias instancias** de API, usar **Redis adapter** para Socket.IO (o equivalente) para que el evento llegue al proceso que tiene la conexión del usuario.
- Alternativa: **SSE** solo servidor→cliente en rutas REST; menos bidireccional pero más simple — documentar como opción si WS se pospone.

### 5.4 Política de eventos (nomenclatura orientativa)

| Dominio | Evento (ejemplo) | Payload mínimo |
|---------|------------------|----------------|
| Notificaciones | `notification:new` | `id`, `tipo`, `created_at`, `leida` |
| Bandeja | `inbox:unread_count` | `count` o `thread_id` |
| Producción | `production:requirement_updated` | `external_id`, `accion` |
| Permisos | `leave:request_updated` | `solicitud_id`, `estado` |

Los payloads deben ser **pequeños**; el cliente **refresca** detalle vía REST si hace falta.

---

## 6. Middlewares, guards e interceptores (NestJS)

| Capa | Responsabilidad |
|------|-----------------|
| **HTTP: correlación** | `X-Request-Id` (generar si falta); adjuntar a logs. |
| **HTTP: seguridad base** | Helmet, CORS acotado, límite de tamaño de body (adjuntos vía multipart con techo). |
| **HTTP: rate limiting** | Login y endpoints públicos; integración con Redis. |
| **HTTP: autenticación JWT** | Validar firma, expiración, audiencia/emisor si se usan. |
| **HTTP: autorización por rol** | Guard `RolesGuard` después de `JwtAuthGuard`. |
| **HTTP: webhook MT** | Middleware o guard **dedicado**: verificar firma/raw body antes del controller; **excluir** swagger noise. |
| **HTTP: versionado API** | Prefijo `/api/v1` si se prevé breaking changes. |
| **WS: auth** | Mismo JWT al conectar; rechazar sin token válido. |
| **Logging** | Interceptor de latencia + usuario autenticado (sin PIN ni datos sensibles). |

---

## 7. Tokens enriquecidos (JWT)

### 7.1 Objetivo

Equilibrar **comodidad** (el cliente conoce rol y datos no sensibles) con **seguridad** (payload pequeño, revocable).

### 7.2 Claims recomendados (access token)

| Claim | Uso |
|-------|-----|
| `sub` | ID interno de usuario ERP. |
| `role` | `worker` \| `admin` (o array si en el futuro hubiera más). |
| `typ` | `access` (distinguir de refresh). |
| `iat`, `exp` | Estándar. |
| Opcional `jti` | Identificador de sesión para **blacklist** en logout o robo de token. |
| `plant_id` / `tz` en JWT | **No** en el diseño actual (**una sola zona horaria** / planta). Reservado solo si en el futuro hubiera multi-planta. |

### 7.3 Qué no incluir en el JWT

- PIN, hash, correo completo si no es necesario (preferir resolver perfil vía `/me`).
- Listas largas de permisos granulares en MVP (bastan **dos roles** del MVP).

### 7.4 Refresh tokens

- **Opaque** o JWT de larga vida **rotado** y almacenado con hash en PostgreSQL o Redis; invalidación en logout.
- Access token **corta duración** (p. ej. 15–60 min según riesgo operativo en planta).

---

## 8. Seguridad transversal

- **HTTPS** obligatorio en producción; HSTS.
- **Secretos** solo en entorno / vault; rotación documentada.
- **Adjuntos:** subida y entrega vía **Cloudinary** (compartido con MT); tipos MIME y tamaño máximo según M8.8 y política común; antivirus opcional si el pipeline lo permite.
- **CORS** restrictivo al origen del PWA Angular.
- **Dependabot / auditoría** de dependencias en CI.

---

## 9. Observabilidad y operación

- **Health:** `GET /health` (app + PostgreSQL + Redis).
- **Métricas:** Prometheus/OpenTelemetry (latencia, jobs, colas, errores de webhook).
- **Logs:** JSON estructurado, correlación `request_id`, niveles por entorno.
- **Alertas:** fallo de job MT repetido, cola DLQ creciente, **fallos repetidos de envío ERP→MT** (cierre de producción / inventarios), tasa de 401/429 en login.

---

## 10. Fases de implementación (resumen)

| Fase | Contenido |
|------|-----------|
| **F0 — Cimientos** | NestJS, PostgreSQL + **TypeORM**, migraciones, módulo auth (PIN→JWT), guards por rol, health, Docker Compose local opcional. |
| **F1 — Redis** | Rate limit login, sesión/blacklist si aplica, cola para jobs. |
| **F2 — Dominio MVP** | CRUD y flujos REST según M8.x; sin WS ni webhook MT. |
| **F3 — Jobs MT** | Sync periódica producción (M8.2), logs e idempotencia. |
| **F4 — WebSocket** | Gateway auth JWT, rooms por usuario, eventos notificación/bandeja/producción; Redis adapter si hay réplicas. |
| **F5 — Integración MT entrante** | Webhook MT→ERP (o solo job refinado): endpoint firmado, encolado, idempotencia; híbrido con §4.1 si aplica. |
| **F5b — Cierre e inventarios hacia MT** | Cliente saliente ERP→MT: payload de **cierre** (p. ej. **cantidad elaborada** de PT; **mermas** u otros campos solo si el contrato lo pide); **consumo de insumos** lo calcula **MT** vía **receta × elaborado**. Cola de reintentos, DLQ, registro en PostgreSQL; alineado con **§4.3**. |
| **F6 — Pulido** | Push web (PWA), métricas, endurecimiento de seguridad, contrato MT versionado y pruebas de idempotencia en ambos sentidos. |

---

## 11. Relación con el frontend (Angular)

- REST sigue siendo **contrato principal**; WS es **complemento** para refrescos y contadores.
- El cliente debe **suscribirse** tras login y **desuscribirse** en logout.
- **Lazy loading** de módulos Angular queda documentado en el repo frontend; el backend expone **recursos estables** por dominio (`/api/v1/asistencia`, etc.) para alinear con chunks.

---

## 12. Decisiones cerradas

| Tema | Decisión |
|------|----------|
| **ORM** | **TypeORM** (migraciones versionadas, entidades Nest). |
| **WebSockets** | **Socket.IO** (`@nestjs/websockets` + Redis adapter si hay varias instancias). |
| **Adjuntos (bandeja M8.8, evidencias, etc.)** | **Cloudinary**, **compartido con Mundo Terapeuta** (misma cuenta/servicio: conviene prefijos de carpeta o `public_id` por sistema para orden y permisos). En PostgreSQL solo **metadata** (URL, `public_id`, tipo MIME, tamaño). |
| **Zona horaria** | **Única** para toda la operación del ERP (timestamps en UTC en BD; presentación y reglas de jornada en esa zona). Sin `plant_id` / `tz` en JWT en el diseño actual. |
| **Insumos en cierre ERP→MT** | **MT calcula** consumo de insumos usando la **receta** (insumos y cantidades **por pieza** del producto final) aplicada a la **cantidad elaborada** (y lógica propia de MT). El ERP notifica sobre todo **producto terminado elaborado**; **mermas** u otros campos solo si el contrato MT los requiere para ajustes. |

---

## 13. Decisiones pendientes

- [ ] **Contrato y disponibilidad** de **webhooks MT→ERP** y de **endpoint** (o mecanismo) para **ERP→MT** (cierre e inventarios): URLs, auth, payload exacto, versionado.
- [ ] **Cloudinary:** política de **carpetas / tags** ERP vs MT, límites de tamaño y MIME alineados al MVP (M8.8).
- [ ] **Despliegue:** réplicas de API, **Redis cluster** u opción managed, si aplica.

---

*Documento vivo. Actualizar cuando el contrato MT y el despliegue (réplicas, Redis) estén cerrados.*
