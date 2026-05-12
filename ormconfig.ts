import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';
import { Message } from './src/messages/message.entity';
import { Conversation } from './src/conversations/conversation.entity';
import { ConversationParticipant } from './src/conversations/conversation-participant.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'muabeti_db',
  entities: [User, Message, Conversation, ConversationParticipant],
  migrations: ['src/migrations/*.ts'],
});
