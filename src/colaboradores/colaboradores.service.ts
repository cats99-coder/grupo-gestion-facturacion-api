import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ColaboradorDocument } from './colaborador.schema';

@Injectable()
export class ColaboradoresService {
  constructor(@InjectModel('colaborador') private clientesModel: Model<ColaboradorDocument>) {}
  async getAll() {
    return await this.clientesModel
      .find()
      .sort({ razon_social: 1, apellido1: 1, apellido2: 1, nombre: 1 });
  }
  async getById(id) {
    return await this.clientesModel.findById(id);
  }
  async create(cliente) {
    return await this.clientesModel.create(cliente);
  }
  async update(id, cliente) {
    return await this.clientesModel.findByIdAndUpdate(id, cliente, {
      new: true,
    });
  }
}
