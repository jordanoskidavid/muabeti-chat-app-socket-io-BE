import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';

interface MyJwtPayload {
  sub: number;
  email: string;
  role: 'user' | 'admin';
}

interface SocketData {
  user?: MyJwtPayload;
}

interface ServerToClientEvents {
  receiveMessage: (data: { from: number; message: string }) => void;
  messageSent: (data: { conversationId: number; message: string }) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  sendMessage: (data: { conversationId: number; message: string }) => void;
  joinConversation: (data: { conversationId: number }) => void;
}

type AuthenticatedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

function getUser(socket: AuthenticatedSocket): MyJwtPayload | undefined {
  return socket.data.user;
}

function isValidPayload(decoded: unknown): decoded is MyJwtPayload {
  if (typeof decoded !== 'object' || decoded === null) return false;
  const d = decoded as Record<string, unknown>;

  return (
    typeof d.sub === 'number' &&
    typeof d.email === 'string' &&
    typeof d.role === 'string' &&
    (d.role === 'user' || d.role === 'admin')
  );
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  handleConnection(client: Socket): void {
    const socket = client as AuthenticatedSocket;
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const decoded: unknown = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret',
      );

      if (!isValidPayload(decoded)) {
        socket.disconnect();
        return;
      }

      socket.data.user = decoded;

      console.log('User connected:', decoded.email);
    } catch (err) {
      console.error('JWT error:', err);
      socket.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const socket = client as AuthenticatedSocket;
    const user = getUser(socket);

    if (user) {
      console.log('User disconnected:', user.email);
    }
  }

  // JOIN CONVERSATION ROOM
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversationId}`;

    client.join(room);

    console.log(`User joined room: ${room}`);
  }

  // SEND MESSAGE TO ROOM
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { conversationId: number; message: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const socket = client as AuthenticatedSocket;
    const user = getUser(socket);

    if (!user) return;

    if (!data.message?.trim()) {
      socket.emit('error', { message: 'Invalid message format' });
      return;
    }

    const sender = await this.usersService.findByEmail(user.email);
    if (!sender) return;

    // SAVE MESSAGE
    await this.messagesService.create(
      sender,
      data.conversationId,
      data.message,
    );

    const room = `conversation_${data.conversationId}`;

    // BROADCAST TO ROOM
    this.server.to(room).emit('receiveMessage', {
      from: user.sub,
      message: data.message,
    });

    socket.emit('messageSent', {
      conversationId: data.conversationId,
      message: data.message,
    });
  }
}
