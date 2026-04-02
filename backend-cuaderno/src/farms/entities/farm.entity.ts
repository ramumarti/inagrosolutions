import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Parcel } from '../../parcels/entities/parcel.entity';

@Entity('agri_farms')
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column('float')
  superficie_total: number;

  @ManyToOne(() => User, u => u.farms)
  user: User;

  @OneToMany(() => Parcel, p => p.farm)
  parcels: Parcel[];
}
