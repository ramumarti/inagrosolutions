import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FarmsModule } from './farms/farms.module';
import { ParcelsModule } from './parcels/parcels.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { ExportController } from './export.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'cuaderno',
      autoLoadEntities: true,
      synchronize: true, // Only for development!
    }),
    JwtModule.register({ 
      secret: 'SECRET_KEY', 
      signOptions: { expiresIn: '7d' } 
    }),
    UsersModule,
    AuthModule,
    FarmsModule,
    ParcelsModule,
    TreatmentsModule,
  ],
  controllers: [ExportController],
})
export class AppModule {}
