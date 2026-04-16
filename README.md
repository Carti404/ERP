# ERP Horizonte — Sistema de Gestión Interna

ERP integral dedicado a la administración, control de personal, clima laboral y medición de producción. Este sistema centraliza las operaciones críticas de la planta y se integra con el ecosistema de **Mundo Terapeuta** para el seguimiento de abastecimiento e inventarios.

---

##  Módulos Principales

- **Administración de Personal**: Gestión de fichas de trabajadores, cargos y roles.
- **Asistencia y Jornada**: Control de entradas, salidas, pausas y cálculo automático de incidencias.
- **Producción**: Delegación de tareas, seguimiento de avances en tiempo real y registro de mermas.
- **Vacaciones y Permisos**: Sistema de solicitud y gestión de periodos de descanso con rondas de negociación.
- **Mensajería Interna**: Chat moderno para comunicación entre administración y trabajadores.
- **Sistema de Notificaciones**: Alertas críticas sobre eventos del sistema y clima laboral.

---

## 🛠️ Stack Tecnológico

### Backend (`erp-api`)
- **Framework**: NestJS (Node.js)
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM
- **Almacenamiento**: Cloudinary (Integración para archivos y evidencias)
- **Seguridad**: Autenticación vía JWT con validación de PIN.

### Frontend (`erp-web`)
- **Framework**: Angular 17+
- **Estilos**: Tailwind CSS 4+
- **PWA**: Soporte nativo para Progressive Web App (Service Worker).
- **Diseño**: Interfaz moderna, responsiva y premium.

---

## 📂 Estructura del Proyecto

```text
ERP/
├── erp-api/        # Backend API (NestJS)
├── erp-web/        # Frontend Application (Angular)
├── Docs/           # Documentación técnica y resúmenes de implementación
├── agents/         # Diseños, mockups y recursos de UI/UX
└── README.md       # Este archivo
```

---

## ⚙️ Configuración del Entorno

### Backend
1. Entrar en `erp-api/`.
2. Copiar `.env.example` a `.env` y configurar las variables (DB, Cloudinary, JWT).
3. Instalar dependencias: `npm install`.
4. Ejecutar migraciones/setup: `npm run db:setup`.
5. Iniciar: `npm run start:dev`.

### Frontend
1. Entrar en `erp-web/`.
2. Instalar dependencias: `npm install`.
3. Configurar el endpoint del API en `src/app/core/environment.ts`.
4. Iniciar: `npm start`.

---

## 📖 Documentación Adicional

Para más detalles sobre la arquitectura y fases de implementación, consulte los archivos en la carpeta `Docs/`:
- [Infrastructure Horizonte](./Docs/HORIZONTE_BACKEND_INFRAESTRUCTURA.md)
- [MVP ERP](./Docs/MVP_ERP.md)
- [Contexto de Mensajería](./Docs/contexto_mensajeria_abr_2026.md)

---

> [!NOTE]
> Este sistema está diseñado para operar en una planta con zona horaria única (UTC para persistencia, Local para visualización).
