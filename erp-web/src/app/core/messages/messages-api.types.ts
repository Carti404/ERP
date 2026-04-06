export type ErpMessageFolder = 'inbox' | 'sent';

export interface ErpMessageParticipant {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
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
}

export interface CreateMessagePayload {
  recipientId: string;
  subject: string;
  body: string;
  importance?: 'LOW' | 'MEDIUM' | 'HIGH';
}
