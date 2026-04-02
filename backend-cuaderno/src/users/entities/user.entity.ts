import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Farm } from '../../farms/entities/farm.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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
