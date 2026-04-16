# Contexto Técnico: Modernización del Módulo de Mensajería ERP (Abril 2026)

Este documento sirve como transferencia de contexto para otros agentes de IA sobre los cambios estructurales y estéticos realizados en el módulo de mensajería (`ErpInboxComponent`).

## 1. Arquitectura de "Hilos" (Threading)
Se ha implementado un motor de agrupación que transforma una bandeja de entrada plana en una experiencia de chat fluido:
- **Agrupamiento**: Los mensajes se agrupan por `subject` y participantes.
- **Persistencia**: Al responder, el sistema inyecta automáticamente el historial previo en el `body` del mensaje mediante un delimitador invisible (`---------- Mensaje referenciado ----------`). Esto asegura que el backend mantenga la cadena de conversación.
- **Parsing**: El componente utiliza regex para separar el cuerpo del mensaje de su historial y renderizar burbujas individuales.

## 2. UI & UX: "Command Center"
Se ha abandonado el diseño de correo tradicional por una interfaz de alta densidad:
- **Burbujas de Chat**: Estilo moderno con diferenciación visual entre el usuario actual ("Tú" en color primario/derecha) y los destinatarios (superficie neutra/izquierda).
- **Layout Borde a Borde**: El componente se posiciona de forma absoluta (`absolute inset-0`) dentro del shell, eliminando márgenes de la página para maximizar el área de lectura.
- **Identidad**: Se integra con `AuthService` para obtener el `displayName` del usuario y marcar sus propias burbujas automáticamente.

## 3. Gestión de Scroll (Aislamiento Crítico)
Se ha implementado un sistema de scroll bloqueado para evitar que el navegador se desplace:
- **Página Estática**: El shell (`main`) tiene `overflow: hidden` o el componente usa `absolute` para anular el scroll global.
- **Scroll Interno**: Solo el historial de mensajes (`.erp-admin-inbox-reader-content`) tiene `overflow-y: auto`.
- **Footer Fijo**: El área de "Respuesta Rápida" está anclada al fondo (`flex-shrink-0`), garantizando que la caja de texto nunca desaparezca de la vista.

## 4. Funcionalidades de Tiempo Real
- **Polling**: Se añadió un `effect` de Angular que refresca la bandeja de entrada cada 5 segundos de forma automática.
- **Sync**: Los mensajes nuevos se integran en el hilo activo sin necesidad de recargar el componente.

## 5. Detalles Técnicos Clave
- **Componente**: `ErpInboxComponent` (Standalone).
- **Servicios**: `MessagesApiService` (Datos), `AuthService` (Sesión).
- **Estilos**: Vanilla CSS con variables de diseño corporativo. No se usa Tailwind para las utilidades de layout crítico para evitar colisiones de especificidad.
- **Control de Flujo**: Se ha migrado toda la lógica a la nueva sintaxis de Angular (@if, @for).

---
**Nota para el siguiente agente**: Si necesitas modificar la lógica de envío, asegúrate de mantener la inyección del historial en el cuerpo del mensaje para no romper la continuidad de los hilos.
