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
  async getConversationById(conversationId: number) {
    return this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants', 'participants.user'],
    });
  }
  async getConversationsForUser(userId: number) {
    const participants = await this.participantRepo.find({
      where: { userId },
      relations: [
        'conversation',
        'conversation.participants',
        'conversation.participants.user',
      ],
    });

    return participants.map((p) => p.conversation);
  }
  async createGroupConversation(name: string, userIds: number[]) {
    const conversation = await this.conversationRepo.save(
      this.conversationRepo.create({ name, isGroup: true }),
    );

    await this.participantRepo
      .createQueryBuilder()
      .insert()
      .into(ConversationParticipant)
      .values(
        userIds.map((userId) => ({ conversationId: conversation.id, userId })),
      )
      .execute();

    return this.conversationRepo.findOne({
      where: { id: conversation.id },
      relations: ['participants', 'participants.user'],
    });
  }
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
        // ✅ Fix 1 — existing conversation
        return this.conversationRepo.findOne({
          where: { id: conversationId },
          relations: ['participants', 'participants.user'],
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

    // ✅ Fix 2 — newly created conversation
    return this.conversationRepo.findOne({
      where: { id: conversation.id },
      relations: ['participants', 'participants.user'],
    });
  }
}
