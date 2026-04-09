import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProductionTask } from './production-task.entity';
import { User } from '../../users/entities/user.entity';
import { ProductionAssignmentStatus } from '../../common/enums/production-assignment-status.enum';
import { ProductionProcessTracking } from './production-process-tracking.entity';
import { ProductionWaste } from './production-waste.entity';

@Entity('production_assignments')
export class ProductionAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => ProductionTask, (task) => task.assignments)
  @JoinColumn({ name: 'task_id' })
  task: ProductionTask;

  @Column({ name: 'worker_id' })
  workerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'worker_id' })
  worker: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: ProductionAssignmentStatus,
    default: ProductionAssignmentStatus.ASSIGNED,
  })
  status: ProductionAssignmentStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @OneToMany(() => ProductionProcessTracking, (t) => t.assignment)
  processTracking: ProductionProcessTracking[];

  @OneToMany(() => ProductionWaste, (w) => w.assignment)
  wasteReports: ProductionWaste[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
