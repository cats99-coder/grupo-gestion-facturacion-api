import mongoose, { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Usuario } from 'src/usuarios/schemas/usuarios.schema';
import { Cliente } from 'src/clientes/schemas/clientes.schema';
import { Expediente } from 'src/expedientes/schemas/expediente.schema';

export type FacturaDocument = HydratedDocument<Factura>;

@Schema()
export class Factura {
  @Prop()
  numero_factura: number;
  @Prop()
  serie: number;
  @Prop()
  tipo: 'RUBEN' | 'INMA' | 'ANDREA';
  @Prop({ default: new Date() })
  fecha: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'usuario' })
  usuario: Usuario;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'cliente' })
  cliente: Cliente;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'expediente' })
  expedientes: [Expediente];
}

export const FacturaSchema = SchemaFactory.createForClass(Factura);
