import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SystemParametersModule } from '../system-parameters/system-parameters.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { InternalMessage } from './entities/internal-message.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveRequestHistory } from './entities/leave-request-history.entity';
import { InternalMessageAttachment } from './entities/internal-message-attachment.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InternalMessage,
      LeaveRequest,
      LeaveRequestHistory,
      InternalMessageAttachment,
    ]),
    UsersModule,
    AuthModule,
    SystemParametersModule,
    NotificationsModule,
  ],
  controllers: [
    MessagesController,
    LeaveRequestsController,
    AttachmentsController,
  ],
  providers: [MessagesService, LeaveRequestsService, AttachmentsService],
  exports: [MessagesService, LeaveRequestsService, AttachmentsService],
})
export class MessagesModule {}
