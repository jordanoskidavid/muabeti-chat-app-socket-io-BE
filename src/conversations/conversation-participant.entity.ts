import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';

import { Conversation } from './conversation.entity';
import { User } from '../users/user.entity';

@Entity()
export class ConversationParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;
}
