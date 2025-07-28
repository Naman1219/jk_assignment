import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call usersService.findAll', async () => {
      const expectedResult = [{ id: 1, email: 'test@example.com', role: 'admin' }];
      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should call usersService.findById with user id', async () => {
      const req = { user: { userId: 1 } };
      const expectedResult = { id: 1, email: 'test@example.com', role: 'viewer' };
      mockUsersService.findById.mockResolvedValue(expectedResult);

      const result = await controller.getProfile(req);

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findById', async () => {
      const expectedResult = { id: 1, email: 'test@example.com', role: 'admin' };
      mockUsersService.findById.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should call usersService.create', async () => {
      const createUserDto: CreateUserDto = { email: 'new@example.com', password: 'password123', role: 'editor' };
      const expectedResult = { id: 1, email: 'new@example.com', role: 'editor' };
      mockUsersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should call usersService.update', async () => {
      const updateUserDto: UpdateUserDto = { email: 'updated@example.com', role: 'admin' };
      const expectedResult = { id: 1, email: 'updated@example.com', role: 'admin' };
      mockUsersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should call usersService.remove', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(usersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
