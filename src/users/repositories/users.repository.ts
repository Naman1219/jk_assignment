import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  private users: User[] = [];
  private idCounter = 1;

  async findOne(where: Partial<User>): Promise<User | undefined> {
    // No await needed, but keep async for interface compatibility
    return await Promise.resolve(
      this.users.find((user) => {
        return Object.entries(where).every(
          ([key, value]) => user[key as keyof User] === value,
        );
      })
    );
  }

  create(data: Partial<User>): User {
    return {
      id: this.idCounter++,
      email: data.email!,
      password: data.password!,
      role: data.role || 'viewer',
    };
  }

  async save(user: User): Promise<User> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    if (existingIndex > -1) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    return Promise.resolve(user);
  }
}