import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  isConfigured(): boolean {
    return !!(
      this.config.get<string>('CLOUDINARY_CLOUD_NAME') &&
      this.config.get<string>('CLOUDINARY_API_KEY') &&
      this.config.get<string>('CLOUDINARY_API_SECRET')
    );
  }

  async uploadBuffer(
    buffer: Buffer,
    options: {
      folder?: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      filename?: string;
    } = {},
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Cloudinary no configurado. Añade CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET al .env.',
      );
    }
    const {
      folder = 'erp-docs',
      resourceType = 'auto',
      filename,
    } = options;
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          type: 'upload',
          ...(filename && { public_id: filename }),
        },
        (err: Error | undefined, result: UploadApiResponse | undefined) => {
          if (err) return reject(err);
          if (!result?.secure_url)
            return reject(new Error('Cloudinary no devolvió URL'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        },
      );
      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    });
  }

  async destroyFile(url: string): Promise<void> {
    if (!this.isConfigured() || !url) return;
    try {
      const parts = url.split('/');
      const lastPart = parts.pop() || '';
      const filename = lastPart.split('.')[0];
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return;
      const folderPath = parts.slice(uploadIndex + 2).join('/');
      const publicId = folderPath ? `${folderPath}/${filename}` : filename;
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Error al eliminar de Cloudinary:', err);
    }
  }
}
