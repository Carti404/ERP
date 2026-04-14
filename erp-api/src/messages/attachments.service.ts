import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalMessageAttachment } from './entities/internal-message-attachment.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir = path.join(process.cwd(), 'static', 'attachments');

  constructor(
    @InjectRepository(InternalMessageAttachment)
    private readonly attachmentRepo: Repository<InternalMessageAttachment>,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(file: Express.Multer.File): Promise<InternalMessageAttachment> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const attachment = this.attachmentRepo.create({
      filename: file.originalname,
      url: `/static/attachments/${filename}`,
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
}
