import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Expediente, ExpedienteDocument } from './schemas/expediente.schema';

@Injectable()
export class ExpedientesService {
  constructor(
    @InjectModel('expediente') private expedienteModel: Model<Expediente>,
  ) {}
  async getAll() {
    return await this.expedienteModel
      .find()
      .populate(['usuario', 'cliente', 'factura']);
  }
  async getByDepartament(departamento) {
    return await this.expedienteModel
      .find({ tipo: departamento, factura: { $exists: false } })
      .populate(['usuario', 'cliente', 'factura']);
  }
  async getByClient(cliente: string) {
    console.log(cliente)
    return await this.expedienteModel
      .find({ cliente: { $eq: cliente } })
      .populate(['usuario', 'cliente', 'factura']);
  }
  async getById(_id) {
    return await this.expedienteModel
      .findById(_id)
      .populate(['usuario', 'cliente', 'factura']);
  }
  async create(expediente) {
    const maximo = await this.expedienteModel
      .find()
      .sort({ numero_expediente: -1 })
      .limit(1)
      .exec();
    const numero_expediente =
      maximo.length === 0 ? 1 : maximo[0].numero_expediente + 1;
    return await this.expedienteModel.create({
      numero_expediente,
      ...expediente,
    });
  }
  async update(id, expediente) {
    return await this.expedienteModel.findByIdAndUpdate(id, expediente, {
      new: true,
    });
  }
  async facturar(expedientes, factura) {
    expedientes.forEach(async (expediente) => {
      await this.expedienteModel.findByIdAndUpdate(expediente, { factura });
    });
    return true;
  }
}
