import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { User } from '../entities/user.entity';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findOne', () => {
    it('should return undefined when no user exists', async () => {
      const result = await repository.findOne({ email: 'nonexistent@example.com' });
      expect(result).toBeUndefined();
    });

    it('should find user by email', async () => {
      const userData = { email: 'test@example.com', password: 'password123', role: 'viewer' as const };
      const createdUser = repository.create(userData);
      await repository.save(createdUser);

      const result = await repository.findOne({ email: 'test@example.com' });
      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('create', () => {
    it('should create a new user with auto-incremented id', () => {
      const userData = { email: 'test@example.com', password: 'password123', role: 'viewer' as const };
      const user1 = repository.create(userData);
      const user2 = repository.create({ ...userData, email: 'test2@example.com' });

      expect(user1.id).toBe(1);
      expect(user2.id).toBe(2);
    });
  });

  describe('save', () => {
    it('should save a new user', async () => {
      const userData = { email: 'test@example.com', password: 'password123', role: 'viewer' as const };
      const user = repository.create(userData);
      const savedUser = await repository.save(user);

      expect(savedUser).toEqual(user);
    });

    it('should update existing user', async () => {
      const userData = { email: 'test@example.com', password: 'password123', role: 'viewer' as const };
      const user = repository.create(userData);
      await repository.save(user);

      user.role = 'admin';
      const updatedUser = await repository.save(user);

      expect(updatedUser.role).toBe('admin');
    });
  });
});
