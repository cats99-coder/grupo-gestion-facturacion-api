import { Module } from '@nestjs/common';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FacturaSchema } from './schemas/factura.schema';
import { ExpedientesModule } from 'src/expedientes/expedientes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'factura', schema: FacturaSchema }]),
    ExpedientesModule,
  ],
  controllers: [FacturasController],
  providers: [FacturasService],
})
export class FacturasModule {}
