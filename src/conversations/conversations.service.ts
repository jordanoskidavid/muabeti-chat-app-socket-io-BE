import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './conversation.entity';
import { In, Repository } from 'typeorm';
import { ConversationParticipant } from './conversation-participant.entity';
@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,

    @InjectRepository(ConversationParticipant)
    private readonly participantRepo: Repository<ConversationParticipant>,
  ) {}

  async findOrCreateDirectConversation(user1Id: number, user2Id: number) {
    if (user1Id === user2Id) {
      throw new BadRequestException(
        'Cannot create conversation with same user',
      );
    }
    const participants = await this.participantRepo.find({
      where: {
        user: {
          id: In([user1Id, user2Id]),
        },
      },
      relations: ['conversation', 'user'],
    });

    const conversationMap = new Map<number, number[]>();

    for (const participant of participants) {
      const conversationId = participant.conversation.id;

      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, []);
      }

      conversationMap.get(conversationId)?.push(participant.user.id);
    }

    for (const [conversationId, users] of conversationMap.entries()) {
      const uniqueUsers = [...new Set(users)];

      if (
        uniqueUsers.length === 2 &&
        uniqueUsers.includes(user1Id) &&
        uniqueUsers.includes(user2Id)
      ) {
        return this.conversationRepo.findOneBy({
          id: conversationId,
        });
      }
    }

    const conversation = await this.conversationRepo.save(
      this.conversationRepo.create(),
    );

    await this.participantRepo
      .createQueryBuilder()
      .insert()
      .into(ConversationParticipant)
      .values([
        { conversationId: conversation.id, userId: user1Id },
        { conversationId: conversation.id, userId: user2Id },
      ])
      .execute();
    return this.conversationRepo.findOne({
      where: { id: conversation.id },
      relations: ['participants'],
    });
  }
}
