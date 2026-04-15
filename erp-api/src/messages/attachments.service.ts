import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalMessageAttachment } from './entities/internal-message-attachment.entity';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { UsersService } from '../users/users.service';
import { createHash } from 'crypto';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);
  private readonly fileTokenTtlSec = 120; // 2 min para abrir en nueva pestaña

  constructor(
    @InjectRepository(InternalMessageAttachment)
    private readonly attachmentRepo: Repository<InternalMessageAttachment>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async create(file: Express.Multer.File, userId: string | null): Promise<InternalMessageAttachment> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const username = (await this.resolveUsername(userId)) || 'system';
    const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const customPublicId = `${dateStr}_${username}_${cleanFilename}`;

    const isImage = file.mimetype.startsWith('image/');
    const resType = isImage ? 'image' : 'raw';
    
    const result = await this.cloudinaryService.uploadBuffer(file.buffer, {
      folder: 'erp-docs',
      resourceType: resType,
      filename: customPublicId
    });

    const attachment = this.attachmentRepo.create({
      filename: customPublicId, // Guardar el nombre personalizado para la descarga
      url: result.secureUrl,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.attachmentRepo.save(attachment);
  }

  async findByIds(ids: string[]): Promise<InternalMessageAttachment[]> {
    if (!ids || ids.length === 0) return [];
    return this.attachmentRepo.createQueryBuilder('a')
      .where('a.id IN (:...ids)', { ids })
      .getMany();
  }

  async associateToMessage(ids: string[], messageId: string): Promise<void> {
    if (!ids || ids.length === 0) return;
    await this.attachmentRepo.update(ids, { messageId });
  }

  async download(
    id: string,
  ): Promise<{ buffer?: Buffer; url?: string; filename?: string; mimeType?: string }> {
    const attachment = await this.attachmentRepo.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException('Adjunto no encontrado');
    }
    
    // Si es imagen, podemos usar la redirección firmada (es más eficiente)
    if (attachment.mimetype.startsWith('image/')) {
        return { url: this.generateSignedUrl(attachment.url, attachment.filename, attachment.mimetype) };
    }

    // Para PDFs y otros RAW, forzamos el proxy porque Cloudinary no permite fl_attachment en RAW
    return this.fetchFromCloudinary(attachment.url, attachment.filename, attachment.mimetype);
  }

  async downloadByUrl(
    url: string,
    suggestedFilename?: string,
  ): Promise<{ buffer?: Buffer; url?: string; filename?: string; mimeType?: string }> {
    if (!url.includes('res.cloudinary.com/dhwtrfsbm')) {
      throw new BadRequestException('URL de archivo no permitida o dominio no válido');
    }

    const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const mimeType = isImage ? `image/${isImage[1] === 'jpg' ? 'jpeg' : isImage[1]}` : 'application/pdf';

    if (isImage) {
        return { url: this.generateSignedUrl(url, suggestedFilename || 'imagen', mimeType) };
    }

    return this.fetchFromCloudinary(url, suggestedFilename || 'documento', mimeType);
  }

  /**
   * Descarga SIEMPRE como buffer (incluye imágenes) para que el backend controle Content-Disposition
   * y el nombre final FECHA_USUARIO.ext.
   *
   * Debe usarse en endpoints protegidos por JWT o por token corto de archivo.
   */
  async fetchAttachmentBufferById(
    id: string,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const attachment = await this.attachmentRepo.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException('Adjunto no encontrado');
    }
    const { buffer, mimeType } = await this.fetchFromCloudinary(
      attachment.url,
      attachment.filename,
      attachment.mimetype,
    );
    const downloadFilename = this.toFechaUsuarioFilename(
      attachment.filename,
      mimeType,
    );
    return { buffer, filename: downloadFilename, mimeType };
  }

  /**
   * Descarga SIEMPRE como buffer desde una URL Cloudinary permitida, con nombre FECHA_USUARIO.ext
   * (si se provee suggestedFilename ya en FECHA_USUARIO, se respeta ese formato base).
   */
  async fetchEvidenceBufferByUrl(
    url: string,
    suggestedFilename: string | undefined,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const { buffer, filename, mimeType } = await this.downloadByUrl(
      url,
      suggestedFilename,
    );
    if (!buffer || !filename || !mimeType) {
      throw new BadRequestException('El archivo no está disponible para descarga binaria');
    }
    const downloadFilename = this.toFechaUsuarioFilename(filename, mimeType);
    return { buffer, filename: downloadFilename, mimeType };
  }

  private async fetchFromCloudinary(url: string, filename: string, mimeType: string): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    try {
      // Para PDFs/raw usamos descarga privada vía API para evitar 401 en CDN/delivery URL.
      if (mimeType.toLowerCase() === 'application/pdf') {
        const publicId = this.extractCloudinaryPublicIdFromUploadUrl(url);
        if (publicId) {
          const buffer = await this.fetchRawViaPrivateDownload(publicId, 'pdf');
          let finalFilename = filename;
          if (!finalFilename.includes('.')) {
            finalFilename = `${finalFilename}.pdf`;
          }
          return { buffer, filename: finalFilename, mimeType };
        }
        this.logger.warn(
          `No se pudo extraer publicId para private_download_url. url="${url}"`,
        );
      }

      const signedFetchUrl = this.generateSignedFetchUrl(url, mimeType);
      // Cloudinary puede responder 401 si el recurso es private/authenticated:
      // para eso usamos una URL firmada de entrega (sin flags de attachment).
      const fetchUrl = signedFetchUrl || url;
      const res = await fetch(encodeURI(fetchUrl), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ERP-Backend/1.0',
        }
      });
      
      if (!res.ok) {
        this.logger.error(
          `Fetch Cloudinary falló (${res.status}). url="${url}" signed="${signedFetchUrl || ''}"`,
        );
        throw new BadRequestException(`Cloudinary respondió con error ${res.status}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      let finalFilename = filename;
      if (!finalFilename.includes('.')) {
        const ext = mimeType.split('/')[1] || 'pdf';
        finalFilename = `${finalFilename}.${ext === 'jpeg' ? 'jpg' : ext}`;
      }

      return { buffer, filename: finalFilename, mimeType };
    } catch (error) {
      this.logger.error(`Error en fetch proxy: ${error.message}`);
      throw new BadRequestException('No se pudo obtener el archivo binario');
    }
  }

  private extractCloudinaryPublicIdFromUploadUrl(originalUrl: string): string | null {
    try {
      const clean = originalUrl.split('?')[0];
      const parts = clean.split('/');
      const resIdx = parts.findIndex((p) => p === 'res.cloudinary.com');
      if (resIdx === -1) return null;
      const resourceType = parts[resIdx + 2];
      const deliveryType = parts[resIdx + 3];
      if (resourceType !== 'raw') return null;
      if (!deliveryType) return null;
      // Aceptamos upload/authenticated/private, pero el patrón en ERP es upload.
      const afterDelivery = parts.slice(resIdx + 4);
      if (afterDelivery.length === 0) return null;

      // Quitar firma s--...-- si existe
      let rest = afterDelivery;
      if (rest[0] && /^s--[^/]+--$/i.test(rest[0])) {
        rest = rest.slice(1);
      }

      // Tomar lo que va después del último v###
      let vIdx = -1;
      for (let i = 0; i < rest.length; i++) {
        if (/^v\d+$/i.test(rest[i])) vIdx = i;
      }
      const publicParts = vIdx >= 0 ? rest.slice(vIdx + 1) : rest;
      if (publicParts.length === 0) return null;

      const publicId = publicParts.join('/');
      return publicId || null;
    } catch {
      return null;
    }
  }

  private async fetchRawViaPrivateDownload(
    publicId: string,
    format: string,
  ): Promise<Buffer> {
    // Probamos tipos por compatibilidad (aunque nuestro URL sea /upload/)
    const types: Array<'upload' | 'authenticated' | 'private'> = [
      'upload',
      'authenticated',
      'private',
    ];
    const expiresAt = Math.floor(Date.now() / 1000) + 120;

    let lastStatus: number | null = null;
    for (const t of types) {
      // Si el publicId ya tiene el formato incluido (ej: archivo.pdf), no lo enviamos de nuevo
      // para evitar que Cloudinary lo duplique (ej: archivo.pdf.pdf)
      const needsFormat = format && !publicId.toLowerCase().endsWith(`.${format.toLowerCase()}`);

      const privateUrl = cloudinary.utils.private_download_url(publicId, needsFormat ? format : '', {
        resource_type: 'raw',
        type: t,
        expires_at: expiresAt,
      });
      const res = await fetch(privateUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ERP-Backend/1.0',
        },
      });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
      lastStatus = res.status;
      this.logger.warn(
        `private_download_url fetch falló (${res.status}). publicId="${publicId}" type="${t}"`,
      );
    }

    this.logger.error(
      `private_download_url no pudo obtener el archivo. publicId="${publicId}" lastStatus="${lastStatus ?? ''}"`,
    );
    throw new BadRequestException(
      `Cloudinary respondió con error ${lastStatus ?? 401}`,
    );
  }

  /**
   * Genera una URL firmada para *leer* el archivo desde Cloudinary (delivery),
   * sin forzar attachment. Esto evita 401 cuando el asset es private/authenticated.
   */
  private generateSignedFetchUrl(originalUrl: string, mimeType: string): string | null {
    try {
      const clean = originalUrl.split('?')[0];
      // Formatos típicos:
      // https://res.cloudinary.com/<cloud>/<resource_type>/<delivery_type>/v123/<publicId>
      // delivery_type: upload | authenticated | private
      const parts = clean.split('/');
      const resIdx = parts.findIndex((p) => p === 'res.cloudinary.com');
      if (resIdx === -1) return null;
      const cloudName = parts[resIdx + 1];
      const resourceTypeFromUrl = parts[resIdx + 2] || '';
      const deliveryTypeFromUrl = parts[resIdx + 3] || '';
      if (!cloudName || !resourceTypeFromUrl || !deliveryTypeFromUrl) return null;

      const deliveryType =
        deliveryTypeFromUrl === 'authenticated' || deliveryTypeFromUrl === 'private'
          ? (deliveryTypeFromUrl as 'authenticated' | 'private')
          : 'upload';

      // El resto después de <delivery_type> es [v123]/<publicId...>
      let version: string | undefined = undefined;
      let afterDelivery = parts.slice(resIdx + 4);
      if (afterDelivery.length === 0) return null;
      // Si la URL ya venía firmada, Cloudinary agrega un segmento tipo: s--<sig>--/...
      // No forma parte del publicId.
      if (afterDelivery[0] && /^s--[^/]+--$/i.test(afterDelivery[0])) {
        afterDelivery = afterDelivery.slice(1);
      }

      // Transformations (ej: c_fit,w_800) pueden existir antes de la versión.
      // Buscamos el ÚLTIMO segmento v123 y tomamos lo que va después como publicId.
      const vIdx = (() => {
        let idx = -1;
        for (let i = 0; i < afterDelivery.length; i++) {
          if (/^v\d+$/i.test(afterDelivery[i])) idx = i;
        }
        return idx;
      })();
      const publicParts = vIdx >= 0 ? afterDelivery.slice(vIdx + 1) : afterDelivery;
      if (vIdx >= 0) {
        version = afterDelivery[vIdx].slice(1);
      }
      const publicId = publicParts.join('/');
      if (!publicId) return null;

      // Usar resource_type derivado de la URL si es válido; si no, fallback por mimeType.
      const resource_type =
        resourceTypeFromUrl === 'image' || resourceTypeFromUrl === 'raw' || resourceTypeFromUrl === 'video'
          ? (resourceTypeFromUrl as 'image' | 'raw' | 'video')
          : mimeType.startsWith('image/')
            ? 'image'
            : 'raw';

      return cloudinary.url(publicId, {
        resource_type,
        type: deliveryType,
        sign_url: true,
        secure: true,
        ...(version ? { version } : {}),
      });
    } catch {
      return null;
    }
  }

  createFileToken(params: {
    attachmentId?: string;
    url?: string;
    filename?: string;
    disposition: 'inline' | 'attachment';
  }): Promise<string> {
    const disp = params.disposition === 'attachment' ? 'attachment' : 'inline';
    const fingerprint = this.fingerprintTokenParams({
      attachmentId: params.attachmentId,
      url: params.url,
      filename: params.filename,
      disposition: disp,
    });
    return this.jwtService.signAsync(
      {
        typ: 'file',
        aid: params.attachmentId || null,
        disp,
        fp: fingerprint,
      },
      { expiresIn: this.fileTokenTtlSec },
    );
  }

  async verifyFileToken(params: {
    token: string;
    attachmentId?: string;
    url?: string;
    filename?: string;
    disposition: 'inline' | 'attachment';
  }): Promise<void> {
    const decoded = await this.jwtService.verifyAsync<{
      typ?: string;
      aid?: string | null;
      disp?: 'inline' | 'attachment';
      fp?: string;
    }>(params.token);
    if (decoded?.typ !== 'file') {
      throw new BadRequestException('Token inválido');
    }
    const disp = params.disposition === 'attachment' ? 'attachment' : 'inline';
    if (decoded.disp !== disp) {
      throw new BadRequestException('Token inválido');
    }
    if ((params.attachmentId || null) !== (decoded.aid || null)) {
      throw new BadRequestException('Token inválido');
    }
    const expected = this.fingerprintTokenParams({
      attachmentId: params.attachmentId,
      url: params.url,
      filename: params.filename,
      disposition: disp,
    });
    if (!decoded.fp || decoded.fp !== expected) {
      throw new BadRequestException('Token inválido');
    }
  }

  private fingerprintTokenParams(params: {
    attachmentId?: string;
    url?: string;
    filename?: string;
    disposition: 'inline' | 'attachment';
  }): string {
    const raw = JSON.stringify({
      aid: params.attachmentId || null,
      url: params.url || null,
      filename: params.filename || null,
      disp: params.disposition,
    });
    return createHash('sha256').update(raw).digest('hex');
  }

  private generateSignedUrl(originalUrl: string, filename: string, mimeType: string): string {
    let publicId = '';
    let version = '';
    const parts = originalUrl.split('/');
    const uploadIdx = parts.indexOf('upload');
    
    if (uploadIdx !== -1) {
      version = parts[uploadIdx + 1].replace('v', '');
      publicId = parts.slice(uploadIdx + 2).join('/');
      // Para imágenes en signedUrl no queremos la extensión en el publicId si vamos a aplicar flags
      if (mimeType.startsWith('image/')) {
          publicId = publicId.split('.')[0];
      }
    }

    const safeFilename = filename.split('.')[0].replace(/[^a-z0-9_\-]/gi, '_');
    
    return cloudinary.url(publicId, {
      resource_type: mimeType.startsWith('image/') ? 'image' : 'raw',
      sign_url: true,
      secure: true,
      version: version,
      flags: `attachment:${safeFilename}`,
      type: 'upload'
    });
  }

  private toFechaUsuarioFilename(rawFilename: string, mimeType: string): string {
    const ext = this.extensionForMime(mimeType);
    // rawFilename suele ser YYYY-MM-DD_username_original.ext
    const base = rawFilename.replace(/\.[^./\\]+$/, '');
    const parts = base.split('_').filter(Boolean);
    const date = parts[0] || 'archivo';
    const user = parts[1] || 'usuario';
    const safeDate = date.replace(/[^0-9-]/g, '').slice(0, 10) || 'archivo';
    const safeUser = user.replace(/[^a-z0-9_-]/gi, '').slice(0, 64) || 'usuario';
    return `${safeDate}_${safeUser}${ext}`;
  }

  private extensionForMime(mimeType: string): string {
    const t = (mimeType || '').toLowerCase();
    if (t === 'application/pdf') return '.pdf';
    if (t === 'image/jpeg' || t === 'image/jpg') return '.jpg';
    if (t === 'image/png') return '.png';
    if (t === 'image/webp') return '.webp';
    if (t === 'image/gif') return '.gif';
    const fallback = t.split('/')[1] || '';
    if (fallback) {
      const ext = fallback === 'jpeg' ? 'jpg' : fallback;
      return `.${ext.replace(/[^a-z0-9]/g, '').slice(0, 10)}`;
    }
    return '.bin';
  }

  private async resolveUsername(userId: string | null): Promise<string | null> {
    if (!userId) return null;
    const u = await this.usersService.findById(userId);
    if (!u?.username) return null;
    return u.username.trim().toLowerCase();
  }
}
