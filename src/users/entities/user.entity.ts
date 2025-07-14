import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'admin' | 'editor' | 'viewer';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer',
  })
  role: UserRole;
}