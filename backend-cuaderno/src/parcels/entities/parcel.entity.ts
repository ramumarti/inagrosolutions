import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Farm } from '../../farms/entities/farm.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';

@Entity()
export class Parcel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  referencia_sigpac: string;

  @Column('float')
  superficie: number;

  @ManyToOne(() => Farm, f => f.parcels)
  farm: Farm;

  @OneToMany(() => Treatment, t => t.parcel)
  treatments: Treatment[];
}
