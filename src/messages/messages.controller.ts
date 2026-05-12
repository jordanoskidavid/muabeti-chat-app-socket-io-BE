import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId')
  getMessages(
    @Param('conversationId', ParseIntPipe)
    conversationId: number,
  ) {
    return this.messagesService.findByConversation(conversationId);
  }
}
