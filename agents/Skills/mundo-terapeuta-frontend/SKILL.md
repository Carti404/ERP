---
name: mundo-terapeuta-frontend
description: Frontend Angular Mundo Terapeuta: estructura por tipo (components, services, guards, pages), rutas y guards por rol (público, cliente, CEDIS, CIBE, admin), estilos con Tailwind y utilidades. Usar al crear o modificar componentes, rutas, guards, servicios o páginas en frontend.
---

# Frontend Angular – Mundo Terapeuta

## Cuándo usar esta skill

Aplicar al trabajar en `frontend/`: componentes, páginas, rutas, guards, servicios, modelos o estilos (Tailwind, utilidades).

## Estructura de carpetas

```
frontend/src/app/
├── components/   # reutilizables (ui, layout)
├── guards/        # AuthGuard, RoleGuard (por rol), PaymentInProgressGuard
├── interceptors/  # JWT, errores
├── models/        # interfaces (niveles, puntos, usuario, API snake_case)
├── pages/         # por ruta/rol: home, catálogo, auth, dashboard-user, dashboard-cedis, dashboard-cibe, panel-admin
├── services/      # auth, API, OTP, pagos, niveles, puntos
└── styles/        # variables, mixins, clases globales
```

## Rutas y roles

- **Públicas:** home, presentación, catálogo (solo ver), registro/login. Sin guard.
- **Usuario registrado (cliente/distribuidor):** dashboard (nivel, puntos, beneficios, requisitos), compras, contenido, Red, Mi oficina. `AuthGuard` + `RoleGuard` para roles que no sean CEDIS/CIBE/admin cuando aplique.
- **CEDIS:** dashboard CEDIS (ventas, inventario, crear CIBE, tienda/mapa). `AuthGuard` + `RoleGuard(['cedis'])`.
- **CIBE:** dashboard CIBE (vender, subir videos, actividades; subcomisiones y puntos internos). `AuthGuard` + `RoleGuard(['cibe'])`. No mostrar ni permitir acceso a rutas de Red.
- **Admin:** Panel de Control (niveles, puntos, contenidos, CEDIS/CIBE, reglas). `AuthGuard` + `RoleGuard(['admin'])`.

Lazy loading por área (auth, user, cedis, cibe, admin) cuando sea posible.

## Guards

- **AuthGuard:** usuario autenticado (token válido); si no → redirigir a login.
- **RoleGuard:** comprobar rol desde AuthService/API (cliente, cedis, cibe, admin); si no permitido → 403 o redirigir.
- **PaymentInProgressGuard:** evitar salir de checkout durante cobro (beforeunload + estado “pago en curso”).

## Estilos

- **Tailwind:** uso consistente; no hardcodear colores/espaciados que existan en tema o utilidades.
- **Clases globales:** definir en `styles/` y usar en templates para evitar duplicación.
- **Variables/mixins:** en `_variables.scss`, `_mixins.scss`; importar en `styles.scss`.

## Convenciones

- Código en **inglés**; comentarios en **español**.
- API: payloads en **snake_case**; mapear a camelCase en modelos si se desea en frontend.
- Seguir reglas de Angular del proyecto (standalone, signals, control flow nativo, etc.) según `.cursor/rules/angular-typescript.mdc`.

## Páginas por rol

- **Dashboard usuario:** nivel actual, puntos, beneficios activos, requisitos pendientes.
- **Dashboard CEDIS:** ventas, inventario, alta tienda/mapa, crear trabajador (CIBE).
- **Dashboard CIBE:** ventas, subir videos, actividades; subcomisiones y puntos internos (no red).
- **Panel admin:** configuración niveles (requisitos/beneficios), puntos, contenidos, CEDIS/CIBE, activar/desactivar reglas; KPIs.

## Referencia

Ver `docs/plan-frontend.md` en la raíz del proyecto. para fases y tareas detalladas.
