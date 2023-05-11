import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    return await this.usuariosModel.findOne({ usuario: user });
  }
  async create(usuario) {
    return await this.usuariosModel.create(usuario);
  }
  async update(id, usuario) {
    return await this.usuariosModel.findByIdAndUpdate(id, usuario, {
      new: true,
    });
  }
}
