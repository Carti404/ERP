import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('work_schedule_blocks')
export class WorkScheduleBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'block_key', type: 'varchar', length: 20, unique: true })
  blockKey: string;

  @Column({ name: 'start_time', type: 'varchar', length: 5 })
  startTime: string;

  @Column({ name: 'end_time', type: 'varchar', length: 5 })
  endTime: string;

  @Column({ name: 'tolerance_minutes', type: 'int' })
  toleranceMinutes: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
