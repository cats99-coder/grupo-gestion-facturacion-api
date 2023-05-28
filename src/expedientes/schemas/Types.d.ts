import mongoose from 'mongoose';
import { Usuario } from 'src/usuarios/schemas/usuarios.schema';

type Rol = 'RUBEN' | 'INMA' | 'ANDREA' | 'CRISTINA';
interface Deudor {
  tipo: Rol;
  deudas: Deuda[];
}
interface Pago {
  usuario: Usuario;
  importe: number;
}
interface Deuda {
  expediente: number;
  importe: number;
  pagos: Pago[];
}
