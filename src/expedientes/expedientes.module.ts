import { Module } from '@nestjs/common';
import { ExpedientesController } from './expedientes.controller';
import { ExpedientesService } from './expedientes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpedienteSchema } from './schemas/expediente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'expediente', schema: ExpedienteSchema },
    ]),
  ],
  controllers: [ExpedientesController],
  providers: [ExpedientesService],
  exports: [ExpedientesService],
})
export class ExpedientesModule {}
