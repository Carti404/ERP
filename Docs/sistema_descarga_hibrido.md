# Documentación: Sistema de Descarga Híbrido ERP

Este documento detalla la implementación final del sistema de descarga de archivos para resolver los errores 401 (Unauthorized) y 400 (Bad Request) con Cloudinary.

## Arquitectura del Sistema

Debido a que Cloudinary no permite transformaciones (como forzar la descarga con un nombre específico) en archivos de tipo `raw` (PDFs), se ha implementado una estrategia híbrida:

1.  **Imágenes (JPG, PNG, WEBP)**:
    - El backend genera una **URL firmada de Cloudinary**.
    - Se utiliza el flag `fl_attachment` para forzar la descarga con un nombre personalizado.
    - El frontend abre esta URL directamente.
2.  **Documentos RAW (PDF, etc.)**:
    - El backend genera una **URL local** que apunta al propio servidor ERP.
    - El servidor ERP actúa como un **Proxy**: descarga los bytes de Cloudinary de forma privada y los sirve al navegador con los headers `Content-Disposition` correctos.
    - Esto garantiza que el usuario siempre descargue el archivo con el nombre deseado.

## Archivos Modificados

### Backend (`erp-api`)
- `.env`: Se actualizó `CLOUDINARY_API_SECRET` y se añadió `API_URL` para las redirecciones locales.
- `attachments.service.ts`: Implementa la lógica de decisión entre `generateSignedUrl` y `fetchFromCloudinary`.
- `attachments.controller.ts`: Expone los endpoints de descarga (`:id/download`) y los endpoints de servicio binario (`:id/binary` y `binary-proxy`).

### Frontend (`erp-web`)
- `messages-api.service.ts`: Actualizado para recibir objetos JSON con URLs en lugar de Blobs binarios.
- `erp-inbox.component.ts`: Actualizada la función `onDownloadAttachment` para usar `window.open(res.url)`.
- `admin-permisos.component.ts` y `trabajador-permisos.component.ts`: Actualizada la función `openEvidence` para seguir el mismo flujo de redirección.

## Consideraciones de Seguridad
- Todas las URLs de descarga locales están protegidas por `JwtAuthGuard`.
- Solo se permiten descargas de URLs que pertenezcan al dominio de Cloudinary configurado (`dhwtrfsbm`).

## Mantenimiento
Si se desea cambiar el formato de los nombres de los archivos descargados, debe modificarse el método `generateSignedUrl` y `fetchFromCloudinary` en `AttachmentsService`.
