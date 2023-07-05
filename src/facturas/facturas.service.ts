import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Factura } from './schemas/factura.schema';
import { ExpedientesService } from 'src/expedientes/expedientes.service';
import { join } from 'path';
import * as fs from 'fs/promises';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import {
  cabeceraAndrea,
  cabeceraInma,
  cabeceraRuben,
  calculoTotales,
} from './utils/facturas';
import { fechaCorta } from 'src/utils/fecha';
import { Workbook } from 'exceljs';
import * as tmp from 'tmp';
import { ClientesService } from 'src/clientes/clientes.service';
@Injectable()
export class FacturasService {
  constructor(
    @InjectModel('factura') private facturaModel: Model<Factura>,
    private expedientesService: ExpedientesService,
    private clientesService: ClientesService,
  ) {}
  async getAll() {
    return await this.facturaModel
      .find({})
      .populate(['usuario', 'cliente', 'expedientes']);
  }
  async getById(id) {
    return await this.facturaModel
      .findById(id)
      .populate(['usuario', 'cliente', 'expedientes']);
  }
  async getByClient(req: Request, cliente: string) {
    return await this.facturaModel
      .find({ cliente: { $eq: cliente } })
      .populate(['usuario', 'cliente']);
  }
  getFirst(tipo: string, serie: string): number {
    const serieNum = parseInt(serie);
    if (serieNum !== 23) return 1;
    if (tipo === 'ANDREA') return 72;
    return 1;
  }
  async maxByType({ tipo, serie }: { tipo: string; serie?: string }) {
    const maximo = await this.facturaModel
      .find({ tipo, serie })
      .sort({ numero: -1 })
      .limit(1)
      .exec();
    const numero =
      maximo.length === 0 ? this.getFirst(tipo, serie) : maximo[0].numero + 1;
    return { numero, tipo, serie };
  }

  async create(factura: any, req: Request) {
    //Comprobamos que los expedientes no estén ya facturados
    //Comprobamos que todos sean del mismo tipo
    //Comprobamos que todos sean del mismo cliente
    const tipos = [];
    const clientes = [];
    const asyncEvery = async (arr, predicate) => {
      for (let e of arr) {
        if (!(await predicate(e))) return false;
      }
      return true;
    };
    try {
      await asyncEvery(factura.expedientes, async (idExpediente) => {
        const expediente = await this.expedientesService.getById(idExpediente);
        if (expediente.factura !== undefined && expediente.factura !== null) {
          console.log('Ya tiene Factura');
          return false;
        }
        if (expediente.cliente === undefined || expediente.cliente === null) {
          console.log('No tiene Cliente');
          return false;
        }
        const clienteIncluded = await asyncEvery(clientes, async (cliente) => {
          const clientID: any = expediente.cliente;
          return cliente._id === clientID._id;
        });
        if (clienteIncluded) {
          clientes.push(expediente.cliente);
        }
        if (!tipos.includes(expediente.tipo)) {
          tipos.push(expediente.tipo);
        }
        if (clientes.length > 1) throw new Error('Hay más de un cliente');
        // if (tipos.length > 1) throw new Error('Hay más de un tipo');
      });
      if (clientes.length === 0) throw new Error('No tiene clientes');
      if (tipos.length === 0)
        throw new Error('Falta algún tipo en un expediente');
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
    //----------------------------------------------------
    //Generamos el último número de factura por tipo
    const maximo = await this.maxByType({
      tipo: factura.tipoParaFacturar,
      serie: factura.serie,
    });
    const fecha = new Date(factura.fecha);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);
    fecha.setMinutes(0);
    fecha.setHours(0);
    const cliente = this.clientesService.getById(clientes[0]);
    const facturaDocument = await this.facturaModel.create({
      ...maximo,
      cliente: clientes[0],
      fecha,
      retencion: (
        await cliente
      ).retencion
        ? +process.env.CONFIGURACION_RETENCION
        : 0,
      expedientes: factura.expedientes,
      usuario: req['user']['_id'],
    });
    console.log(facturaDocument);
    console.log(clientes[0], factura.expedientes, req['user']['_id']);
    //Facturamos los expedientes
    await this.expedientesService.facturar(
      factura.expedientes,
      facturaDocument._id,
    );
    return facturaDocument;
  }
  async imprimirFactura(id) {
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
    Handlebars.registerHelper('percent', (percent: string) => {
      if (!percent) {
        return Number(0).toLocaleString('es', {
          style: 'percent',
        });
      }
      const priceNumber = Number(percent) / 100;
      return priceNumber.toLocaleString('es', {
        style: 'percent',
      });
    });
    const factura = (await this.getById(id)).toObject();
    const filePath = join(process.cwd(), 'templates', `factura.hbs`);
    const html = await fs.readFile(filePath, { encoding: 'utf8' });
    const compile = Handlebars.compile(html);
    const paginacion = (factura, num: number) => {
      let result = '';
      const { expedientes } = factura;
      const items = expedientes.length;
      const numeroPaginas = Math.ceil(items / num);
      for (let i = 0; i < numeroPaginas; i++) {
        if (i * num + num < items) {
          const exp = expedientes.slice(i * num, num);
          result += compile({ ...factura, expedientes: exp });
        } else {
          const exp = expedientes.slice(i * num);
           result += compile({ ...factura, expedientes: exp });
        }
      }
      return result;
    };
    //Creación de la cabecera
    const cabecera = (() => {
      if (factura.tipo === 'RUBEN') {
        return cabeceraRuben;
      }
      if (factura.tipo === 'INMA') {
        return cabeceraInma;
      }
      if (factura.tipo === 'ANDREA') {
        return cabeceraAndrea;
      }
    })();
    //Fecha
    const fecha = fechaCorta(new Date(factura.fecha));
    const fechaFormateada = fecha;
    //Calcular el total de la factura
    const totales = calculoTotales(factura);
    const htmlCompiled = paginacion(
      { ...factura, totales, fechaFormateada, cabecera },
      10,
    );
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlCompiled);
    const pdf = await page.pdf({
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '2cm' },
      printBackground: true,
      format: 'A4',
    });
    await browser.close();
    return new StreamableFile(pdf);
  }
  async generateExcel(facturasSeleccionadas: [string]) {
    //Buscamos las facturas
    const idFacturas = facturasSeleccionadas.map((factura) => {
      return new mongoose.Types.ObjectId(factura);
    });
    const facturas = await this.facturaModel
      .find({ _id: idFacturas })
      .populate(['cliente', 'expedientes'])
      .exec();
    console.log(facturas);
    //Creamos el libro de excel
    const excel = new Workbook();
    const sheet = excel.addWorksheet('Facturas');
    sheet.columns = [
      { header: 'Fecha Factura', key: 'fecha', width: 20 },
      { header: 'Número Factura', key: 'numero_factura', width: 20 },
      { header: 'NIF', key: 'cliente.NIF', width: 20 },
      { header: 'Nombre', key: 'cliente.nombreCompleto', width: 20 },
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Base IVA', key: 'base', width: 15 },
    ];
    //Introducimos los datos
    sheet.addRows([
      ...facturas.map((factura) => {
        const fecha = new Date(factura.fecha);
        fecha.setDate(32);
        return { ...factura, fecha };
      }),
    ]);

    //Guardamos el archivo temporal
    let File = await new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: 'facturacion',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) throw new BadRequestException(err);
          excel.xlsx
            .writeFile(file)
            .then(() => {
              resolve(file);
            })
            .catch((err) => {
              throw new BadRequestException(err);
            });
        },
      );
    });
    return File;
  }
}
