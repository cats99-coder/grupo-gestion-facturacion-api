import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Expediente, ExpedienteDocument } from './schemas/expediente.schema';
import { Usuario } from 'src/usuarios/schemas/usuarios.schema';
import { Deuda, Deudor } from './schemas/Types';
import { join } from 'path';
import * as fs from 'fs/promises';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { zfill } from 'src/utils/numeros';

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
      .populate(['cliente', 'factura']);
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
  async getRecibo(recibo) {
    Handlebars.registerHelper('zfill', (num: string) => {
      return zfill(num, 6);
    });
    Handlebars.registerHelper('zfill2', (num: string) => {
      return zfill(num, 2);
    });
    Handlebars.registerHelper('price', (price: string) => {
      if (!price) {
        return Number(0).toLocaleString('es', {
          style: 'currency',
          currency: 'EUR',
        });
      }
      const priceNumber = Number(price);
      return priceNumber.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
      });
    });
    Handlebars.registerHelper('pricesin', (price: string) => {
      if (!price) {
        return Number(0).toLocaleString('de-DE');
      }
      const priceNumber = Number(price);
      return priceNumber.toLocaleString('de-DE');
    });
    const filePath = join(process.cwd(), 'templates', `recibo.hbs`);
    const filePathRecibos = join(process.cwd(), 'recibos');
    const recibos = await fs.readdir(filePathRecibos);
    console.log(recibos);
    const html = await fs.readFile(filePath, { encoding: 'utf8' });
    const compile = Handlebars.compile(html);
    const now = new Date();
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const fecha = {
      dia: now.getDate(),
      mes: meses[now.getMonth()],
      year: now.getFullYear() - 2000,
    };
    const maxRecibo = () => {
      const max = recibos.sort((a, b) => {
        const [numA, extensionA] = a.split('.');
        const [numB, extensionB] = b.split('.');
        const A = Number(numA);
        const B = Number(numB);
        return B - A;
      });
      const [num, extension] = max[0].split('.');
      return Number(num) + 1;
    };
    const numero_recibo = recibos.length === 0 ? 1 : maxRecibo();
    const htmlCompiled = compile({ ...recibo, ...fecha, numero_recibo });
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlCompiled);
    const pdf = await page.pdf({
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      printBackground: true,
      landscape: true,
      format: 'A5',
    });
    await browser.close();
    await fs.writeFile(
      filePathRecibos + `/${zfill(numero_recibo, 6)}.pdf`,
      pdf,
    );
    return new StreamableFile(pdf);
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
