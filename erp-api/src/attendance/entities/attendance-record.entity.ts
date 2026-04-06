import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AttendanceLog } from './attendance-log.entity';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', insert: false, update: false })
  userId: string;

  // Fecha del día laboral registrado (YYYY-MM-DD)
  @Column({ type: 'date', name: 'work_date' })
  workDate: string;

  // Estado del día (Puntual, Retardo, Falta, etc.) calculado en base a tolerancia
  @Column({ type: 'varchar', length: 50, default: 'En_Proceso' })
  status: string;

  @OneToMany(() => AttendanceLog, (log) => log.attendanceRecord, {
    cascade: true,
  })
  logs: AttendanceLog[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
