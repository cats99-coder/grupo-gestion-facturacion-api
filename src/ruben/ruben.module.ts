import { Module } from '@nestjs/common';
import { RubenController } from './ruben.controller';
import { RubenService } from './ruben.service';
import { ClientesModule } from 'src/clientes/clientes.module';

@Module({
  imports: [ClientesModule],
  controllers: [RubenController],
  providers: [RubenService],
})
export class RubenModule {}
