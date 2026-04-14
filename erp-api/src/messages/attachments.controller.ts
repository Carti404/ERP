import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';

@Controller('messages/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  private readonly apiUrl: string;

  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly config: ConfigService,
  ) {
    this.apiUrl = this.config.get<string>('API_URL') || 'http://localhost:3005/api/v1';
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Cambiado 'upload' por 'create' para coincidir con el servicio
    const result = await this.attachmentsService.create(file, null);
    return {
      id: result.id,
      filename: result.filename,
      url: result.url,
      mimetype: result.mimetype,
      size: result.size,
    };
  }

  @Get(':id/download')
  async getDownload(@Param('id', ParseUUIDPipe) id: string): Promise<{ url: string }> {
    const result = await this.attachmentsService.download(id);
    if (result.url) {
      return { url: result.url };
    }
    // Si no hay URL, es que es un binario que requiere el proxy local
    return { url: `${this.apiUrl}/messages/attachments/${id}/binary` };
  }

  @Get(':id/binary')
  async getBinary(@Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    const result = await this.attachmentsService.download(id);
    if (!result.buffer || !result.filename || !result.mimeType) {
        throw new BadRequestException('El archivo no está disponible para descarga binaria');
    }
    const safeFilename = result.filename.replace(/"/g, '%22');
    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `attachment; filename="${safeFilename}"`,
    });
  }

  @Get('download-evidence')
  async getEvidenceDownload(
    @Query('url') url: string,
    @Query('filename') filename?: string,
  ): Promise<{ url: string }> {
    const result = await this.attachmentsService.downloadByUrl(url, filename);
    if (result.url) {
      return { url: result.url };
    }
    // Para evidencias binarias pasamos la URL original al endpoint proxy
    const encodedUrl = encodeURIComponent(url);
    const safeName = encodeURIComponent(filename || 'evidencia');
    return { url: `${this.apiUrl}/messages/attachments/binary-proxy?url=${encodedUrl}&filename=${safeName}` };
  }

  @Get('binary-proxy')
  async getBinaryProxy(
    @Query('url') url: string,
    @Query('filename') filename?: string,
  ): Promise<StreamableFile> {
    const result = await this.attachmentsService.downloadByUrl(url, filename);
    if (!result.buffer || !result.filename || !result.mimeType) {
        throw new BadRequestException('El archivo no está disponible para descarga binaria');
    }
    const safeFilename = result.filename.replace(/"/g, '%22');
    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `attachment; filename="${safeFilename}"`,
    });
  }
}
