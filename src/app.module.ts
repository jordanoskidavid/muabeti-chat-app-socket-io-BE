import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { Message } from './messages/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'muabeti_db',
      entities: [User, Message],
      migrations: ['dist/migrations/*.js'],
      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    MessagesModule,
  ],
  providers: [ChatGateway],
})
export class AppModule {}
