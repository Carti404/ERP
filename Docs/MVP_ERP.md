# MVP — ERP interno operativo (servicio independiente)

**Documento maestro de alcance, roles, flujos por módulo y decisiones técnicas** — Objetivo: tener **visión cerrada** antes de programar; el desarrollo consiste en implementar lo aquí descrito (ajustando solo detalles de UX o datos).

**Producto aparte** de Mundo Terapeuta (MT): **PostgreSQL y usuarios propios**, consumo **solo lectura** de MT cuando aplique. **Lógica simple** e **interfaz intuitiva** para planta y administración.

---

## 1. Visión en una frase

**PWA interna** (Angular) con backend NestJS que concentra **producción** (sync MT por **jobs**), **mermas**, **asistencias**, **permisos y vacaciones**, **bandeja de entrada**, **notificaciones del sistema**, **Personal/Trabajadores** y **parámetros** — sin modificar el núcleo de MT.

---

## 2. Arquitectura: servicio aparte y relación con Mundo Terapeuta

| Decisión | Descripción |
|----------|-------------|
| **Despliegue** | Servicio **independiente** (repositorio/proyecto y despliegue propios). |
| **Base de datos** | **PostgreSQL** dedicada al ERP. |
| **Autenticación** | **Login interno**: usuario o correo + **PIN numérico de 4 dígitos** (ver §6). |
| **Intervención en MT** | **Ninguna**. Integración **unidireccional** (ERP consume APIs/exportaciones/**jobs** de MT según contrato acordado). En el MVP la sincronización de producción se implementa preferentemente como **job periódico**; una fase posterior puede acercarse a **casi tiempo real**. |

**Nota de negocio:** los **objetivos de producción** que el trabajador debe cumplir **provienen de lo definido en MT** (órdenes, metas o catálogos sincronizados); la **ejecución, evidencias, mermas y validación** ocurren en el ERP.

**Trabajador ERP ≠ CIBE** (POS en MT). Correlación de identidades entre sistemas, si existiera, es **opcional** y explícita.

---

## 3. Principios de producto y experiencia

- Reglas de negocio **claras y acotadas**; flujos cortos (registrar → ver estado → aprobar si aplica).
- Pantallas centradas en **tareas del día** (checador, producción pendiente, mensajes).
- Separar en diseño **datos replicados/sincronizados desde MT** vs **datos maestros del ERP**.
- **PWA:** instalable, uso cómodo en móvil en planta; comportamiento offline **acotado** (ver §11).

---

## 4. Alcance funcional (resumen por áreas)

| Área | Contenido |
|------|-----------|
| Producción | Requerimientos desde MT (producto, receta, insumos, cantidad total); **delegación** por trabajador y plazo; avance, cierre por trabajador y **aprobación** admin (**§7.5**). |
| Mermas | Registro **durante** la asignación de producción; agregación en KPIs (**§7.5.3**, M8.4). |
| Asistencia | Checador; **calendario** admin (todos) y trabajador (solo sí mismo); promedio hora de entrada; **§7.6**. |
| Permisos y vacaciones | Calendarios PWA; **días completos y permisos por horas**; **apelaciones** + **rechazo** siempre disponible hasta **aceptación**; sync MT vía **job** (§7.7, M8.7). |
| Faltas / incidencias | Checador; **historial de solicitudes** (estados: pendiente, aceptada, rechazada); admin **comentario al rechazar** (**§7.6.3**, M8.6). |
| Comunicación | **Dos entradas de menú:** **Bandeja de entrada** (correo interno, §7.4) y **Notificaciones del sistema** (eventos automáticos, M8.9). |
| Personal / Trabajadores | Solo **administrador**: alta/edición/baja, PIN; **color identificador** del trabajador para calendarios (M8.10). |
| **Parámetros del sistema** | Jornada, festivos, puntualidad; **descanso** (p. ej. 20 min nominales) y **comida** (hora a partir de la cual aplica); solo admin (**§7.3.6**). |

### 4.1 Cierre de alcance — Módulos del ERP (v1)

Lista acordada de **módulos de producto** (entradas de menú) y referencias al detalle funcional.

| # | Módulo (menú) | Alcance incluido | Referencia principal |
|---|----------------|------------------|----------------------|
| 1 | **Bandeja de entrada** | Mensajería tipo **correo** (múltiples destinatarios, adjuntos, estados, tipos de mensaje, historial por rol); **sonido** ante mensaje nuevo. | §7.4, M8.8 |
| 2 | **Notificaciones del sistema** | Centro de **alertas automáticas** (p. ej. nueva asignación de producción, apelaciones de permisos/vacaciones, rechazos, permisos aceptados, aviso de **nuevo mensaje en bandeja**). Separado conceptual y en UI de la bandeja. | M8.9 |
| 3 | **Producción** | Sync **desde MT** por **job** (periódico; tiempo casi real en fase posterior); delegación, avance, mermas, cierre con admin; **bloqueo** si no hay **entrada** de checador (§7.5.3). | §7.5, M8.2–M8.4 |
| 4 | **Asistencias** | Checador; calendarios admin/trabajador; justificaciones e historial. | §7.3, §7.6, M8.5–M8.6 |
| 5 | **Permisos y vacaciones** | Días completos y **por horas**; apelaciones ilimitadas; **Rechazar** siempre visible **hasta** que la solicitud quede **aceptada** (luego no aplica rechazo). | §7.7, M8.7 |
| 6 | **Parámetros del sistema** | Solo **administrador**: jornada, festivos, puntual/retraso; **break** (duración nominal) y **comida** (ventana global). | §7.3, §7.3.6, M8.0 |
| 7 | **Personal** / **Trabajadores** | Solo **administrador**: CRUD trabajadores, PIN inicial; el trabajador elige **color identificador** (perfil) usado en calendarios. | M8.10, §5 |

**Capacidades transversales** (no son módulos de menú adicionales):

| Transversal | Contenido |
|-------------|-----------|
| **Autenticación** | Usuario/correo + **PIN** 4 dígitos (§6, M8.1). |
| **Roles** | **Trabajador** y **Administrador** (§5). |
| **Panel principal (home)** | Resumen por rol (§7.1–§7.2). |
| **Integración MT** | Lectura vía **jobs** programados en el MVP; evolución a sync más frecuente o tiempo casi real **posterior** (§2, M8.2). |

*Nota:* Las **mermas** pertenecen a **Producción**. Las **faltas/justificaciones** pertenecen a **Asistencias**. El **color identificador** se configura en **perfil del trabajador** (editable por el propio trabajador; el admin puede supervisar o restringir paleta según política).

---

## 5. Rangos internos (roles)

### 5.1 Trabajador

Persona que debe **cumplir objetivos de producción** determinados por **Mundo Terapeuta** (metas u órdenes sincronizadas al ERP). En el sistema puede:

| Responsabilidad | Descripción |
|-----------------|-------------|
| **Producción** | **Solo inicio de turno** obligatorio para operar producción; **finalizar** producción **no** requiere **fin de turno** (puede ser antes del cierre de jornada). Ver §7.5.3. |
| **Permisos y vacaciones** | Solicitudes con **días completos o por horas**; **historial**; **aceptar/apelar/rechazar** según §7.7 (**§7.7.3**). |
| **Perfil / calendario** | Elegir **color identificador** (paleta definida por el sistema) para mostrarse en **calendarios** donde intervengan varios trabajadores (p. ej. permisos/vacaciones en vista admin). |
| **Asistencia** | Inicio y fin de turno; **marcar salida y regreso** de primer descanso y de comida (**horas reales**). Calendario propio (§7.6.2). |
| **Incidencias** | **Solicitud de justificación** (motivo + evidencia opcional); consulta **historial propio** con estados y comentario si hubo rechazo (**§7.6.2**, **§7.6.3**). |
| **Bandeja de entrada** | Enviar y recibir mensajes internos a **uno o varios** usuarios (**sin restricción** por rol). Tipo **correo** (§7.4). **Notificaciones del sistema** son aparte (M8.9). |

No gestiona usuarios ni reglas globales ni valida la producción de terceros.

### 5.2 Administrador

Usuario encargado de la **operación del ERP** y del **personal**. Puede:

| Responsabilidad | Descripción |
|-----------------|-------------|
| **Producción** | Ver requerimiento MT en detalle; **delegar** piezas y plazo (horas/días/semanas/mes) por trabajador; **supervisar** y registrar progreso; **aprobar cierre** o devolver (**§7.5.2**). |
| **Personal / Trabajadores** | Ítem de menú **solo admin** (M8.10): **Registrar, editar y dar de baja** trabajadores (**nombre**, **puesto**, **antigüedad**); PIN inicial. El **color identificador** lo define el **trabajador** en su perfil (validar unicidad o paleta según reglas). |
| **Asistencias** | **Calendario** (§7.6.1); **historial de solicitudes** de todos los trabajadores (§7.6.3); **aprobar/rechazar** con **comentario en rechazo**; justificar de oficio. |
| **Permisos y vacaciones** | Calendario mensual (colores por **color identificador** del trabajador + nombre); pendientes; programar fechas; **aceptar / apelar / rechazar** (**rechazo** disponible en cualquier momento **antes** de una **aceptación** final). |
| **Comunicación** | Usar la **bandeja** para mensajes dirigidos; **notificaciones del sistema** (M8.9) para eventos automáticos; ver alertas pendientes en panel. |
| **Dashboard** | Ver **KPIs**: productividad, **total de mermas**, **asistencia** de trabajadores (y métricas del panel principal, §7). |
| **Parámetros del sistema** | Calendario, jornadas, festivos, entrada/tolerancia; **descanso y comida** globales (**§7.3.6**). |

**Consideración:** “eliminar” trabajador debe implementarse preferentemente como **baja lógica** (inactivo) para conservar historial de producción y asistencias; si se requiere borrado físico, documentar excepción legal/operativa.

---

## 6. Autenticación: usuario / correo + PIN (4 dígitos)

| Aspecto | Definición |
|---------|------------|
| **Credenciales** | Identificador: **nombre de usuario** o **correo electrónico** (uno solo esquema acordado o ambos aceptados). Secreto: **PIN de exactamente 4 dígitos** (no contraseña alfanumérica larga en el flujo principal). |
| **Post-login** | Redirección al **panel principal** según rol: **Trabajador** o **Administrador** (§7). |
| **Almacenamiento** | PIN **nunca en claro**; guardar **hash** (p. ej. bcrypt/argon2) con coste acorde; opcional “salt” por usuario. |
| **Seguridad operativa** | **Límite de intentos** por IP/usuario, **bloqueo temporal** o captcha si se abusa; sesiones con **JWT** o cookie httpOnly según estándar NestJS; **HTTPS** obligatorio en producción. |
| **Rotación** | Flujo para que **administrador** o el propio usuario (si se permite) **reestablezca PIN** (p. ej. tras alta de trabajador se entrega PIN temporal y se fuerza cambio en primer acceso — a decidir). |

*Riesgo inherente:* un PIN de 4 dígitos es débil frente a fuerza bruta; mitigar con **rate limiting**, **lockout** y **monitoreo**. Si a futuro se exige más rigor, se puede añadir segundo factor sin romper el modelo de pantallas.

---

## 7. Paneles principales (home) tras el login

### 7.1 Panel principal — Trabajador

| Bloque | Contenido |
|--------|-----------|
| **Checador y jornada** | **Inicio de turno** y **fin de turno** (opcional hasta el cierre real del día). **Descansos y comida:** salida/regreso del **primer break** y salida/regreso de **comida** con **hora real** (§7.3.6, M8.5). |
| **KPIs / resumen productivo** | **Producción pendiente** y asignaciones activas (**§7.5**): piezas restantes, plazo, acceso al detalle de la orden. |
| **Mensajes y notificaciones** | Contadores o accesos a **Bandeja de entrada** y a **Notificaciones del sistema** por separado (§4.1, M8.8, M8.9). |

Desde este panel se navega a **asistencias** (**§7.6**), **producción** §7.5, **permisos y vacaciones** (**§7.7**), **bandeja**, **notificaciones**, **perfil** (color identificador), etc.

### 7.2 Panel principal — Administrador

| Bloque | Contenido |
|--------|-----------|
| **Asistencia** | Resumen y acceso al **calendario de asistencias** (**§7.6.1**): todos los trabajadores, ausencias/asistencias, **hora de entrada promedio** (general o por trabajador). |
| **Puntualidad** | **Promedio de asistencia puntual** según **parámetros del sistema** (§7.3): solo días **laborables**; límite = hora de entrada del bloque del día (estándar o sábado) + tolerancia. |
| **Producción** | Resumen y acceso al **módulo de producción** (**§7.5**): requerimientos MT, delegaciones, **pendientes de aprobación** (trabajador marcó finalizado), **en proceso por trabajador**. |
| **Mermas / productividad** | Encaje con **KPIs** globales ya definidos para el rol (totales y tendencias simples en MVP). |
| **Notificaciones** | **Últimas notificaciones pendientes** (sistema o alertas que requieran acción). |

Desde el layout de administrador existe además una sección fija **Parámetros del sistema** (no es el home; es pantalla de configuración accesible por menú), descrita en §7.3.

### 7.3 Parámetros del sistema (vista Administrador)

Pantalla donde el administrador define el **calendario laboral**, los **horarios** (incluido el **sábado** cuando aplica jornada reducida), los **festivos oficiales**, los **descansos y la ventana de comida** (§7.3.6), y los criterios de **puntualidad / retraso** en el **chequeo de entrada**. Todo ello alimenta **KPIs**, **asistencia** y **faltas** en días laborables.

#### 7.3.1 Días laborables por semana

| Parámetro | Descripción |
|-----------|-------------|
| **Días laborables** | Conjunto configurable de **días de la semana** en los que normalmente se trabaja. Caso típico de la operación: **lunes a sábado**; **domingo** suele no ser laborable salvo configuración explícita. |

El sistema usa esta definición para saber si un **calendario** dado (p. ej. un martes) es, por regla general, día de trabajo. El detalle de **horas** depende de si ese día es **sábado** u otro día laborable (§7.3.2).

#### 7.3.2 Horarios de jornada (entre semana vs. sábado)

En muchas plantas el **sábado** es laborable pero con **menor número de horas**; por tanto el horario de **entrada** y **salida** (y la tolerancia) **no es el mismo** que de lunes a viernes.

| Parámetro | Descripción |
|-----------|-------------|
| **Jornada lunes–viernes** (o “días estándar”) | **Hora de entrada**, **hora de salida / fin de jornada** y **minutos de tolerancia** para los días laborables que **no** sean sábado (ajustar etiqueta si algún viernes o feriado se trata distinto en una fase posterior). |
| **Jornada sábado** | Si el sábado está marcado como laborable: **hora de entrada**, **hora de salida / fin de jornada** y **minutos de tolerancia** **propios** (jornada acotada). Si un sábado coincide con **festivo** (§7.3.3), prevalece el festivo: **no se labora**. |

La **puntualidad en entrada** usa la **hora de entrada** y la **tolerancia** del bloque que corresponda a ese día (estándar vs. sábado).

#### 7.3.3 Festivos e inhábiles (calendario oficial)

| Parámetro | Descripción |
|-----------|-------------|
| **Días inhábiles / festivos** | Lista de **fechas** (sin labor) alineada al **calendario oficial del gobierno** (y a las disposiciones que la empresa aplique). En esas fechas **no se espera asistencia**; **no** se genera falta por omisión de checador; el checador puede mostrarse como **día no laborable** o deshabilitarse según UX. |

**Mantenimiento:** el administrador **carga o actualiza** el calendario anual (entrada manual, plantilla importada o, en el futuro, integración con fuente oficial). Conviene **nombre o etiqueta** del festivo para reportes y claridad al personal.

#### 7.3.4 Resolución del “tipo de día” (orden de evaluación)

Para cualquier **fecha** concreta, el backend determina:

1. ¿Está en la lista de **festivos / inhábiles**? → **Día inhábil** (no labora, sin exigencia de checador ni puntualidad).
2. Si no: ¿pertenece a un **día de la semana no laborable** según §7.3.1? → **Día inhábil** por configuración.
3. Si es laborable: ¿es **sábado**? → Aplicar **jornada sábado** (§7.3.2).
4. En caso contrario → Aplicar **jornada lunes–viernes** (estándar).

#### 7.3.5 Puntualidad vs. retraso (solo en días laborables)

Solo aplica cuando el día está resuelto como **laborable** según §7.3.4.

1. Se toman `hora_entrada` y `minutos_tolerancia` del bloque aplicable (estándar o sábado).
2. `límite_puntual = hora_entrada + minutos_tolerancia` (fecha del checado + reloj; **zona horaria** de la planta en el ERP).
3. Sea `t_checado` la marca de **entrada / inicio de turno**.
4. **Puntual:** `t_checado ≤ límite_puntual`.
5. **Retraso:** `t_checado > límite_puntual`.

**Ejemplo (lunes):** entrada 08:00, tolerancia 10 min → límite 08:10. Checado 08:09 → puntual; 08:11 → retraso.

**Ejemplo (sábado laborable):** entrada 08:30, tolerancia 5 min, salida 14:00 → el límite de puntualidad usa 08:30 + 5 min; la **salida** esperada para reportes usa 14:00 (puntualidad en salida sigue fuera del MVP salvo ampliación).

**Consideraciones de implementación:**

- **Salida / fin de turno:** usar la **hora de fin de jornada** del bloque del día (estándar o sábado) para alertas o reportes; **puntualidad en salida** fuera del MVP salvo ampliación.
- **Múltiples turnos o plantas:** el MVP puede asumir **un solo conjunto global** de parámetros y un solo calendario de festivos; extensiones: turnos nocturnos, sedes distintas.
- **Cambios retroactivos:** **versionar por vigencia** o “efectivo desde” para no alterar histórico cerrado.

#### 7.3.6 Descansos y comida (parámetros globales)

Parámetros **únicos para toda la planta** (mismo criterio para todos los empleados), configurables solo por **administrador** en **Parámetros del sistema**:

| Parámetro | Descripción |
|-----------|-------------|
| **Primer descanso (break)** | **Duración nominal** del primer descanso (p. ej. **20 minutos**). Sirve de referencia y reportes; no sustituye el registro real del trabajador. |
| **Comida** | Reglas de **ventana de comida**: p. ej. **a partir de qué hora** el personal puede ir a comer (y, si aplica, duración máxima o fin de ventana — definir en implementación según política). |

**Registro obligatorio por el trabajador (día laborable con turno iniciado):**

El trabajador debe **marcar en el sistema** las **ausencias momentáneas** del puesto de trabajo:

| Evento | Qué registra |
|--------|----------------|
| **Primer descanso** | **Hora de salida** al descanso y **hora de regreso** al puesto (dos marcas). |
| **Comida** | **Hora de salida** a comer y **hora de regreso** (dos marcas). |

**Flexibilidad real:** en la práctica los descansos pueden **adelantarse o atrasarse** respecto a un guion ideal; por eso el sistema guarda las **marcas horarias reales** de salida y regreso, no solo un cumplimiento contra el reloj teórico. Los parámetros globales (20 min, hora mínima de comida, etc.) sirven para **orientación**, **alertas suaves** o **reportes** (tiempo fuera del puesto vs. nominal), según se defina en KPIs.

**Consideraciones:**

- Solo tiene sentido registrar descansos/comida si existe **inicio de turno** ese día (turno en curso).
- El **fin de turno** (cierre de jornada) es independiente: ver §7.5.3 respecto a **producción**.
- En **sábado** u otros bloques de jornada, pueden heredarse los mismos parámetros o definirse valores distintos en una fase posterior si el negocio lo pide.

### 7.4 Bandeja de entrada y mensajería interna (estilo correo)

Comunicación **asíncrona** entre usuarios del ERP (trabajador o administrador), **sin límite** de quién puede escribir a quién. **No** es un chat en tiempo real: el flujo es el de un **correo interno** (referencia de UX: Gmail, Outlook, etc.).

#### 7.4.1 Principios

| Criterio | Definición |
|----------|------------|
| **Alcance** | Cualquier usuario autenticado puede dirigir mensajes a **cualquier otro usuario** activo del sistema. |
| **Varios destinatarios** | Un mismo mensaje puede enviarse a **múltiples personas** cuando sea necesario (selección múltiple); cada destinatario recibe el mensaje en su **bandeja de entrada** de forma independiente (lectura / leído por persona). |
| **No tiempo real** | No hay entrega instantánea obligatoria ni lista de presencia tipo chat; el usuario **redacta, envía** y **cada destinatario** verá el mensaje al **consultar la bandeja** o cuando el cliente actualice datos (polling / recarga). |
| **Vista por defecto** | Al abrir el módulo se muestra la **bandeja de entrada**, con mensajes **nuevos** (no leídos) y **antiguos** (leídos), orden lógico tipo bandeja de correo (p. ej. no leídos primero, luego por fecha descendente). |

#### 7.4.2 Redactar y enviar

| Campo | Reglas |
|-------|--------|
| **Destinatario(s)** | Obligatorio al menos uno; el remitente puede seleccionar **varios usuarios** en un solo envío (UI tipo selector múltiple o chips). Es requisito del MVP, no una fase posterior. Si en el futuro se desea distinguir **Para** vs **CC** (paridad con Outlook), se puede añadir sin cambiar el hecho de que **un envío = un título, un cuerpo, mismos adjuntos** para todos los seleccionados. |
| **Título / asunto** | Texto corto obligatorio. |
| **Cuerpo** | Texto largo; debe **preservarse el formato de escritura**: **saltos de línea**, **espacios** y estructura tal cual el usuario escribió (p. ej. almacenar como texto multilínea y renderizar con `pre-wrap` o equivalente; **no** colapsar whitespace). |
| **Adjuntos** | Opcional: **imágenes** (definir en implementación tipos MIME y tamaño máximo por archivo y por mensaje). |

**Respuestas / hilos:** para soportar estados como **“en espera de respuesta”**, conviene modelar **hilos** (mensaje raíz + respuestas en el mismo hilo), de forma similar a conversaciones por asunto en correo. El MVP debe al menos permitir **responder** manteniendo vínculo con el mensaje original.

#### 7.4.3 Estados operativos del mensaje (o del hilo)

Catálogo orientativo (ajustable en datos maestros o enum); sirven para **filtrar** y **priorizar** en la bandeja:

| Estado (ejemplos) | Uso |
|-------------------|-----|
| **Urgente** | Marca de prioridad visible en listado (bandera / etiqueta). |
| **En espera de respuesta** | Quién envió indica que requiere contestación; el receptor puede marcar al responder o cerrar el ciclo. |
| **Leído** | El destinatario abrió el mensaje (automático al abrir detalle) o se marca manualmente según regla única acordada. |
| **Cerrado** | Asunto resuelto; sigue en historial pero filtrable como cerrado. |

*Nota:* **Leído / no leído** es ortogonal a etiquetas como **Urgente**; en UI puede mostrarse como en correo (negrita = no leído + badges de estado).

#### 7.4.4 Tipo de mensaje (categoría de contenido)

Campo obligatorio u opcional según se defina en implementación; valores de ejemplo para **filtrar** la bandeja y acelerar la lectura administrativa:

- **Permiso laboral**
- **Producción**
- **Solicitud de vacaciones**
- **General** / **Otro**

Puede administrarse como **lista configurable** por administrador (nuevos tipos sin despliegue) o como **enum** fijo en el MVP; documentar la decisión en el modelo de datos.

#### 7.4.5 Otras carpetas (paridad con correo)

Mínimo recomendado además de **Entrada**: **Enviados** (mensajes enviados por el usuario). Opcional: **Borradores** si se implementa guardado sin enviar.

#### 7.4.6 Notificación con sonido (nuevo mensaje)

| Aspecto | Definición |
|---------|------------|
| **Disparo** | Cuando exista al menos un mensaje **nuevo** para el usuario (no leído en bandeja de entrada) **desde la última vez** que se comprobó o al detectar incremento del contador. |
| **Sonido** | Reproducir un **audio breve** (archivo estático en frontend o Web Audio) al detectar nuevo mensaje; respetar **preferencia de usuario** (“silenciar sonidos de bandeja”) en configuración de perfil o dispositivo. |
| **Detección** | **Polling periódico** mientras la app está abierta (intervalo razonable, p. ej. 30–60 s) y/o **notificación push** (PWA) si está habilitada; el sonido en **foreground** se asocia al polling o a evento push en primer plano. |
| **Accesibilidad** | No depender solo del sonido; mantener **contador** visible en el panel principal y en el ícono del módulo. |

Esta alerta es **específica de la bandeja**; las **notificaciones del sistema** (M8.9) pueden tener política de sonido aparte o compartir la misma preferencia de “silencio global” según se defina.

### 7.5 Panel de producción

La **orden o meta de producción** (qué fabricar y cuánto) la define **Mundo Terapeuta**. El ERP **consume** esa información (solo lectura respecto al núcleo de MT) y permite **desglosar**, **asignar** a trabajadores, **seguir avance**, **mermas** y **cierre** con validación del administrador. Detalle de implementación: **M8.2**, **M8.3**, **M8.4**.

#### 7.5.1 Datos que provienen de MT (obligatorio reflejar en ERP)

Para cada requerimiento de producción sincronizado, el ERP debe mostrar al menos:

| Dato | Descripción |
|------|-------------|
| **Producto a elaborar** | Identificación y nombre del producto terminado objetivo (según catálogo MT). |
| **Cantidad total a producir** | Meta global de **piezas** (o unidad de medida acordada) que MT establece para esa orden/meta. |
| **Receta** | Información de la **receta** asociada al producto en MT (pasos, referencia, versiones si aplica), para que planta sepa qué elaborar. |
| **Insumos** | Listado de **insumos necesarios** para cumplir con **toda** la producción requerida (cantidades teóricas según receta × volumen), de forma que quede claro el material de apoyo a la meta global. |

*Nota:* el contrato técnico con MT (campos exactos, periodicidad de sync) se detalla al implementar; aquí se fija el **alcance funcional** visible en pantalla.

#### 7.5.2 Vista administrador — delegación y supervisión

| Funcionalidad | Descripción |
|---------------|-------------|
| **Detalle del requerimiento** | Vista **a detalle** de la producción a cumplir según MT: producto, cantidad total, receta, insumos (§7.5.1), identificadores de enlace a MT (`external_id`). |
| **Delegación por trabajador** | El administrador **reparte** la meta entre trabajadores: para un mismo requerimiento (p. ej. **60 piezas** totales), selecciona **trabajadores** y asigna la **cantidad de piezas** correspondiente a cada uno (p. ej. trabajador A: 20, B: 25, C: 15). El sistema debe **validar** que la suma de piezas asignadas **no exceda** la meta total sincronizada (u ofrecer regla explícita si se permite buffer — por defecto: **suma ≤ total MT**). |
| **Plazo para terminar** | Por asignación o por requerimiento global (definir en modelo de datos), el admin establece el **tiempo máximo** para completar la producción delegada, expresado con **valor numérico** y **unidad**: **horas**, **días**, **semanas** o **mes(es)**. Sirve para comparar **fecha/hora límite** frente al avance real y alimentar KPIs de cumplimiento en tiempo. |
| **Supervisión y registro de progreso** | El administrador puede **consultar** el avance que registran los trabajadores y, según política operativa, **registrar o ajustar** progreso observado (p. ej. correcciones, validaciones parciales). Esto **cuantifica desempeño laboral** y permite **medir tiempos** en concluir tramos de producción (tiempo efectivo vs. plazo). |

#### 7.5.3 Vista trabajador — ejecución y cierre

| Funcionalidad | Descripción |
|---------------|-------------|
| **Listado de asignaciones** | Ve las producciones a elaborar **según lo establecido por el administrador** (producto, **piezas asignadas a él**, no necesariamente el total de MT). |
| **Bloqueo por checador (solo inicio)** | Sin **inicio de turno** registrado ese día laborable (§7.3), **no** se permite **aceptar**, **continuar** ni operar la producción (avance, merma, **finalizar**). **No** se exige **cierre de turno** para **finalizar** producción: el trabajador puede cerrar su asignación **antes** del fin de la jornada. Validación **frontend y backend** (M8.3). |
| **Información visible** | **Producto** a elaborar, **cantidad de piezas** asignadas, **plazo** (tiempo restante o fecha límite derivada del plazo configurado). |
| **Barra de progreso** | Indicador visual según **piezas completadas** vs. **piezas asignadas** (actualización al registrar avances). |
| **Registro de avance** | El trabajador va registrando **piezas completadas** (y por tanto **restantes**); puede ser por incrementos (lotes de piezas) según UX (evitar fricción en planta). |
| **Merma durante la producción** | Debe poder **registrar la merma** que va obteniendo **en el contexto** de esa asignación / producción (vínculo con M8.4). |
| **Cierre en dos pasos** | Cuando el trabajador cumplió su parte, marca la asignación como **finalizada** (estado tipo *pendiente de aprobación*). La producción **no se cierra** definitivamente hasta que el **administrador apruebe** desde su panel (**marcar como finalizado / validado**). El admin puede **devolver** o pedir corrección si el cierre no es aceptable. |

#### 7.5.4 Estados sugeridos (referencia)

Orden orientativo para el modelo de datos y la UI:

1. **Sincronizado desde MT** (requerimiento disponible, sin delegar o parcialmente delegado).  
2. **Delegado** (existen asignaciones a trabajadores con plazo).  
3. **En proceso** (hay avances o mermas registradas).  
4. **Finalizado por trabajador** (espera validación admin).  
5. **Cerrado / aprobado por administrador** (histórico para KPIs y tiempos).  
6. **Devuelto** (opcional: admin rechaza cierre y el trabajador debe corregir o completar).

### 7.6 Módulo de asistencias (calendario y justificaciones)

Complementa el **checador** del panel principal (§7.1), los **parámetros** de jornada y **descansos/comida** (§7.3, §7.3.6). Incluye **historial de solicitudes de justificación** (**§7.6.3**). Implementación: **M8.5**, **M8.6**.

#### 7.6.1 Vista administrador

| Funcionalidad | Descripción |
|---------------|-------------|
| **Calendario** | Vista por **semana** (y navegación entre semanas/meses) donde se refleja, por **día laborable**, la **asistencia** o **ausencia** de los trabajadores (derivado de checador + reglas §7.3). Donde se muestren varios trabajadores en una misma vista, puede usarse el **color identificador** del trabajador como ayuda visual (§5.1). |
| **Incidencias visibles** | Por celda o detalle: **puntual**, **retardo**, **falta** / **ausencia**, **festivo/inhábil**; en detalle diario, **franjas de descanso y comida** (salidas/regresos reales) si aplica. |
| **Hora de entrada promedio** | Métrica agregada: **vista general** (toda la planta o grupo filtrado) y/o **vista detallada por trabajador** (promedio de horas de entrada en el periodo seleccionado, solo días con registro válido). |
| **Justificación directa (admin)** | El administrador **sí puede justificar** desde su interfaz: **ausencia**, **retardo** y **faltas** (registrar motivo y, si aplica, dejar constancia administrativa). Esto actualiza el estado del día o de la incidencia para reportes y KPIs. |

#### 7.6.2 Vista trabajador — solo propia información

| Funcionalidad | Descripción |
|---------------|-------------|
| **Misma familia de UI** | Calendario y resumen **similar** en espíritu a la vista del administrador, pero **filtrado estrictamente al usuario en sesión**. |
| **Privacidad** | Entre trabajadores **no** hay visibilidad cruzada: cada uno **solo** ve sus propias **asistencias**, **ausencias**, **retardos** y **faltas**. El backend debe **forzar** el filtro por `user_id` (no confiar solo en el frontend). |
| **Sin justificar directamente** | El trabajador **no** aplica justificación sobre el registro; **no** puede reclasificar retardo/falta por sí mismo. |
| **Solicitud de justificación** | Puede **levantar una solicitud** dirigida al administrador: indica **tipo** de incidencia a discutir (p. ej. ausencia, retardo, falta) y **fecha** afectada, **motivo** y **evidencia adjunta** si aplica (imagen o documento según reglas del ERP). |
| **Resolución admin** | El administrador **aprueba** o **rechaza** la solicitud. Si **aprueba**, el sistema **aplica** la justificación al registro de asistencia (M8.6). Si **rechaza**, la incidencia mantiene su clasificación previa; el admin **debe poder ingresar un comentario** con el **motivo del rechazo** (visible al trabajador en historial y vía notificación). |

#### 7.6.3 Historial de solicitudes de justificación

Toda solicitud queda **registrada** con trazabilidad. La interfaz de **historial** es común en concepto (lista cronológica, filtros básicos) pero el **contenido y las columnas** difieren por rol.

**Estados sugeridos** (para listados, badges y filtros):

| Estado | Significado |
|--------|-------------|
| **En proceso** / **Pendiente** | Enviada por el trabajador; aún **sin** decisión del administrador. |
| **Aceptada** | Admin aprobó; la justificación quedó aplicada al registro de asistencia. |
| **Rechazada** | Admin rechazó; incidencia sin cambio de justificación; debe mostrarse el **comentario de motivo** si el admin lo capturó. |

*Opcional:* estado **Cancelada** si el trabajador retira la solicitud antes de resolución (solo si se incluye en el MVP).

**Vista trabajador**

| Aspecto | Definición |
|---------|------------|
| **Alcance** | **Únicamente** las solicitudes **propias** (`user_id` en sesión). |
| **Listado** | Fecha de envío, tipo de incidencia, fecha afectada, estado (**en proceso**, **aceptada**, **rechazada**), resumen del motivo enviado. |
| **Detalle** | Texto completo, evidencias adjuntas, **fecha/hora de resolución**, y si aplica **comentario del administrador** (especialmente en **rechazo**). |
| **Formato** | Enfocado en **seguimiento personal** (sin datos de otros empleados). |

**Vista administrador**

| Aspecto | Definición |
|---------|------------|
| **Alcance** | **Todas** las solicitudes del sistema, con filtros por **trabajador**, **estado**, **rango de fechas** y tipo de incidencia. |
| **Listado** | Incluye **nombre del trabajador** solicitante, mismos estados y fechas que en la vista trabajador, más acceso rápido a **aprobar / rechazar** las pendientes. |
| **Rechazo** | Al **rechazar**, campo **comentario / motivo del rechazo** disponible para el administrador (recomendado **obligatorio** en implementación para buena práctica operativa y transparencia con el personal). |
| **Detalle** | Misma información que el trabajador más contexto de **quién resolvió** y cuándo (auditoría). |

---

*Implementación:* entidad **`solicitud_justificacion_asistencia`** con campos mínimos: solicitante, tipo, fecha incidencia, motivo, evidencias, **estado**, **comentario_rechazo** (nullable; relleno solo si estado = rechazada), **resuelto_por**, **resuelto_en**. Notificación vía **M8.9**; opcional enlace con **bandeja** (M8.8) — una sola cola operativa para el admin.

### 7.7 Permisos y vacaciones (calendarios y apelaciones de fechas)

Módulo con **calendarios interactivos** pensados para **PWA**: controles táctiles amplios, buen comportamiento en **móvil y escritorio**, y rendimiento aceptable al pintar muchas celdas (meses, colores por trabajador). Detalle de implementación: **M8.7**.

#### 7.7.1 Principios de UX (PWA)

| Criterio | Definición |
|----------|------------|
| **Intuitivo** | Navegación mensual clara, leyenda de colores, toques fáciles en pantallas pequeñas. |
| **Adaptado a móvil** | Gestos de **mantener presionado y arrastrar** para rangos de fechas donde aplique; alternativa siempre disponible con **entrada manual** (inputs de fecha). |
| **Coherencia** | Misma lógica de selección de fechas en trabajador (nueva solicitud) y visualización en admin (mes agregado). |

#### 7.7.2 Vista administrador

| Elemento | Descripción |
|----------|-------------|
| **Vista inicial** | **Calendario mensual** con **permisos** y **vacaciones**: cada trabajador se distingue por su **color identificador** (elegido en perfil) **y** **nombre** en leyenda/tooltip/celdas (según densidad de información). |
| **Regreso a laborar** | Debe quedar visible el **primer día en que el trabajador regresa a laborar** tras el periodo (p. ej. indicador en el día siguiente al último día de ausencia o etiqueta en tooltip/detalle). |
| **Detalle por día** | Al **seleccionar la casilla del día** se abre **vista de detalle** (lista de ausencias/permisos/vacaciones ese día, trabajadores afectados, tipo, estado). |
| **Solicitudes pendientes** | Apartado o pestaña con **todas** las solicitudes que los trabajadores elevaron para **vacaciones** o **permisos**, pendientes de resolución o en **apelación de fechas**. |
| **Programación por admin** | Si el trabajador solicita vacaciones/permiso **sin definir fechas** (o con fechas incompletas según reglas), el administrador puede **proponer fechas sugeridas** de programación. El trabajador es **notificado** y puede **aceptar** esa propuesta o **apelar** (contra-proponer otras fechas). |
| **Solicitud con fechas del trabajador** | Si el trabajador **sí** indicó fechas concretas, el administrador puede **aceptar** la solicitud tal cual o **apelar** (proponer fechas alternativas). El trabajador puede **aceptar** o **apelar** a su vez. |
| **Aceptar, apelar o rechazar** | En **cualquier** estado previo a la **aceptación final** de la solicitud, **ambos** roles tienen acción **Rechazar** (cierra la solicitud como **rechazada** sin fechas acordadas) además de **Aceptar** o **Apelar** con nuevas fechas/horas. **Mientras** dure la negociación, el botón **Rechazar** sigue disponible. **Una vez** la solicitud pasa a **aceptada** (acuerdo de fechas/horas), **ya no** se puede rechazar ni seguir apelando. |
| **Cierre por aceptación** | Las **apelaciones** no tienen **límite** de rondas. El flujo termina en **aprobado** cuando **cualquiera de las dos partes acepta** la última propuesta del otro, **o** termina en **rechazado** si alguno usa **Rechazar** antes de ese acuerdo. |

#### 7.7.3 Vista trabajador

| Elemento | Descripción |
|----------|-------------|
| **Entrada al módulo** | Vista con **solicitudes pendientes**, **aprobadas** y **rechazadas** (si existen); opción clara de **iniciar nueva solicitud**. |
| **Nueva solicitud** | Tipo: **permiso** o **vacaciones** (saldo por antigüedad donde aplique, M8.7). Alcance: **día(s) completo(s)** y/o **franjas por horas** el mismo día (definir UX: selector de hora inicio/fin por día seleccionado). |
| **Calendario dinámico** | **Día por día**; **arrastre** (mantener presionado) para rangos; **inputs** manuales de fecha/hora que se reflejan en el calendario. |
| **Historial** | Listado de **todas** sus peticiones con **estado**: **en proceso** (incluye negociación de fechas), **aprobadas**, **rechazadas**. |
| **Apelación del administrador** | Si el admin propone fechas distintas, el trabajador ve en **detalle** (idealmente en el mismo calendario) la comparación: **fechas que él solicitó** vs **fechas que el administrador propone**. Puede **aceptar** la propuesta del admin o **apelar** (nueva propuesta). |
| **Sin límite de apelaciones** | Mismo criterio que en §7.7.2: el hilo de ida y vuelta termina cuando **uno de los dos acepta** la propuesta del otro. |

#### 7.7.4 Datos y auditoría

- Conservar **historial de rondas** de propuestas (quién propuso qué fechas **y/u horas** y cuándo) para transparencia y soporte a RRHH.
- Modelar explícitamente **periodos por horas** (fecha + hora inicio / hora fin) además de **días completos**.
- El **calendario mensual del admin** debe alimentarse de las **fechas finales aprobadas** y, opcionalmente, de solicitudes **en negociación** (configurable para no saturar la vista).

---

## 8. Módulos y flujos (para implementación)

Cada módulo lista **actores**, **flujo principal** y **notas**. Las APIs concretas (REST + DTOs) se derivan de aquí.

### M8.0 Parámetros del sistema (calendario, jornadas, puntualidad, descansos y comida)

| Paso | Acción |
|------|--------|
| 1 | Administrador abre **Parámetros del sistema** desde el menú del panel de administración. |
| 2 | Configura **días laborables** de la semana (p. ej. lunes–sábado). |
| 3 | Define **jornada lunes–viernes**: hora de entrada, hora de salida/fin, minutos de tolerancia. |
| 4 | Si el sábado es laborable, define **jornada sábado** (entrada, salida/fin, tolerancia propias — jornada acotada). |
| 5 | Administra **festivos / inhábiles** por fecha (calendario oficial u otras disposiciones), con opción de etiqueta (nombre del festivo). |
| 6 | Configura **descansos y comida** globales (**§7.3.6**): **duración nominal** del **primer descanso** (p. ej. 20 minutos); **comida**: p. ej. **hora a partir de la cual** puede iniciarse (y opcionalmente duración máxima o fin de ventana). |
| 7 | Guarda cambios; el backend persiste reglas con **vigencia desde** cuando aplique (auditoría / histórico). |
| 8 | **Checador y faltas** (M8.5, M8.6) resuelven primero el **tipo de día** (§7.3.4). |
| 9 | Cada **chequeo de entrada** en día laborable aplica **puntual** / **retraso** (§7.3.5). |
| 10 | **Dashboard** (M8.11) y reportes usan **puntualidad**, asistencia y, si aplica, tiempos de **break/comida** vs. nominal. |

### M8.1 Autenticación y sesión

| Paso | Acción |
|------|--------|
| 1 | Usuario ingresa identificador + PIN de 4 dígitos. |
| 2 | Backend valida credenciales; emite sesión (token/cookie). |
| 3 | Frontend carga **layout** según rol y redirige al **panel principal** correspondiente. |
| 4 | Cierre de sesión invalida token o sesión en servidor/Redis si aplica. |

### M8.2 Sincronización / lectura de objetivos (MT → ERP)

Referencia funcional: **§7.5.1**.

| Paso | Acción |
|------|--------|
| 1 | **Job programado** (cron / cola) o disparo manual admin ejecuta la sincronización con MT según contrato; en el MVP se prioriza **periodicidad configurable** (p. ej. cada X minutos). Evolución futura: intervalos menores o **casi tiempo real**. |
| 2 | Se trae el **requerimiento de producción**: producto, **cantidad total**, **receta**, **insumos**, metadatos (`external_id`, fechas MT si aplica). |
| 3 | ERP persiste **copia operativa** para consulta en planta (solo lectura del núcleo MT). |
| 4 | El **administrador** ve el requerimiento completo antes de **delegar**; el **trabajador** no ve el requerimiento global hasta que exista **asignación** hacia él (§7.5). |

*El ERP no escribe en MT en el MVP salvo acuerdo explícito futuro.*

### M8.3 Producción: delegación, avance y cierre (Admin + Trabajador)

Referencia funcional: **§7.5.2**, **§7.5.3**, **§7.5.4**.

| Paso | Acción |
|------|--------|
| 1 | **Admin** selecciona un requerimiento sincronizado (M8.2) y define **delegación**: uno o más trabajadores, **piezas asignadas** por trabajador (suma controlada frente al total MT). |
| 2 | **Admin** define **plazo** para cumplir la asignación (o el requerimiento): valor + unidad (**horas**, **días**, **semanas**, **meses**); el sistema calcula **fecha/hora límite** mostrada al trabajador. |
| 3 | Estado pasa a **delegado** / **en proceso** según reglas. |
| 4 | **Trabajador** abre su asignación: ve producto, piezas propias, plazo, **barra de progreso**. |
| 5 | **Precondición (§7.5.3):** sin **inicio de turno** ese día laborable, el backend **rechaza** **aceptar / continuar / avance / merma / finalizar**. **El fin de turno (cierre de jornada) no es requisito** para **finalizar** producción: puede finalizarse **antes** del cierre del turno. |
| 6 | Trabajador registra **incrementos de piezas completadas** (y restantes); opcional: notas o **evidencias** si las reglas del MVP lo exigen. |
| 7 | Trabajador registra **mermas** asociadas a esa asignación (encadenar con M8.4). |
| 8 | Trabajador marca **finalizado** (cumplió su cuota o declaración de término) → estado **pendiente de aprobación administrador**. |
| 9 | **Admin** revisa, puede **registrar o ajustar** observaciones de progreso para métricas de desempeño y tiempo. |
| 10 | Admin **aprueba** (cierra asignación) o **devuelve** con motivo para corrección. |
| 11 | Cuando todas las asignaciones de un requerimiento están cerradas según regla de negocio, el requerimiento puede marcarse **completado en ERP** (sin implicar escritura en MT salvo contrato futuro). |
| 12 | Historial auditable (delegación, avances, mermas, cierres, tiempos) para KPIs. |

### M8.4 Mermas

| Paso | Acción |
|------|--------|
| 1 | **Trabajador** registra **merma** durante la ejecución de una **asignación de producción** (§7.5.3); opcionalmente admin según política. |
| 2 | Captura: cantidad, causa, vínculo explícito a **asignación / producto**, evidencia opcional. |
| 3 | Si supera umbral configurado, genera **notificación** a administración. |
| 4 | KPIs de admin agregan **total de mermas** por periodo, por trabajador y por requerimiento. |

### M8.5 Asistencia, turno, descansos y comida

Referencias: **§7.3.6**, **§7.6**.

| Paso | Acción |
|------|--------|
| 1 | Para la **fecha actual**, el sistema resuelve **tipo de día** (festivo, no laborable por semana, sábado con jornada corta, o estándar) según **§7.3.4**. |
| 2 | Si el día es **inhábil**, el checador indica **día no laborable**; no aplica puntualidad/retraso ni falta por omisión de checador. |
| 3 | Si es **laborable**, el trabajador registra **inicio de turno** y, cuando corresponda al cierre real de su jornada, **fin de turno** (independiente del cierre de producción — §7.5.3). |
| 4 | Al **inicio de turno**, aplica **§7.3.5**: **puntual** o **retraso**. |
| 5 | Con turno iniciado, el trabajador registra marcas **obligatorias por política operativa**: **salida** al **primer descanso** y **regreso**; **salida** a **comida** y **regreso**. Cada marca guarda **hora real** (el trabajador puede adelantar o atrasar respecto a un horario ideal). Parámetros globales (§7.3.6) sirven de referencia y reportes. |
| 6 | Validar **secuencia** (p. ej. no “regreso” sin “salida” previa del mismo tipo; no segunda salida a comida sin regreso anterior) y evitar solapamientos absurdos. |
| 7 | **Administrador** consulta calendario (§7.6.1) con resumen de asistencia y, en detalle, **franjas de break y comida**. |
| 8 | **Trabajador** consulta **solo propio** historial de marcas (§7.6.2). |

### M8.6 Faltas, retardos, ausencias y justificaciones

Referencia funcional: **§7.6** (incl. **§7.6.3** historial).

| Paso | Acción |
|------|--------|
| 1 | **Incidencias:** **falta** por **no checar** en día **laborable** (§7.3.4), **retardo** por checador después del límite (§7.3.5), **ausencia** visible en calendario cuando no hay asistencia registrada en día laborable. **Festivos / inhábiles:** sin falta por omisión. |
| 2 | **Trabajador:** crea **solicitud** con estado **pendiente / en proceso** (tipo, fecha afectada, motivo, evidencia opcional). **No** altera la incidencia hasta resolución. |
| 3 | **Listados / historial:** API filtrada por rol — trabajador solo **propias** solicitudes; admin **todas**, con filtros (trabajador, estado, fechas). |
| 4 | **Administrador:** **aprueba** → estado **aceptada**, aplica justificación al registro de asistencia, `resuelto_por` / `resuelto_en`. |
| 5 | **Administrador:** **rechaza** → estado **rechazada**, clasificación de incidencia sin cambio; **comentario de motivo del rechazo** (campo en entidad; recomendado obligatorio en UI). Notificación al trabajador con el comentario. |
| 6 | **Administrador:** **justificar de oficio** desde calendario (§7.6.1) sin solicitud previa; opcionalmente registrar en historial como “resolución administrativa directa” si se desea trazabilidad unificada (a decidir en ER). |
| 7 | Reportes y KPIs usan estados finales y **hora de entrada promedio** (§7.6). |

### M8.7 Vacaciones y permisos

Referencia funcional: **§7.7**.

| Paso | Acción |
|------|--------|
| 1 | Sistema calcula **saldo de vacaciones** (si aplica) según **antigüedad** y parametría ERP; validaciones (días disponibles, solapes, **permisos por horas** vs. días completos). |
| 2 | **Trabajador** crea solicitud: tipo **vacaciones** o **permiso**; fechas/horas **opcionales** (puede enviar sin fechas para que admin proponga). UI: calendario (**día a día**, **arrastre**, **inputs** manuales) + franjas **por horas** cuando aplique. |
| 3 | Estado inicial: **pendiente** o **en negociación** según corresponda. |
| 4 | **Administrador** — **calendario mensual**: usar **color identificador** del trabajador (perfil) + nombre; **día de regreso**; **click en día** → detalle. |
| 5 | **Administrador** — **solicitudes pendientes**: acciones **Aceptar**, **Apelar** (contra-propuesta de fechas/horas) o **Rechazar** mientras la solicitud **no** esté **aceptada** finalmente. Misma disponibilidad de **Rechazar** durante **apelaciones** (§7.7.2). |
| 6 | **Trabajador** — ante propuesta del admin: comparativa **solicitado vs. propuesto**; **Aceptar**, **Apelar** o **Rechazar** (hasta que exista **aceptación** final). |
| 7 | **Iteración sin límite** de apelaciones; cierre en **aprobada** si uno **acepta** la última propuesta del otro; cierre en **rechazada** si alguno usa **Rechazar** antes del acuerdo. **Tras aprobada**, no hay más **Rechazar** ni apelaciones. |
| 8 | **Historial** y **log** de rondas (fechas, horas, autor, timestamp). |
| 9 | Calendario admin y reportes usan **fechas/horas finales aprobadas**; opcional mostrar en negociación. |

### M8.8 Bandeja de entrada y mensajería (correo interno)

Referencia de producto: **§7.4**. Modelo **REST** (crear mensaje, listar bandeja, marcar leído, cambiar estado, subir adjuntos).

| Paso | Acción |
|------|--------|
| 1 | Usuario abre el módulo; por defecto ve **bandeja de entrada** (no leídos / leídos, orden acordado en §7.4.1). |
| 2 | **Redactar:** elige **uno o más destinatarios** (mismo mensaje para todos), **tipo de mensaje** (categoría), **estado inicial** si aplica (p. ej. Urgente), **título**, **cuerpo** (texto con preservación de saltos de línea y espacios) y **adjuntos** de imagen opcionales. |
| 3 | **Enviar:** el backend persiste el mensaje (y archivos en almacenamiento definido) y crea **un ítem de bandeja por cada destinatario** (misma copia del contenido); el estado **leído** y las respuestas en hilo se rastrean por participante según reglas del §7.4. |
| 4 | **Responder** (opcional en hilo): crea mensaje vinculado al hilo; actualiza estados posibles (**en espera de respuesta** → al responder puede pasar a otro estado según regla). |
| 5 | **Cada destinatario** que **abre** el mensaje en su bandeja → marca **leído** para ese usuario (automático). Cambios de **estado** del hilo (cerrado, etc.) según permisos y reglas acordadas (§7.4.3). |
| 6 | Listados filtrables por **tipo de mensaje**, **estado**, búsqueda por título o remitente. |
| 7 | **Contador de no leídos** en API para el panel principal (§7.1, §7.2). |
| 8 | Cliente ejecuta **polling** (o recibe push) para nuevos mensajes; si hay **nuevo no leído** y no está silenciado, reproduce **sonido** (§7.4.6). |

*Auditoría:* conservar remitente, **lista de destinatarios** (todos los del envío múltiple), fechas y metadatos. *No hay lista blanca:* cualquier usuario activo puede ser incluido en un envío, uno o muchos a la vez.

### M8.9 Notificaciones del sistema

Centro de notificaciones **apartado** de la **bandeja de entrada** (M8.8): aquí solo **eventos del sistema** (badges, lista, push opcional). Ejemplos acordados para el MVP:

| Categoría | Ejemplos de evento |
|-----------|-------------------|
| **Producción** | Nueva **asignación** delegada al trabajador; producción **devuelta** por admin; recordatorios de plazo (si se implementan). |
| **Permisos y vacaciones** | **Apelación** de fechas/horas (admin → trabajador o viceversa); solicitud **aceptada** o **rechazada**; permiso/vacaciones **aprobados**. |
| **Asistencia** | Nueva solicitud de **justificación**; resultado **aprobado/rechazado** de justificación. |
| **Mensajería** | Aviso de **nuevo mensaje en bandeja** (el contenido del mensaje se lee en **Bandeja**, no duplicar el cuerpo en la notificación si se prefiere minimalismo). |
| **Otros** | Merma fuera de umbral; falta sin justificar; etc. |

Entrega: lista en app + opcional **push web** (PWA). **Sonido** para **nuevo mensaje de bandeja** se define en **§7.4.6 / M8.8**; las notificaciones M8.9 pueden compartir preferencia de silencio o tener toggle independiente (a decidir en UX).

### M8.10 Personal / Trabajadores (solo administrador)

Menú **Personal** o **Trabajadores**; no visible para rol trabajador.

| Paso | Acción |
|------|--------|
| 1 | Admin crea usuario: nombre, puesto, antigüedad, identificador de login, **PIN inicial** (o flujo de invitación). |
| 2 | Edición de los mismos campos; **inactivar** en lugar de borrar físico (recomendado). |
| 3 | Asignación de rol **Trabajador** o **Administrador**. |
| 4 | Campo **color identificador**: valor por defecto en alta; el **trabajador** lo puede cambiar desde **su perfil** (paleta acotada; validar duplicados en planta si se desea evitar confusiones en calendarios). |

### M8.11 Dashboard y KPIs (Administrador)

| KPI | Fuente resumida |
|-----|-----------------|
| Asistencia / puntualidad | Checador + §7.3/M8.0 + **calendario** §7.6: puntual vs. retraso, **promedio hora de entrada** (planta o por trabajador), incidencias justificadas vs. no justificadas. |
| Producción pendiente / en proceso | Asignaciones por estado (**§7.5.4**), pendientes de aprobación, plazos vencidos o en riesgo. |
| Mermas | Agregados M8.4 por asignación / requerimiento. |
| Productividad / tiempos | Piezas completadas vs. asignadas, cumplimiento de plazo (horas/días/semanas/mes), registros de admin y trabajador (fórmula mínima en implementación). |

---

## 9. Matriz rol × capacidad (referencia rápida)

| Capacidad | Trabajador | Administrador |
|-----------|:----------:|:-------------:|
| Login PIN | ✓ | ✓ |
| Checador / fin de turno | ✓ | — |
| Producción (requiere **entrada** checador; avance, merma, finalizar) | ✓ | Delegar, supervisar, aprobar cierre |
| Permisos y vacaciones (días/horas, apelar, **rechazar** hasta aceptar) | ✓ | Calendario planta, pendientes, programar, aceptar/apelar/**rechazar** |
| Perfil: **color identificador** | ✓ | Alta/edición en Personal; ver en calendarios |
| Solicitar justificación + **historial propio** | ✓ | **Historial global** + aprobar/rechazar (**comentario si rechazo**); justificar de oficio |
| Bandeja de entrada (M8.8) | ✓ | ✓ |
| Notificaciones del sistema (M8.9) | ✓ | ✓ |
| Personal / Trabajadores (M8.10) | — | ✓ |
| Dashboard KPIs globales | — | ✓ |
| Calendario asistencias (§7.6) | Solo **propio** usuario | Todos los trabajadores + promedio entrada + justificar |
| Parámetros (jornada, festivos, tolerancia, **break/comida** §7.3.6) | — | ✓ |

---

## 10. Stack tecnológico (alineado con Mundo Terapeuta)

| Capa | Tecnología |
|------|------------|
| **Frontend** | **Angular** + **TypeScript**; **PWA** (`@angular/service-worker`, `manifest`, iconos, estrategia de caché). |
| **Backend** | **NestJS** + **TypeScript**; REST + DTOs (recomendación MVP, ver §11 histórico en doc anterior — mantener en README/ADR). |
| **Base de datos** | **PostgreSQL**. |
| **Redis** | Sesiones, rate limiting, colas ligeras, cachés si aplica. |
| **Mensajería interna** | **REST** + almacenamiento de adjuntos (disco/S3/Cloudinary según decisión); **polling** o **push** para avisar novedades en bandeja (**no** WebSocket obligatorio para el MVP de correo interno). |

---

## 11. PWA — consideraciones

| Tema | Criterio |
|------|----------|
| **Instalación** | `manifest.webmanifest`, nombre/iconos del ERP; `display: standalone` o similar. |
| **Actualizaciones** | Service worker con aviso de “nueva versión” para recargar (patrón habitual en Angular PWA). |
| **Offline** | **No prometer** producción completa offline en el MVP; opcional: **cache** de shell de la app y **cola local** solo para checador con **riesgo** de conflicto — si se implementa, definir regla de reconciliación. Por defecto: **online-first** para datos críticos. |
| **Push** | **Web Push** opcional para notificaciones cuando la PWA está instalada (requiere claves VAPID y permisos); puede reutilizarse para avisar **nuevo mensaje en bandeja** además de eventos M8.9. |
| **Sonido (bandeja)** | Ver **§7.4.6**; respetar silencio del usuario y políticas del navegador (autoplay). |
| **Dispositivos** | Priorizar **móvil** en UX del trabajador (botones grandes, checador accesible). |
| **Calendarios (vacaciones / permisos)** | Cumplir **§7.7.1**: componente de calendario táctil, arrastre para rangos, inputs manuales; probar en viewport PWA instalada. |

---

## 12. API: REST + DTOs vs GraphQL

**Recomendación MVP:** **REST + DTOs** para la mayoría de módulos, incluida la **bandeja de mensajes** (M8.8). **WebSocket** solo si en el futuro se exige bandeja “casi en tiempo real” sin polling; no es requisito del diseño actual. Reevaluar GraphQL solo si surgen necesidades fuertes de agregación. Integración MT: **REST o jobs** acordados; no depender del GraphQL de MT salvo decisión explícita del equipo MT.

---

## 13. Beneficios esperados

- Visión única de **producción + asistencia + permisos** en un solo lugar.
- **PIN + PWA** reducen fricción en planta frente a contraseñas largas en escritorio.
- Administración con **validación** explícita y **KPIs** accionables.

---

## 14. Fuera de alcance explícito (MVP)

- Sustituir módulos comerciales de MT.
- Escritura en base de datos de MT (salvo contrato futuro explícito).
- Offline complejo sin especificación de reconciliación.
- **Sincronización casi en tiempo real** con MT para producción: en el MVP basta **job periódico**; acercar a tiempo real queda como **evolución** posterior.

---

## 15. Orden de implementación técnica (bootstrap)

Antes de desarrollar pantallas de negocio, se debe **preparar y estabilizar** el entorno de proyecto:

| Fase | Contenido |
|------|-----------|
| **15.1 Repositorio y backend** | Crear proyecto **NestJS** (estructura modular, configuración por entorno, **PostgreSQL** + **TypeORM** o Prisma según criterio del equipo, **Redis** si aplica desde el inicio), CORS, validación global, prefijo `/api`, health check. |
| **15.2 Frontend** | Crear proyecto **Angular** (standalone, routing, **PWA** con service worker y `manifest`, proxy o env para API, estilos base / design tokens alineados a MT si se desea). |
| **15.3 Calidad compartida** | ESLint/Prettier, scripts `dev`, convenciones de commits opcional, Docker Compose opcional (app + postgres + redis) para paridad local. |
| **15.4 Inicio de features** | Una vez **15.1–15.3** listos y desplegables en local, comenzar por el **frontend** (shell, auth PIN, layout por rol) consumiendo endpoints mínimos del backend; luego módulos según prioridad del §4.1. |

*Nota:* El usuario ha indicado que, tras configurar dependencias y proyecto, el arranque de desarrollo de producto puede **comenzar por el frontend**.

---

## 16. Próximos pasos de producto / datos (antes o en paralelo al código)

1. **Diagrama ER** (usuarios, asignaciones, producción, mermas, **marcas de turno/break/comida**, solicitudes, mensajes, notificaciones).
2. **Contrato MT** (campos mínimos de orden/objetivo y frecuencia de sync).
3. **Reglas de horario** — **§7.3 / M8.0** (jornada, tolerancia, **§7.3.6 break/comida**); pendiente **zona horaria** y **vigencia** de cambios retroactivos.
4. **Wireframes** del checador y del home admin/trabajador (validar con usuarios reales).
5. **Bandeja:** matriz de permisos de **quién puede cambiar qué estado** en un hilo; límites de tamaño de adjuntos; lista fija vs. configurable de **tipos de mensaje**.
6. **Producción:** entidades `requerimiento_mt`, `asignación` (trabajador, piezas, plazo, unidad de tiempo), eventos de avance, regla exacta **suma piezas ≤ total MT**; contrato API MT para receta e insumos.
7. **Asistencias:** entidad `solicitud_justificacion_asistencia` (solicitante, tipo, fecha incidencia, motivo, evidencia, **estado**: pendiente \| aceptada \| rechazada, **comentario_rechazo**, **resuelto_por**, **resuelto_en**); endpoints de **historial** por rol; validar comentario en rechazo según política de producto.
8. **Permisos y vacaciones:** solicitud con tipo, **días completos y franjas por horas**, propuestas por actor, **estado** (pendiente, en_negociación, aprobada, rechazada), **rondas de apelación** + acción **rechazar** hasta aceptación final; APIs y vista mensual admin con **color identificador** por trabajador.
9. **Usuarios:** campo `color_identificador` (paleta, unicidad opcional); regla **solo inicio de turno** antes de operaciones de producción; **sin** exigir fin de turno para finalizar producción (validación en API).  
10. **Marcas de jornada:** entidad o filas para `inicio_turno`, `fin_turno`, `salida_break`, `regreso_break`, `salida_comida`, `regreso_comida` (timestamps, `user_id`, fecha laboral); parámetros globales `duracion_break_nominal_min`, `comida_hora_desde` (y campos adicionales según §7.3.6).
11. **Notificaciones vs. bandeja:** modelo de datos de `notificacion_sistema` separado de mensajes M8.8.

---

*Documento vivo. Actualizar ER, contrato MT (job → casi tiempo real en fase 2) y catálogos (tipos de mensaje, paleta de colores).*
