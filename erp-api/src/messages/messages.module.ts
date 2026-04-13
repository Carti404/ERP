import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { InternalMessage } from './entities/internal-message.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveRequestHistory } from './entities/leave-request-history.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InternalMessage, LeaveRequest, LeaveRequestHistory]),
    UsersModule,
    AuthModule,
  ],
  controllers: [MessagesController, LeaveRequestsController],
  providers: [MessagesService, LeaveRequestsService],
  exports: [MessagesService, LeaveRequestsService],
})
export class MessagesModule {}
