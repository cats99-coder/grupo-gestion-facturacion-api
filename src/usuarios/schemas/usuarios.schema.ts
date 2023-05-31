import { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema()
export class Usuario {
  @Prop({ required: true })
  nombre: string;
  @Prop({ type: String, required: true, unique: true })
  usuario: string;
  @Prop()
  email: string;
  @Prop({ required: true, select: 1 })
  password: string;
  @Prop({ default: true })
  changePassword: boolean;
  @Prop()
  rol: 'RUBEN' | 'INMA' | 'ANDREA' | 'CRISTINA';
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
