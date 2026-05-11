import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './user.entity';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
  ) {
    const hashed: string = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, password: hashed, role });
    const savedUser = await this.repo.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }
  async findById(id: number) {
    return this.repo.findOneBy({ id });
  }
}
