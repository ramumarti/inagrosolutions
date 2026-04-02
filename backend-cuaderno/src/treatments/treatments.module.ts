import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from './entities/treatment.entity';
import { TreatmentsController } from './treatments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Treatment])],
  controllers: [TreatmentsController],
  exports: [TypeOrmModule]
})
export class TreatmentsModule {}
