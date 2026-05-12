import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('direct')
  async createDirectConversation(
    @Req() req: { user: { id: number } }, // change sub to id
    @Body() body: { userId: number },
  ) {
    return this.conversationsService.findOrCreateDirectConversation(
      req.user.id, // change .sub to .id
      body.userId,
    );
  }
}
