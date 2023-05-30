import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Expediente, ExpedienteDocument } from './schemas/expediente.schema';
import { Usuario } from 'src/usuarios/schemas/usuarios.schema';
import { Deuda, Deudor } from './schemas/Types';

@Injectable()
export class ExpedientesService {
  constructor(
    @InjectModel('expediente') private expedienteModel: Model<Expediente>,
  ) {}
  async getAll() {
    return await this.expedienteModel
      .find({})
      .sort({ numero_expediente: -1 })
      .populate(['cliente', 'factura'])
      .populate('colaboradores.usuario');
  }
  async getByTipo() {
    return await this.expedienteModel
      .find({ factura: { $exists: false } })
      .populate(['cliente', 'factura', 'colaboradores.usuario'])
      .sort({ numero_expediente: -1 });
  }
  async getByClient(req: Request, cliente: string) {
    return await this.expedienteModel
      .find({ cliente: { $eq: cliente } })
      .populate(['cliente', 'factura', 'colaboradores.usuario'])
      .sort({ numero_expediente: -1 });
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
  async delete(id) {
    try {
      //Comprobamos que no esté facturado
      const expediente = await this.expedienteModel.findById(id).exec();
      if (expediente.factura) throw new BadRequestException();
      return await this.expedienteModel.findByIdAndDelete(id);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          error: err,
        },
        HttpStatus.EXPECTATION_FAILED,
        {
          cause: err,
        },
      );
    }
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
  async getExpedientesColaboraciones(usuario: string) {
    const expedientes = await this.expedienteModel
      .find(
        {
          colaboradores: {
            $elemMatch: {
              usuario: new mongoose.Types.ObjectId(usuario),
            },
          },
        },
        {},
        {},
      )
      .exec();
    return expedientes.map((expediente) => {
      return expediente.toObject();
    });
  }
  async getColaboraciones(usuario: string) {
    //Buscamos los expedientes en lo que aparece en colaboraciones
    const expedientesConColaboraciones =
      await this.getExpedientesColaboraciones(usuario);
    const deudores = expedientesConColaboraciones.reduce(
      (prev: Deudor[], current) => {
        const usuarioIndex = prev.findIndex((value) => {
          return value.tipo === current.tipo;
        });
        if (usuarioIndex !== -1) {
          prev[usuarioIndex].deudas.push(
            ...current.colaboradores
              .filter((value) => {
                return (value.usuario as any).equals(usuario);
              })
              .map((value) => {
                return {
                  expediente: current.numero_expediente,
                  importe: value.importe,
                  pagos: value.pagos,
                  usuario: value.usuario,
                };
              }),
          );
          return prev;
        } else {
          const colaboraciones: Deuda[] = current.colaboradores
            .filter((value) => {
              return (value.usuario as any).equals(usuario);
            })
            .map((value) => {
              return {
                expediente: current.numero_expediente,
                importe: value.importe,
                pagos: value.pagos,
              };
            });
          prev.push({
            tipo: current.tipo,
            deudas: colaboraciones,
          });
          return prev;
        }
      },
      [],
    );
    return deudores;
  }
}
