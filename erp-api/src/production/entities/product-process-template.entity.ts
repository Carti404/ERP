import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Plantilla de procesos reutilizable por producto.
 * Cuando el admin define procesos para una orden, se guarda una copia aquí
 * vinculada al productId de MT. Las futuras órdenes del mismo producto
 * heredan estos procesos automáticamente.
 */
@Entity('product_process_templates')
export class ProductProcessTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del producto en Mundo Terapeuta */
  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'product_name', nullable: true })
  productName: string;

  /** Posición en la secuencia (1, 2, 3…) */
  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /** Tiempo estimado por proceso individual */
  @Column({ name: 'estimated_time_value', type: 'int', default: 0 })
  estimatedTimeValue: number;

  @Column({ name: 'estimated_time_unit', length: 20, default: 'minutes' })
  estimatedTimeUnit: string;

  /** Tiempo total estimado para TODA la serie de procesos (se guarda en cada fila por consistencia) */
  @Column({ name: 'total_estimated_time_value', type: 'int', default: 0 })
  totalEstimatedTimeValue: number;

  @Column({ name: 'total_estimated_time_unit', length: 20, default: 'minutes' })
  totalEstimatedTimeUnit: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
