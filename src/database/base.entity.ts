import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base entity providing common audit columns for all entities.
 */
export abstract class BaseEntity {
  /**
   * Primary key.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Creation timestamp.
   */
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  /**
   * Last update timestamp.
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  /**
   * Soft-delete timestamp.
   */
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}