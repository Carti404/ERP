# Resumen de Mejoras: Sistema de Archivos Adjuntos y Mensajería

Se han implementado correcciones críticas y mejoras de experiencia de usuario (UX) en el sistema de gestión de archivos y comunicación interna del ERP.

## 1. Módulo de Mensajería Interna (`ErpInbox`)

### Mejoras de Envío y Respuesta
*   **Funcionalidad de Respuesta Rápida**: Se activó completamente el panel inferior para responder mensajes. Ahora permite:
    *   Escribir texto con formateo básico (Negrita).
    *   Adjuntar múltiples archivos (Imágenes y PDFs) directamente.
    *   Visualizar una barra de progreso (spinner) y previsualización local instantánea mientras se suben los archivos.
    *   Botón de envío con estado de carga para evitar clics duplicados.
*   **Limpieza de Estado**: Se corrigió el error donde el texto de un mensaje enviado se quedaba "atrapado" en la caja de respuesta del siguiente mensaje.

### Visualización y Acceso
*   **Indicadores Visuales**: Se añadió un icono de "clip" en la lista lateral de mensajes para identificar rápidamente cuáles contienen archivos adjuntos.
*   **Resolución de Archivos (404 Error)**: Se corrigió la lógica de rutas para que el sistema use siempre URLs absolutas (`http://.../static/...`), asegurando que las imágenes y PDFs se abran correctamente tanto en entornos locales como de producción.
*   **Persistencia al Leer**: Se arregló un bug en el servidor donde los adjuntos desaparecían de la vista tras abrir un mensaje nuevo por primera vez.

## 2. Módulo de Justificantes (Permisos y Vacaciones)

*   **Soporte Multiformato**: Se expandió la capacidad de subir evidencias para incluir tanto **PDF** como **Imágenes** (JPG, PNG, WebP).
*   **Límites Aumentados**: Se estandarizó el límite de subida a **30MB** por archivo.
*   **Previsualización**:
    *   **Imágenes**: Apertura instantánea en un modal integrado para revisión rápida.
    *   **PDF**: Apertura en una pestaña nueva del navegador.

## 3. Cambios Técnicos en el Backend
*   **MessagesService**: Se incluyó la relación `attachments` en el método `markRead`.
*   **MessagesController**: Se verificó el endpoint de subida en `/api/v1/messages/attachments/upload`.
*   **Directorio Estático**: Los archivos se persisten en `erp-api/static/attachments/`.

---
*Fecha de actualización: 14 de Abril, 2026*
