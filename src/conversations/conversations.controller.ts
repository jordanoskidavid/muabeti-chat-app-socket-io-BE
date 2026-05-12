import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}
  @UseGuards(JwtAuthGuard)
  @Post('direct')
  async createDirectConversation(
    @Req() req: { user: { id: number } },
    @Body() body: { userId: number },
  ) {
    if (!body.userId) {
      throw new BadRequestException('userId is required');
    }

    if (body.userId === req.user.id) {
      throw new BadRequestException('Cannot chat with yourself');
    }

    return this.conversationsService.findOrCreateDirectConversation(
      req.user.id,
      body.userId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async getConversations(@Req() req: { user: { id: number } }) {
    return this.conversationsService.getConversationsForUser(req.user.id);
  }
}
