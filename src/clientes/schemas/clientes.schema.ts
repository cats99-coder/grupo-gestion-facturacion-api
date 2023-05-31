import { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type ClienteDocument = HydratedDocument<Cliente>;

@Schema()
class Contacto {
  @Prop()
  nombre: string;
  @Prop()
  apellido1: string;
  @Prop()
  apellido2: string;
  @Prop()
  telefono: string;
  @Prop()
  email: string;
}

const ContactoSchema = SchemaFactory.createForClass(Contacto);

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Cliente {
  @Prop({ type: String, unique: true, sparse: true })
  NIF: string;
  @Prop({ default: 'PERSONA' })
  tipo: 'EMPRESA' | 'PERSONA';
  @Prop()
  razon_social: string;
  @Prop()
  nombre: string;
  @Prop()
  apellido1: string;
  @Prop()
  apellido2: string;
  @Prop()
  email: string;
  @Prop()
  telefono: string;
  @Prop()
  numero_cuenta: string;
  @Prop()
  calle: string;
  @Prop()
  codigo_postal: string;
  @Prop()
  localidad: string;
  @Prop()
  provincia: string;
  @Prop()
  pais: string;
  @Prop({ default: false })
  retencion: boolean;
  @Prop({ type: [ContactoSchema] })
  contactos: Contacto[];
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
ClienteSchema.virtual('nombreCompleto').get(function () {
  if (this.tipo === 'EMPRESA') {
    return this.razon_social;
  } else {
    return `${this.nombre} ${this.apellido1} ${this.apellido2}`;
  }
});
