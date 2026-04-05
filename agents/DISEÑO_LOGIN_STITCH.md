# Diseño de login (Google Stitch) — ERP Planta / Ironclad Forge

Documentación de referencia para implementar la pantalla de acceso conforme al proyecto Stitch **Plant Operations PWA** y los design systems exportados por MCP.

## Proyecto y pantallas en Stitch

| Campo | Valor |
| --- | --- |
| Proyecto Stitch | **Plant Operations PWA** |
| `projectId` | `2053769141726469018` |
| Pantalla claro (móvil, referencia principal) | **Login - Premium (Móvil)** — `screens/ee38f5cd196f4753bcd105282175425e` |
| Pantalla oscuro (móvil) | **Login (Oscuro)** — `screens/9a19fd1330704e9b8e4bbe4f70cdf22d` |

Copias HTML exportadas (para diff visual con la app): `agents/stitch-login-light.html`, `agents/stitch-login-dark.html`.

## Design systems (MCP `list_design_systems`)

| Asset | Nombre | Modo |
| --- | --- | --- |
| `assets/f81dc995e86b4999ba317b21fb1d85f8` | **Ironclad Forge** | Claro (`LIGHT`), Inter, `ROUND_FOUR` |
| `assets/763ee60ca86946f0b36550c2790aaf55` | **Ironclad Forge: Obsidian** | Oscuro (`DARK`), Inter, `ROUND_FOUR` |

La especificación narrativa completa del sistema (reglas “No-Line”, tipografía editorial, mandato 48px en botones, etc.) vive en el campo `designMd` de cada asset en Stitch; aquí se resumen solo los tokens relevantes al **login**.

## Variante clara (Login Premium — resumen de UI)

1. **Marco exterior:** fondo `slate-950`, en desktop imagen industrial opcional y gradiente.
2. **Contenedor principal:** tarjeta tipo terminal móvil (`max-w-[390px]`), borde grueso `slate-900`, esquinas muy redondeadas en viewport desktop.
3. **Cabecera:** gradiente radial “industrial” (`#1B263B` → `#0D131E`), glows azules sutiles, logo cuadrado blanco con icono `precision_manufacturing`, título en mayúsculas con tracking amplio, subtítulo pequeño en gris.
4. **Bloque flotante:** tarjeta blanca superpuesta (`-mt-6`) con sombra.
5. **Campo “Staff Identification”:** label en `label` uppercase; input con icono `badge`, fondo gris muy claro, focus con acento azul `#3498DB`.
6. **PIN:** cuatro anillos (vacío / relleno con azul y glow).
7. **Teclado:** rejilla 3×4; teclas blancas con sombra suave y borde muy tenue; fila inferior: retroceso, `0`, huella (decorativo).
8. **CTA primario:** botón alto (~64px), fondo `#1B263B`, texto blanco, icono `arrow_forward` en acento azul.
9. **Pie del formulario:** enlace “Reset Access” + chip de estado “Terminal-XX Secure” con punto verde pulsante.

### Tokens Tailwind usados en el HTML de Stitch (claro)

Definidos en el `<script id="tailwind-config">` del export:

| Token | Hex / valor |
| --- | --- |
| `primary` | `#1B263B` |
| `primary-dark` | `#0D131E` |
| `primary-light` | `#415A77` |
| `accent-blue` | `#3498DB` |
| `accent-orange` | `#E67E22` |
| `surface` | `#F8F9FA` |
| `on-surface` | `#191C1D` |
| `surface-container` | `#EDEEEF` |
| `outline-variant` | `#C5C6CD` |

Radios extendidos en Stitch (claro): hasta `3xl` / `rounded-[3rem]` en el marco del teléfono.

## Variante oscura (Login Obsidian — resumen de UI)

Enfoque más “terminal militar”: menos tarjeta blanca, más capas de `surface-container-*`.

1. **Fondo:** `surface` / `background` `#071327`, texto base `#AFC9EB` (`primary` en oscuro).
2. **Marca:** título uppercase muy contrastado, subtítulo “Secure Access Terminal”.
3. **Placa de identidad:** bloque `surface-container-low` con borde izquierdo de 4px en `primary`; avatar opcional.
4. **PIN:** círculos rellenos con glow `rgba(175,201,235,0.4)`; vacíos sobre `surface-container-highest`.
5. **Teclado:** teclas `surface-container-high`, hover `surface-bright`, foco con borde inferior `primary` (estética tipo terminal).
6. **CTA:** gradiente `from-primary to-primary-container`, texto `on-primary`.
7. **Acciones secundarias:** “Emergency Reset” / “Switch Operator” (en app unificamos con el flujo claro donde aplique).
8. **Decoración:** watermark `factory`, bloque mono de sistema, aviso legal en footer.

### Tokens M3 / Stitch (oscuro, extracto)

Los nombres siguen el mapa `namedColors` del asset Obsidian; valores clave:

| Rol | Hex |
| --- | --- |
| `surface` / `background` | `#071327` |
| `surface-container-low` | `#101C30` |
| `surface-container` | `#142034` |
| `surface-container-high` | `#1F2A3F` |
| `surface-container-highest` | `#2A354A` |
| `primary` | `#AFC9EB` |
| `primary-container` | `#0A2742` |
| `on-surface` | `#D7E2FF` |
| `on-surface-variant` | `#C5C6CD` |
| `on-primary` | `#17324D` |

## Reglas de diseño a respetar en código

- **Tipografía:** Inter (Google Fonts), pesos 400–900 según jerarquía.
- **Iconografía:** Material Symbols Outlined (como en Stitch).
- **Sin bordes duros 1px** para separar secciones: preferir cambios de tono de superficie (design system).
- **Interacción:** teclas del PIN con feedback `:active` / escala; CTA mínimo ~48px de altura táctil.
- **Modo oscuro:** activar con clase `dark` en `<html>` (misma convención que Tailwind `darkMode: 'class'` en Stitch).

## Implementación en `erp-web`

- Ruta: `/login` (redirección desde `/`).
- Variables CSS globales en `src/styles.css` bajo `:root` y `.dark` para alinear tokens sin duplicar hex en cada componente.
- El componente `LoginPage` replica la estructura del HTML claro como layout principal; los tokens oscuros aplican vía variables cuando `html` tiene la clase `dark` (botón «Tema» en la esquina superior derecha).
