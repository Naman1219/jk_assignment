import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  private users: User[] = [];
  private idCounter = 1;

  findOne(where: Partial<User>): User | undefined {
    return this.users.find((user) => {
      return Object.entries(where).every(
        ([key, value]) => user[key as keyof User] === value,
      );
    });
  }

  findAll(): User[] {
    return this.users;
  }

  create(data: Partial<User>): User {
    return {
      id: this.idCounter++,
      email: data.email!,
      password: data.password!,
      role: data.role || 'viewer',
    };
  }

  save(user: User): User {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    if (existingIndex > -1) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    return user;
  }

  update(id: number, data: Partial<User>): User {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    this.users[userIndex] = { ...this.users[userIndex], ...data };
    return this.users[userIndex];
  }

  remove(id: number): void {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    this.users.splice(userIndex, 1);
  }
}