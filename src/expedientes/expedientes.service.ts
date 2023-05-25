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
      .find({})
      .populate(['usuario', 'cliente', 'factura'])
      .populate('colaboradores.usuario');
  }
  async getByTipo() {
    return await this.expedienteModel
      .find({ factura: { $exists: false } })
      .populate(['cliente', 'factura', 'colaboradores.usuario']);
  }
  async getByClient(req: Request, cliente: string) {
    return await this.expedienteModel
      .find({ cliente: { $eq: cliente }, tipo: req['user']['rol'] })
      .populate(['usuario', 'cliente', 'factura', 'colaboradores.usuario']);
  }
  async getById(_id) {
    return await this.expedienteModel
      .findById(_id)
      .populate(['cliente', 'factura', 'colaboradores.usuario']);
  }
  async create(req: Request, expediente) {
    const maximo = await this.expedienteModel
      .find()
      .sort({ numero_expediente: -1 })
      .limit(1)
      .exec();
    const numero_expediente =
      maximo.length === 0 ? 230001 : maximo[0].numero_expediente + 1;
    return await this.expedienteModel.create({
      numero_expediente,
      ...expediente,
      tipo: req['user']['rol'],
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
