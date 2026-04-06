import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plant_rest_settings')
export class PlantRestSettings {
  @PrimaryColumn({ type: 'smallint' })
  id: number;

  @Column({ name: 'snack_nominal_minutes', type: 'int' })
  snackNominalMinutes: number;

  @Column({ name: 'lunch_from_time', type: 'varchar', length: 5 })
  lunchFromTime: string;

  @Column({ name: 'lunch_duration_minutes', type: 'int' })
  lunchDurationMinutes: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
