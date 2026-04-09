import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductionProcess } from './production-process.entity';
import { ProductionAssignment } from './production-assignment.entity';

/**
 * Registro de ejecución real de un proceso por parte de un trabajador.
 * Guarda el instante exacto de inicio y fin para medir duración.
 * La persistencia se hace en BD para que el progreso sobreviva a cierres de sesión.
 */
@Entity('production_process_tracking')
export class ProductionProcessTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'assignment_id' })
  assignmentId: string;

  @ManyToOne(() => ProductionAssignment, (a) => a.processTracking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignment_id' })
  assignment: ProductionAssignment;

  @Column({ name: 'process_id' })
  processId: string;

  @ManyToOne(() => ProductionProcess, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'process_id' })
  process: ProductionProcess;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  /** Duración final en segundos, calculada al completar */
  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
