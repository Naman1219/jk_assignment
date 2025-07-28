import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../users/repositories/users.repository';
import { User } from '../../users/entities/user.entity';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { LoginAuthDto } from '../dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

function omitPassword(user: User): Omit<User, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  register(registerDto: RegisterAuthDto): Omit<User, 'password'> {
    const { email, password, role } = registerDto;
    const existing = this.usersRepository.findOne({ email });
    if (existing) throw new ConflictException('Email already registered');
    const hashed = bcrypt.hashSync(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashed,
      role: role || 'viewer',
    });
    const saved = this.usersRepository.save(user);
    return omitPassword(saved);
  }

  validateUser(email: string, password: string): Omit<User, 'password'> | null {
    const user = this.usersRepository.findOne({ email });
    if (!user) return null;
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return null;
    return omitPassword(user);
  }

  async login(loginDto: LoginAuthDto): Promise<{ access_token: string }> {
    const user = this.usersRepository.findOne({ email: loginDto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = bcrypt.compareSync(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
    return { access_token };
  }
}
