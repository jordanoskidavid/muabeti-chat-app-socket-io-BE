import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  Column,
} from 'typeorm';

import { ConversationParticipant } from './conversation-participant.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  isGroup: boolean;
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ConversationParticipant, (p) => p.conversation)
  participants: ConversationParticipant[];
}
