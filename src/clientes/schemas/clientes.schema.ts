import { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type ClienteDocument = HydratedDocument<Cliente>;

@Schema()
class Contacto {
  @Prop()
  nombre: string;
}

const ContactoSchema = SchemaFactory.createForClass(Contacto);

@Schema()
export class Cliente {
  @Prop({ required: true })
  NIF: string;
  @Prop({ required: true })
  nombre: string;
  @Prop()
  email: string;
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
  @Prop({default: false})
  retencion: boolean;
  @Prop({ type: [ContactoSchema] })
  contactos: Contacto[];
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);