import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(email: string, password: string) {
    const hashed: string = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, password: hashed });
    const savedUser = await this.repo.save(user);

    // Create a new object explicitly without password
    return {
      id: savedUser.id,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }
}
