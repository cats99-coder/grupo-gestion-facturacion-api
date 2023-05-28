import mongoose, { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Usuario } from 'src/usuarios/schemas/usuarios.schema';
import { Cliente } from 'src/clientes/schemas/clientes.schema';
import { Expediente } from 'src/expedientes/schemas/expediente.schema';
import { zfill } from 'src/utils/numeros';

export type FacturaDocument = HydratedDocument<Factura>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Factura {
  @Prop()
  serie: number;
  @Prop()
  numero: number;
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

FacturaSchema.virtual('numero_factura').get(function () {
  if (this.tipo === 'RUBEN') {
    return `EXPT${this.serie}${zfill(this.numero, 4)}`;
  }
  return `${this.serie}${zfill(this.numero, 4)}`
});
