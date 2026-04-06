import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('holidays')
export class Holiday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'holiday_date', type: 'date' })
  holidayDate: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;
}
