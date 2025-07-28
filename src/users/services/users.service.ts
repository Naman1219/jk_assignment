import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';

function omitPassword(user: User): Omit<User, 'password'> {
  const { password, ...rest } = user;
  return rest;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll(): Omit<User, 'password'>[] {
    const users = this.usersRepository.findAll();
    return users.map(omitPassword);
  }

  findById(id: number): Omit<User, 'password'> {
    const user = this.usersRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return omitPassword(user);
  }

  create(createUserDto: CreateUserDto): Omit<User, 'password'> {
    const { email, password, role } = createUserDto;
    const existing = this.usersRepository.findOne({ email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashed = bcrypt.hashSync(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashed,
      role: role || 'viewer',
    });
    const saved = this.usersRepository.save(user);
    return omitPassword(saved);
  }

  update(id: number, updateUserDto: UpdateUserDto): Omit<User, 'password'> {
    const user = this.usersRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = this.usersRepository.findOne({ email: updateUserDto.email });
      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }
    const updateData: Partial<User> = {};
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.role) updateData.role = updateUserDto.role;
    if (updateUserDto.password) {
      updateData.password = bcrypt.hashSync(updateUserDto.password, 10);
    }
    const updated = this.usersRepository.update(id, updateData);
    return omitPassword(updated);
  }

  remove(id: number): void {
    const user = this.usersRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.usersRepository.remove(id);
  }
}
