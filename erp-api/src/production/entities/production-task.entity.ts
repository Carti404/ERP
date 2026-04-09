import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductionAssignment } from './production-assignment.entity';
import { ProductionProcess } from './production-process.entity';

@Entity('production_tasks')
export class ProductionTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_mt_id', unique: true })
  externalMtId: string; // ID of the production-order in Mundo Terapeuta

  @Column({ name: 'order_number', nullable: true })
  orderNumber: string;

  @Column({ name: 'product_id', nullable: true })
  productId: string;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ type: 'decimal', name: 'quantity_to_produce' })
  quantityToProduce: number;

  @Column({ type: 'jsonb', nullable: true })
  recipe: any; // { items: [{ productName, quantityPerUnit, etc. }] }

  @Column({ name: 'assigned_worker_id', nullable: true, type: 'uuid' })
  assignedWorkerId: string;

  // Status in ERP (DRAFT, ASSIGNED, IN_PROGRESS, PENDING_APPROVAL, CLOSED)
  @Column({ default: 'DRAFT' })
  status: string;

  @OneToMany(() => ProductionAssignment, (assignment) => assignment.task)
  assignments: ProductionAssignment[];

  @OneToMany(() => ProductionProcess, (process) => process.task)
  processes: ProductionProcess[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
