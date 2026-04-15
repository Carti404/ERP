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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AttachmentsService } from './attachments.service';

@Controller('messages/attachments')
export class AttachmentsController {
  private readonly apiUrl: string;

  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly config: ConfigService,
  ) {
    this.apiUrl = this.config.get<string>('API_URL') || 'http://localhost:3005/api/v1';
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string } | undefined,
  ) {
    const result = await this.attachmentsService.create(file, user?.userId || null);
    return {
      id: result.id,
      filename: result.filename,
      url: result.url,
      mimetype: result.mimetype,
      size: result.size,
    };
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async getDownload(@Param('id', ParseUUIDPipe) id: string): Promise<{ url: string }> {
    // Mantener compatibilidad: devolver una URL navegable en nueva pestaña
    const token = await this.attachmentsService.createFileToken({
      attachmentId: id,
      disposition: 'attachment',
    });
    return {
      url: `${this.apiUrl}/messages/attachments/${id}/binary-public?disposition=attachment&t=${encodeURIComponent(token)}`,
    };
  }

  /** URL navegable (nueva pestaña) para abrir inline o descargar. */
  @Get(':id/link')
  @UseGuards(JwtAuthGuard)
  async getLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('disposition') disposition?: string,
  ): Promise<{ url: string }> {
    const disp = disposition === 'attachment' ? 'attachment' : 'inline';
    const token = await this.attachmentsService.createFileToken({
      attachmentId: id,
      disposition: disp,
    });
    return {
      url: `${this.apiUrl}/messages/attachments/${id}/binary-public?disposition=${disp}&t=${encodeURIComponent(token)}`,
    };
  }

  @Get(':id/binary')
  @UseGuards(JwtAuthGuard)
  async getBinary(@Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    const result = await this.attachmentsService.fetchAttachmentBufferById(id);
    const safeFilename = result.filename.replace(/"/g, '%22');
    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `attachment; filename="${safeFilename}"`,
    });
  }

  /** Endpoint público (con token corto) para abrir inline/attachment con nombre controlado. */
  @Get(':id/binary-public')
  async getBinaryPublic(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('t') token: string,
    @Query('disposition') disposition?: string,
  ): Promise<StreamableFile> {
    if (!token) {
      throw new BadRequestException('Token requerido');
    }
    const disp = disposition === 'attachment' ? 'attachment' : 'inline';
    await this.attachmentsService.verifyFileToken({
      token,
      attachmentId: id,
      disposition: disp,
    });
    const result = await this.attachmentsService.fetchAttachmentBufferById(id);
    const safeFilename = result.filename.replace(/"/g, '%22');
    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `${disp}; filename="${safeFilename}"`,
    });
  }

  @Get('download-evidence')
  @UseGuards(JwtAuthGuard)
  async getEvidenceDownload(
    @Query('url') url: string,
    @Query('filename') filename?: string,
  ): Promise<{ url: string }> {
    // Mantener compatibilidad: devolver URL navegable que fuerza attachment
    const encodedUrl = encodeURIComponent(url);
    const safeName = encodeURIComponent(filename || 'evidencia');
    const disp = 'attachment';
    const token = await this.attachmentsService.createFileToken({
      url,
      filename: filename || 'evidencia',
      disposition: disp,
    });
    return {
      url: `${this.apiUrl}/messages/attachments/binary-proxy-public?url=${encodedUrl}&filename=${safeName}&disposition=${disp}&t=${encodeURIComponent(token)}`,
    };
  }

  /** URL navegable (nueva pestaña) para evidencias por URL Cloudinary (inline o attachment). */
  @Get('link-proxy')
  @UseGuards(JwtAuthGuard)
  async getEvidenceLink(
    @Query('url') url: string,
    @Query('filename') filename?: string,
    @Query('disposition') disposition?: string,
  ): Promise<{ url: string }> {
    const encodedUrl = encodeURIComponent(url);
    const safeName = encodeURIComponent(filename || 'evidencia');
    const disp = disposition === 'attachment' ? 'attachment' : 'inline';
    const token = await this.attachmentsService.createFileToken({
      url,
      filename: filename || 'evidencia',
      disposition: disp,
    });
    return {
      url: `${this.apiUrl}/messages/attachments/binary-proxy-public?url=${encodedUrl}&filename=${safeName}&disposition=${disp}&t=${encodeURIComponent(token)}`,
    };
  }

  @Get('binary-proxy')
  @UseGuards(JwtAuthGuard)
  async getBinaryProxy(
    @Query('url') url: string,
    @Query('filename') filename?: string,
  ): Promise<StreamableFile> {
    const result = await this.attachmentsService.fetchEvidenceBufferByUrl(
      url,
      filename,
    );
    const safeFilename = result.filename.replace(/"/g, '%22');
    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `attachment; filename="${safeFilename}"`,
    });
  }

  @Get('binary-proxy-public')
  async getBinaryProxyPublic(
    @Query('url') url: string,
    @Query('filename') filename: string | undefined,
    @Query('t') token: string,
    @Query('disposition') disposition?: string,
  ): Promise<StreamableFile> {
    if (!token) {
      throw new BadRequestException('Token requerido');
    }
    const disp = disposition === 'attachment' ? 'attachment' : 'inline';
    await this.attachmentsService.verifyFileToken({
      token,
      url,
      filename: filename || 'evidencia',
      disposition: disp,
    });
    const result = await this.attachmentsService.fetchEvidenceBufferByUrl(
      url,
      filename,
    );
    const safeFilename = result.filename.replace(/"/g, '%22');
    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `${disp}; filename="${safeFilename}"`,
    });
  }
}
