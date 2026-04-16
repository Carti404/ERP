# Contexto Técnico: Modernización del Módulo de Mensajería ERP (Abril 2026)

Este documento sirve como transferencia de contexto para otros agentes de IA sobre los cambios estructurales y estéticos realizados en el módulo de mensajería (`ErpInboxComponent`).

## 1. Arquitectura de "Hilos" (Threading)
Se ha implementado un motor de agrupación que transforma una bandeja de entrada plana en una experiencia de chat fluido:
- **Agrupamiento**: Los mensajes se agrupan por `subject` y participantes.
- **Persistencia**: Al responder, el sistema inyecta automáticamente el historial previo en el `body` del mensaje mediante un delimitador invisible (`---------- Mensaje referenciado ----------`). Esto asegura que el backend mantenga la cadena de conversación.
- **Parsing**: El componente utiliza regex para separar el cuerpo del mensaje de su historial y renderizar burbujas individuales.

## 2. UI & UX: "Refactorización Premium"
En la última actualización, se ha abandonado el diseño de correo tradicional por una interfaz de chat moderna de alta gama:
- **Burbujas de Chat**: Estilo premium con sombras suaves (`box-shadow`), bordes redondeados de 20px-24px y posicionamiento asimétrico (Derecha: Usuario/"Tú", Izquierda: Remitente).
- **Glassmorphism**: Implementación de efectos de desenfoque y transparencia (`backdrop-filter: blur(12px)`) en el sidebar para una estética más profunda.
- **Layout Borde a Borde**: El componente se posiciona de forma absoluta (`absolute inset-0`) dentro del shell, eliminando márgenes de la página para maximizar el área de lectura.
- **Micro-interacciones**: Transiciones suaves en hover y estados activos, junto con un área de entrada de respuesta rápida que emula aplicaciones líderes de mensajería.

## 3. Gestión de Scroll y Layout Fijo
Se ha implementado un sistema de layout basado en Flexbox para garantizar la funcionalidad del chat:
- **Contenedor Raíz**: Configurado con `display: flex; flex-direction: column; height: 100%; overflow: hidden;`.
- **Aislamiento de Scroll**: Solo el historial de hilos (`.erp-admin-inbox-reader-content`) posee `overflow-y: auto`, lo que permite que el área de lectura crezca independientemente sin desplazar el resto de la interfaz.
- **Fijación de Footer**: El área de "Respuesta Rápida" (`.erp-admin-inbox-reply-area`) está anclada permanentemente al fondo, asegurando que el input sea accesible en todo momento sin importar la longitud de la conversación.

## 4. Funcionalidades de Interacción
- **Atajos de Teclado**: Soporte nativo para enviar mensajes con la tecla `Enter` y permitir saltos de línea con `Shift + Enter`. La lógica ha sido delegada a TypeScript para asegurar el correcto tipado de eventos.
- **Polling & Sync**: Actualización automática de la bandeja de entrada y sincronización fluida de nuevos mensajes en el hilo activo.
- **Adjuntos Modernos**: Visualización de archivos adjuntos con estado de carga y transiciones de entrada animadas.

## 5. Detalles Técnicos Clave
- **Componente**: `ErpInboxComponent` (Standalone).
- **Control de Flujo**: Migración completa a la sintaxis moderna de Angular (@if, @for).
- **Estilos**: Vanilla CSS con variables de diseño personalizadas. Se evita Tailwind para la lógica de layout crítico para mantener especificidad total sobre el sistema de scroll.
- **Robustez**: Se han corregido errores de tipado en plantillas y se ha garantizado la unicidad de métodos en el controlador.

---
**Nota para el siguiente agente**: La estructura de flexbox es crítica para el scroll. Cualquier cambio en los contenedores padres debe respetar el `height: 100%` y el `overflow: hidden` del root para no romper la fijación del input inferior.
