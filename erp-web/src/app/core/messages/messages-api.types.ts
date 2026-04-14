export type ErpMessageFolder = 'inbox' | 'sent';

export enum MessageImportance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum MessageCategory {
  GENERAL = 'GENERAL',
  INCIDENCE = 'INCIDENCE',
}

export interface ErpMessageParticipant {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
}

export interface ErpMessageAttachment {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

export interface ErpMessageRow {
  id: string;
  folder: ErpMessageFolder;
  subject: string;
  body: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  sender: ErpMessageParticipant;
  recipient: ErpMessageParticipant;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'GENERAL' | 'INCIDENCE';
  attachments: ErpMessageAttachment[];
}

export interface CreateMessagePayload {
  recipientId: string;
  subject: string;
  body: string;
  importance?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: 'GENERAL' | 'INCIDENCE';
  attachmentIds?: string[];
}
