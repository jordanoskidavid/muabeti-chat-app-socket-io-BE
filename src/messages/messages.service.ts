import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  async create(
    sender: User,
    receiver: User,
    content: string,
  ): Promise<Message> {
    const message = this.repo.create({
      sender,
      receiver,
      content,
    });

    return this.repo.save(message);
  }
}
