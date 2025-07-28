import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => '$2b$10$hashed.password'),
  compareSync: jest.fn(() => true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepository;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$test.hash',
    role: 'viewer',
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    service = new UsersService((mockUsersRepository as any) as UsersRepository);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users without passwords', () => {
      mockUsersRepository.findAll.mockReturnValue([mockUser, { ...mockUser, id: 2, email: 'test2@example.com' }]);
      const result = service.findAll();
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
    });
  });

  describe('findById', () => {
    it('should return user without password if found', () => {
      mockUsersRepository.findOne.mockReturnValue(mockUser);
      const result = service.findById(1);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw NotFoundException if user not found', () => {
      mockUsersRepository.findOne.mockReturnValue(undefined);
      expect(() => service.findById(999)).toThrow(NotFoundException);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
      role: 'editor',
    };

    it('should create a new user successfully', () => {
      mockUsersRepository.findOne.mockReturnValue(undefined);
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockReturnValue(mockUser);
      const result = service.create(createUserDto);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: expect.stringContaining('$2b$'),
        role: createUserDto.role,
      });
      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', () => {
      mockUsersRepository.findOne.mockReturnValue(mockUser);
      expect(() => service.create(createUserDto)).toThrow(ConflictException);
    });

    it('should use default role if not provided', () => {
      const createUserDtoWithoutRole = { email: 'new@example.com', password: 'password123' };
      mockUsersRepository.findOne.mockReturnValue(undefined);
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockReturnValue(mockUser);
      service.create(createUserDtoWithoutRole);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        email: createUserDtoWithoutRole.email,
        password: expect.stringContaining('$2b$'),
        role: 'viewer',
      });
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      role: 'admin',
    };

    it('should update user successfully', () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersRepository.findOne
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(undefined);
      mockUsersRepository.update.mockReturnValue(updatedUser);
      const result = service.update(1, updateUserDto);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(mockUsersRepository.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', () => {
      mockUsersRepository.findOne.mockReturnValue(undefined);
      expect(() => service.update(999, updateUserDto)).toThrow(NotFoundException);
    });

    it('should throw ConflictException if new email already exists', () => {
      const existingUser = { ...mockUser, id: 2 };
      mockUsersRepository.findOne
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(existingUser);
      expect(() => service.update(1, { email: 'existing@example.com' })).toThrow(ConflictException);
    });

    it('should hash password if provided', () => {
      const updateUserDtoWithPassword = { ...updateUserDto, password: 'newpassword' };
      const updatedUser = { ...mockUser, ...updateUserDtoWithPassword };
      mockUsersRepository.findOne
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(undefined);
      mockUsersRepository.update.mockReturnValue(updatedUser);
      service.update(1, updateUserDtoWithPassword);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(1, {
        ...updateUserDtoWithPassword,
        password: expect.stringContaining('$2b$'),
      });
    });
  });

  describe('remove', () => {
    it('should remove user successfully', () => {
      mockUsersRepository.findOne.mockReturnValue(mockUser);
      mockUsersRepository.remove.mockReturnValue(undefined);
      service.remove(1);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(mockUsersRepository.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', () => {
      mockUsersRepository.findOne.mockReturnValue(undefined);
      expect(() => service.remove(999)).toThrow(NotFoundException);
    });
  });
}); 