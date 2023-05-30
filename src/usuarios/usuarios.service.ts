import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Usuario } from './schemas/usuarios.schema';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel('usuario') private usuariosModel: Model<Usuario>) {}
  async getAll() {
    return await this.usuariosModel.find();
  }
  async getById(id) {
    return await this.usuariosModel.findById(id);
  }
  async getByUser(user: string) {
    return await this.usuariosModel
      .findOne({ usuario: user })
      .select('+password');
  }
  async create(usuario) {
    return await this.usuariosModel.create(usuario);
  }
  async update(id, usuario) {
    return await this.usuariosModel.findByIdAndUpdate(id, usuario, {
      new: true,
    });
  }
  async changePassword(req: Request, oldPassword, newPassword: string) {
    const res = await this.usuariosModel
      .findById(new mongoose.Types.ObjectId(req['user']['_id']))
      .select('+password');
    if (res.password !== oldPassword)
      throw new BadRequestException('Contraseña Antigua Incorrecta');
    await this.usuariosModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(req['user']['_id']),
      {
        $set: { password: newPassword },
      },
    );
  }
}
