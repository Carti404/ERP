import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { InternalMessage } from './entities/internal-message.entity';

export enum MessageFolder {
  inbox = 'inbox',
  sent = 'sent',
}

export type MessageParticipantDto = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
};

export type MessageRowDto = {
  id: string;
  folder: MessageFolder;
  subject: string;
  body: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  sender: MessageParticipantDto;
  recipient: MessageParticipantDto;
};

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(InternalMessage)
    private readonly msgRepo: Repository<InternalMessage>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Usuarios activos para elegir destinatario (cualquier rol autenticado).
   * Excluye al usuario actual.
   */
  async listRecipients(currentUserId: string) {
    const users = await this.usersService.listActives();
    return users
      .filter((u) => u.id !== currentUserId)
      .map((u) => this.usersService.toPublic(u));
  }

  async list(userId: string, folder: MessageFolder): Promise<MessageRowDto[]> {
    const qb = this.msgRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.recipient', 'recipient')
      .orderBy('m.createdAt', 'DESC');

    if (folder === MessageFolder.inbox) {
      qb.where('m.recipientId = :userId', { userId }).andWhere(
        'm.archivedAtRecipient IS NULL',
      );
    } else {
      qb.where('m.senderId = :userId', { userId }).andWhere(
        'm.archivedAtSender IS NULL',
      );
    }

    const rows = await qb.getMany();
    return rows.map((m) => this.toRow(m, folder));
  }

  async create(senderId: string, dto: CreateMessageDto): Promise<MessageRowDto> {
    if (dto.recipientId === senderId) {
      throw new BadRequestException('No puedes enviarte un mensaje a ti mismo.');
    }

    const recipient = await this.usersService.findById(dto.recipientId);
    if (!recipient || !recipient.activo) {
      throw new BadRequestException('El destinatario no existe o está inactivo.');
    }

    const sender = await this.usersService.findById(senderId);
    if (!sender || !sender.activo) {
      throw new ForbiddenException();
    }

    const msg = this.msgRepo.create({
      senderId,
      recipientId: dto.recipientId,
      subject: dto.subject.trim(),
      body: dto.body.trim(),
      readAt: null,
    });
    const saved = await this.msgRepo.save(msg);
    const full = await this.msgRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'recipient'],
    });
    if (!full) {
      throw new NotFoundException();
    }
    return this.toRow(full, MessageFolder.sent);
  }

  async markRead(userId: string, messageId: string): Promise<MessageRowDto> {
    const msg = await this.msgRepo.findOne({
      where: {
        id: messageId,
        recipientId: userId,
        archivedAtRecipient: IsNull(),
      },
      relations: ['sender', 'recipient'],
    });
    if (!msg) {
      throw new NotFoundException('Mensaje no encontrado.');
    }
    if (!msg.readAt) {
      msg.readAt = new Date();
      await this.msgRepo.save(msg);
    }
    return this.toRow(msg, MessageFolder.inbox);
  }

  /** Oculta el mensaje solo para el usuario actual (bandeja enviados o entrada). */
  async archiveForUser(userId: string, messageId: string): Promise<void> {
    const msg = await this.msgRepo.findOne({ where: { id: messageId } });
    if (!msg) {
      throw new NotFoundException('Mensaje no encontrado.');
    }
    if (msg.senderId === userId) {
      if (!msg.archivedAtSender) {
        msg.archivedAtSender = new Date();
        await this.msgRepo.save(msg);
      }
      return;
    }
    if (msg.recipientId === userId) {
      if (!msg.archivedAtRecipient) {
        msg.archivedAtRecipient = new Date();
        await this.msgRepo.save(msg);
      }
      return;
    }
    throw new ForbiddenException();
  }

  private participant(u: {
    id: string;
    fullName: string;
    username: string;
    email: string | null;
  }): MessageParticipantDto {
    return {
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
    };
  }

  private toRow(m: InternalMessage, folder: MessageFolder): MessageRowDto {
    return {
      id: m.id,
      folder,
      subject: m.subject,
      body: m.body,
      read: m.readAt != null,
      readAt: m.readAt ? m.readAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
      sender: this.participant(m.sender),
      recipient: this.participant(m.recipient),
    };
  }
}
