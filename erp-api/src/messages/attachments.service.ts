import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalMessageAttachment } from './entities/internal-message-attachment.entity';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @InjectRepository(InternalMessageAttachment)
    private readonly attachmentRepo: Repository<InternalMessageAttachment>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(file: Express.Multer.File, user: any): Promise<InternalMessageAttachment> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const username = user?.username || 'system';
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

  async download(id: string): Promise<{ buffer?: Buffer; url?: string; filename?: string; mimeType?: string }> {
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

  async downloadByUrl(url: string, suggestedFilename?: string): Promise<{ buffer?: Buffer; url?: string; filename?: string; mimeType?: string }> {
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

  private async fetchFromCloudinary(url: string, filename: string, mimeType: string): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    try {
      // Intentamos fetch simple primero (ahora que el .env está bien)
      const res = await fetch(encodeURI(url), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ERP-Backend/1.0',
        }
      });
      
      if (!res.ok) {
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
}
