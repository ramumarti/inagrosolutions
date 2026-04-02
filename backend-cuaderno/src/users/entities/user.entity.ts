import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Farm } from '../../farms/entities/farm.entity';

@Entity('agri_users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  nif: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'agricultor' })
  tipo_usuario: string;

  @OneToMany(() => Farm, f => f.user)
  farms: Farm[];
}
