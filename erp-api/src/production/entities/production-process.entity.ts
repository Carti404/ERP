import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductionTask } from './production-task.entity';

/**
 * Representa un paso/proceso individual dentro de una orden de producción.
 * El admin define estos procesos para cada tarea; los trabajadores los ejecutan secuencialmente.
 */
@Entity('production_processes')
export class ProductionProcess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => ProductionTask, (task) => task.processes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: ProductionTask;

  /** Posición en la secuencia (1, 2, 3…) */
  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /** Tiempo estimado que el admin asigna (Entero) */
  @Column({ name: 'estimated_time_value', type: 'int', default: 0 })
  estimatedTimeValue: number;

  /** Unidad de tiempo (minutes, hours, days, weeks) */
  @Column({ name: 'estimated_time_unit', length: 20, default: 'minutes' })
  estimatedTimeUnit: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
