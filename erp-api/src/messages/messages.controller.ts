import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageFolder, MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /** Directorio de destinatarios (admin y trabajador). */
  @Get('recipients')
  listRecipients(@Req() req: { user: JwtValidatedUser }) {
    return this.messagesService.listRecipients(req.user.userId);
  }

  @Get()
  list(
    @Req() req: { user: JwtValidatedUser },
    @Query('folder', new ParseEnumPipe(MessageFolder)) folder: MessageFolder,
  ) {
    return this.messagesService.list(req.user.userId, folder);
  }

  @Post()
  create(
    @Req() req: { user: JwtValidatedUser },
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(req.user.userId, dto);
  }

  @Patch(':id/read')
  markRead(
    @Req() req: { user: JwtValidatedUser },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.markRead(req.user.userId, id);
  }

  @Delete(':id')
  @HttpCode(204)
  archive(
    @Req() req: { user: JwtValidatedUser },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.messagesService.archiveForUser(req.user.userId, id);
  }
}
