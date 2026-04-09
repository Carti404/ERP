import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductionAssignment } from './production-assignment.entity';

/**
 * Registro de merma (pérdida de material) reportada por el trabajador
 * al finalizar todos los procesos de una asignación.
 */
@Entity('production_waste')
export class ProductionWaste {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'assignment_id' })
  assignmentId: string;

  @ManyToOne(() => ProductionAssignment, (a) => a.wasteReports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignment_id' })
  assignment: ProductionAssignment;

  /** ID del insumo en Mundo Terapeuta */
  @Column({ name: 'product_id', nullable: true })
  productId: string;

  /** Nombre del insumo para referencia rápida */
  @Column({ name: 'product_name', length: 250 })
  productName: string;

  /** Tipo/nivel del insumo (N1, N2, N3, N4) */
  @Column({ name: 'item_type', length: 50, nullable: true })
  itemType: string;

  /** Cantidad de merma reportada */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  /** Unidad de medida (g, kg, ml, pza, etc.) */
  @Column({ name: 'unit_of_measure', length: 50, nullable: true })
  unitOfMeasure: string;

  /** Observaciones adicionales del trabajador */
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
