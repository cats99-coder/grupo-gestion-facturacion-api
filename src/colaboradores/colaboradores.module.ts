import { Module } from '@nestjs/common';
import { ColaboradoresController } from './colaboradores.controller';
import { ColaboradoresService } from './colaboradores.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ColaboradorSchema } from './colaborador.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'colaborador',
        schema: ColaboradorSchema,
        collection: 'colaboradores',
      },
    ]),
  ],
  controllers: [ColaboradoresController],
  providers: [ColaboradoresService],
  exports: [
    MongooseModule.forFeature([
      {
        name: 'colaborador',
        schema: ColaboradorSchema,
        collection: 'colaboradores',
      },
    ]),
  ],
})
export class ColaboradoresModule {}
