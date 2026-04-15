# Resumen de Solución: Integración Cloudinary y Proxy de Archivos

Este documento resume las acciones realizadas para resolver los errores de subida y descarga de archivos (imágenes y PDFs) en el sistema ERP.

## 1. Diagnóstico de Problemas

Se identificaron dos fallos críticos en la gestión de adjuntos:

1.  **Error 401 Unauthorized (Invalid Signature)**:
    *   **Síntoma**: Al intentar subir cualquier archivo, Cloudinary rechazaba la petición por firma inválida.
    *   **Causa**: Había un error de tipografía en el `CLOUDINARY_API_SECRET` dentro del archivo `.env` (una 'l' minúscula en lugar de una 'I' mayúscula).
    *   **Impacto**: Bloqueo total de subidas de archivos.

2.  **Error 404 Not Found (PDFs)**:
    *   **Síntoma**: Al intentar visualizar o descargar un PDF mediante el proxy del backend, Cloudinary respondía con 404.
    *   **Causa**: El `AttachmentsService` eliminaba la extensión `.pdf` del identificador del recurso. En Cloudinary, los recursos de tipo `raw` (como los PDFs) requieren la extensión dentro del `public_id`.
    *   **Impacto**: Imposibilidad de ver documentos PDF adjuntos.

## 2. Acciones Realizadas

### Corrección de Credenciales
*   Se corrigió el `CLOUDINARY_API_SECRET` y se sincronizó el `CLOUDINARY_URL` en el archivo `.env`.
*   Se verificó que las credenciales coincidan con las de la cuenta compartida de Mundo Terapeuta.

### Refactorización de `AttachmentsService`
*   **Ajuste de `public_id`**: Se modificó la función `extractCloudinaryPublicIdFromUploadUrl` para preservar la extensión en archivos que no sean imágenes.
*   **Lógica de Firma de Descarga**: Se actualizó `fetchRawViaPrivateDownload` para evitar duplicar extensiones (ej. `archivo.pdf.pdf`) al generar la URL privada de descarga.

## 3. Estado Actual

*   **Subidas**: Operativas. Las firmas ahora coinciden con el secreto de Cloudinary.
*   **Descargas (Proxy)**:
    *   **Imágenes**: Funcionan mediante redirección firmada (302) garantizando seguridad.
    *   **PDFs**: El proxy del backend recupera el binario correctamente usando el identificador completo y lo sirve al usuario con el nombre de archivo estandarizado (`YYYY-MM-DD_usuario_archivo.pdf`).
*   **Servidor**: El backend se levanta correctamente en el puerto **3005** sin conflictos de puerto (`EADDRINUSE` resuelto).

---
*Documento generado el 15 de abril de 2026.*
