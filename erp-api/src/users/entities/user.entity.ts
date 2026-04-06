import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from '../../common/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 64 })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ name: 'pin_hash', type: 'varchar', length: 72 })
  pinHash: string;

  @Column({ type: 'enum', enum: UserRole, enumName: 'user_role_enum' })
  role: UserRole;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  puesto: string | null;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'inactivo_desde', type: 'timestamptz', nullable: true })
  inactivoDesde: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
