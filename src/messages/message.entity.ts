import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  // sender
  @ManyToOne(() => User, { eager: true })
  sender: User;

  // receiver
  @ManyToOne(() => User, { eager: true })
  receiver: User;

  @CreateDateColumn()
  createdAt: Date;
}
