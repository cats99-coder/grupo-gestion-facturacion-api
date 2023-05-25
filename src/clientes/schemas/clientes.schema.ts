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

@Schema()
export class Cliente {
  @Prop({ required: true, unique: true })
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
