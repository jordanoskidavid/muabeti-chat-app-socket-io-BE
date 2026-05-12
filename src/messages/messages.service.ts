import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Conversation } from '../conversations/conversation.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  async create(sender: User, conversationId: number, content: string) {
    const message = this.repo.create({
      sender,
      content,
      conversation: {
        id: conversationId,
      } as DeepPartial<Conversation>,
    });

    return this.repo.save(message);
  }
  async findByConversation(conversationId: number) {
    return this.repo.find({
      where: {
        conversation: {
          id: conversationId,
        },
      },
      relations: ['sender'],
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
