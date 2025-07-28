import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['admin', 'editor', 'viewer'])
  role?: 'admin' | 'editor' | 'viewer';
} 