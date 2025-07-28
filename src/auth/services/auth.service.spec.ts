import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { User } from '../../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => '$2b$10$hashed.password'),
  compareSync: jest.fn(() => true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: UsersRepository;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$test.hash',
    role: 'viewer',
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    service = new AuthService(
      (mockUsersRepository as any) as UsersRepository,
      (mockJwtService as any) as JwtService,
      (mockConfigService as any) as ConfigService,
    );
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterAuthDto = {
      email: 'test@example.com',
      password: 'password123',
      role: 'viewer',
    };

    it('should register a new user successfully', () => {
      mockUsersRepository.findOne.mockReturnValue(undefined);
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockReturnValue(mockUser);
      const result = service.register(registerDto);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ email: registerDto.email });
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: expect.stringContaining('$2b$'),
        role: registerDto.role,
      });
      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw ConflictException if email already exists', () => {
      mockUsersRepository.findOne.mockReturnValue(mockUser);
      expect(() => service.register(registerDto)).toThrow(ConflictException);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ email: registerDto.email });
    });

    it('should use default role if not provided', () => {
      const registerDtoWithoutRole = { email: 'test@example.com', password: 'password123' };
      mockUsersRepository.findOne.mockReturnValue(undefined);
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockReturnValue(mockUser);
      service.register(registerDtoWithoutRole);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        email: registerDtoWithoutRole.email,
        password: expect.stringContaining('$2b$'),
        role: 'viewer',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', () => {
      mockUsersRepository.findOne.mockReturnValue(mockUser);
      const result = service.validateUser('test@example.com', 'password123');
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should return null if user does not exist', () => {
      mockUsersRepository.findOne.mockReturnValue(undefined);
      const result = service.validateUser('nonexistent@example.com', 'password123');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', () => {
      mockUsersRepository.findOne.mockReturnValue(mockUser);
      const bcrypt = require('bcrypt');
      bcrypt.compareSync.mockReturnValueOnce(false);
      const result = service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto: LoginAuthDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token for valid credentials', async () => {
      const mockToken = 'mock.jwt.token';
      mockUsersRepository.findOne.mockReturnValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);
      mockConfigService.get.mockReturnValue('secret');
      const result = await service.login(loginDto);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        {
          secret: 'secret',
          expiresIn: 'secret',
        }
      );
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUsersRepository.findOne.mockReturnValue(undefined);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersRepository.findOne.mockReturnValue(mockUser);
      const bcrypt = require('bcrypt');
      bcrypt.compareSync.mockReturnValueOnce(false);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
