import { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema()
export class Usuario {
  @Prop({ required: true })
  nombre: string;
  @Prop({ required: true, unique: true })
  usuario: string;
  @Prop()
  email: string;
  @Prop({ required: true, select: 0 })
  password: string;
  @Prop({ default: true })
  changePassword: boolean;
  @Prop()
  roles: ['fiscal' | 'gestoria' | 'abogacia'];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
