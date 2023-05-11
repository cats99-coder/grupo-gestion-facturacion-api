import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteSchema } from './schemas/clientes.schema';
import { ClientesService } from './clientes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'cliente', schema: ClienteSchema }]),
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
