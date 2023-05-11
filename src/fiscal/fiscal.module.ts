import { Module } from '@nestjs/common';
import { FiscalController } from './fiscal.controller';
import { FiscalService } from './fiscal.service';
import { ClientesModule } from 'src/clientes/clientes.module';

@Module({
  imports: [ClientesModule],
  controllers: [FiscalController],
  providers: [FiscalService],
})
export class FiscalModule {}
