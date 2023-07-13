import mongoose, { HydratedDocument, mongo } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Usuario } from 'src/usuarios/schemas/usuarios.schema';
import { Cliente } from 'src/clientes/schemas/clientes.schema';
import { Factura } from 'src/facturas/schemas/factura.schema';

export type ExpedienteDocument = HydratedDocument<Expediente>;

@Schema()
class Suplido {
  @Prop({ default: '' })
  concepto: string;
  @Prop({ default: new Date() })
  fecha: Date;
  @Prop({ default: false })
  abonado: boolean;
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
class Pago {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'usuario' })
  usuario: Usuario;
  @Prop({ default: new Date() })
  fecha: Date;
  @Prop({ default: 0 })
  importe: number;
}

export const PagoSchema = SchemaFactory.createForClass(Pago);

@Schema()
class Colaborador {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'usuario' })
  usuario: Usuario;
  @Prop({ default: 0 })
  importe: number;
  @Prop({ type: [PagoSchema] })
  pagos: Pago[];
}

const ColaboradorSchema = SchemaFactory.createForClass(Colaborador);

@Schema({ toJSON: { virtuals: true } })
class Cobro {
  @Prop({ enum: ['GENERAL', 'PROVISION', 'SUPLIDO'] })
  tipo: 'GENERAL' | 'PROVISION' | 'SUPLIDO';
  @Prop({ enum: ['BIZUM C', 'EFECTIVO R', ''] })
  cobradoPor: 'BIZUM C' | 'EFECTIVO R' | '';
  @Prop({ default: new Date() })
  fecha: Date;
  @Prop({ type: mongoose.Types.ObjectId })
  suplido: mongoose.Types.ObjectId;
  @Prop({ default: 0 })
  importe: number;
}

const CobroSchema = SchemaFactory.createForClass(Cobro);

CobroSchema.virtual('suplidoRef').get(function () {
  return this.suplido;
});

@Schema({})
export class Expediente {
  @Prop({ type: Number, required: true, unique: true })
  numero_expediente: number;
  @Prop({ default: new Date() })
  fecha: Date;
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
  @Prop({ default: false })
  facturaNoCliente: boolean;
  @Prop({ default: 0 })
  perdidas: number;
  @Prop({ type: [SuplidoSchema] })
  suplidos: Suplido[];
  @Prop({ type: [EstadoSchema] })
  estados: Estado[];
  @Prop({ default: 0 })
  provisiones: number;
  @Prop({ type: [ColaboradorSchema] })
  colaboradores: Colaborador[];
  @Prop({ type: [CobroSchema] })
  cobros: Cobro[];
  @Prop({ default: 'RUBEN', enum: ['RUBEN', 'INMA', 'ANDREA', 'CRISTINA'] })
  tipo: 'RUBEN' | 'INMA' | 'ANDREA' | 'CRISTINA';
  @Prop({
    enum: [
      'ASOCIACIONES',
      'EXTRANJERIA',
      'FISCAL',
      'LABORAL',
      'LEGAL',
      'REGISTRO CIVIL',
      'TRAFICO',
      'VARIOS',
    ],
  })
  tipoGestion:
    | 'ASOCIACIONES'
    | 'EXTRANJERIA'
    | 'FISCAL'
    | 'LABORAL'
    | 'LEGAL'
    | 'REGISTRO CIVIL'
    | 'TRAFICO'
    | 'VARIOS';
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'factura' })
  factura: Factura;
}

export const ExpedienteSchema = SchemaFactory.createForClass(Expediente);
