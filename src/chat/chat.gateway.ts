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
  messageSent: (data: { to: number; message: string }) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  privateMessage: (data: { toUserId: number; message: string }) => void;
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

function isValidMessageData(
  data: unknown,
): data is { toUserId: number; message: string } {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.toUserId === 'number' &&
    typeof d.message === 'string' &&
    d.message.trim().length > 0
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

  private users = new Map<number, string>();

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    return secret;
  }

  handleConnection(client: Socket): void {
    const socket = client as AuthenticatedSocket;
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const decoded: unknown = jwt.verify(token, this.getJwtSecret());

      if (!isValidPayload(decoded)) {
        socket.disconnect();
        return;
      }

      socket.data.user = decoded;
      this.users.set(decoded.sub, socket.id);
      console.log('User connected:', decoded.email);
    } catch (err) {
      console.error('JWT verification failed:', err);
      socket.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const socket = client as AuthenticatedSocket;
    const user = getUser(socket);

    if (user) {
      this.users.delete(user.sub);
      console.log('User disconnected:', user.email);
    }
  }

  @SubscribeMessage('privateMessage')
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('PRIVATE MESSAGE EVENT TRIGGERED');
    console.log('DATA:', data);
    const socket = client as AuthenticatedSocket;
    const fromUser = getUser(socket);
    console.log('FROM USER:', fromUser);

    if (!fromUser) return;

    if (!isValidMessageData(data)) {
      console.log('INVALID MESSAGE DATA');
      socket.emit('error', { message: 'Invalid message format' });
      return;
    }

    const sender = await this.usersService.findByEmail(fromUser.email);
    const receiver = await this.usersService.findById(data.toUserId);

    if (!sender || !receiver) return;

    await this.messagesService.create(sender, receiver, data.message);
    const receiverSocketId = this.users.get(data.toUserId);
    console.log('RECEIVER SOCKET:', receiverSocketId);
    if (receiverSocketId) {
      console.log('SENDING MESSAGE');

      this.server.to(receiverSocketId).emit('receiveMessage', {
        from: fromUser.sub,
        message: data.message,
      });
      socket.emit('messageSent', { to: data.toUserId, message: data.message });
    } else {
      console.log('USER NOT ONLINE');

      socket.emit('error', { message: `User ${data.toUserId} is not online` });
    }
  }
}
