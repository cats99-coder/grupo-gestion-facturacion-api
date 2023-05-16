import mongoose, { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Usuario } from 'src/usuarios/schemas/usuarios.schema';
import { Cliente } from 'src/clientes/schemas/clientes.schema';
import { Factura } from 'src/facturas/schemas/factura.schema';

export type ExpedienteDocument = HydratedDocument<Expediente>;

@Schema()
class Suplido {
  @Prop()
  concepto: string;
  @Prop()
  importe: number;
}

const SuplidoSchema = SchemaFactory.createForClass(Suplido);

@Schema()
class Estado {
  @Prop()
  concepto: string;
  @Prop({ default: new Date() })
  fecha: Date;
}

const EstadoSchema = SchemaFactory.createForClass(Estado);

@Schema()
export class Expediente {
  @Prop({ required: true })
  numero_expediente: number;
  @Prop({ default: new Date() })
  fecha: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'usuario' })
  usuario: Usuario;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'cliente' })
  cliente: Cliente;
  @Prop()
  concepto: string;
  @Prop()
  unidades: number;
  @Prop({ default: 0 })
  importe: number;
  @Prop({ default: 0 })
  IVA: number;
  @Prop({ type: [SuplidoSchema] })
  suplidos: Suplido[];
  @Prop({ type: [EstadoSchema] })
  estados: Estado[];
  @Prop({ default: 0 })
  provisiones: number;
  @Prop({ default: 0 })
  colaborador: number;
  @Prop({ default: 'FISCAL' })
  tipo: 'FISCAL' | 'GESTORIA' | 'ABOGACIA';
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'factura' })
  factura: Factura;
}

export const ExpedienteSchema = SchemaFactory.createForClass(Expediente);
