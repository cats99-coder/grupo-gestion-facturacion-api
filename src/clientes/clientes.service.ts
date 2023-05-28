import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './schemas/clientes.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClientesService {
  constructor(@InjectModel('cliente') private clientesModel: Model<Cliente>) {}
  async getAll() {
    return await this.clientesModel.find().sort({apellido1: 1, apellido2: 1, nombre: 1});
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
