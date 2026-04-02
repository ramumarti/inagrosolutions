import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Parcel } from '../../parcels/entities/parcel.entity';

@Entity()
export class Treatment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  producto: string;

  @Column()
  numero_registro: string;

  @Column('float')
  dosis: number;

  @Column()
  unidad: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column()
  ropo: string;

  @ManyToOne(() => Parcel, p => p.treatments)
  parcel: Parcel;
}
