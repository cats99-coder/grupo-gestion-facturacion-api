import { HttpException, HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Factura } from './schemas/factura.schema';
import { ExpedientesService } from 'src/expedientes/expedientes.service';
import { join } from 'path';
import * as fs from 'fs/promises';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
@Injectable()
export class FacturasService {
  constructor(
    @InjectModel('factura') private facturaModel: Model<Factura>,
    private expedientesService: ExpedientesService,
  ) {}
  async getAll() {
    return await this.facturaModel
      .find()
      .populate(['usuario', 'cliente', 'expedientes']);
  }
  async getById(id) {
    return await this.facturaModel
      .findById(id)
      .populate(['usuario', 'cliente', 'expedientes']);
  }
  async getByClient(cliente: string) {
    return await this.facturaModel
      .find({ cliente: { $eq: cliente } })
      .populate(['usuario', 'cliente']);
  }
  async maxByType({ tipo, serie }: { tipo: string; serie?: string }) {
    //Tipo Gestoria
    if (tipo === 'GESTORIA') {
      const maximo = await this.facturaModel
        .find({ tipo: 'GESTORIA' })
        .sort({ numero_factura: -1 })
        .limit(1)
        .exec();
      const numero_factura =
        maximo.length === 0 ? 1 : maximo[0].numero_factura + 1;
      return { numero_factura, tipo };
    }
    //Tipo Fiscal
    if (tipo === 'FISCAL') {
      const maximo = await this.facturaModel
        .find({ tipo: 'FISCAL', serie })
        .sort({ numero_factura: -1 })
        .limit(1)
        .exec();
      console.log(serie);
      const numero_factura =
        maximo.length === 0 ? 1 : maximo[0].numero_factura + 1;
      return { numero_factura, tipo, serie };
    }
  }
  async create(factura: any) {
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
        if (!tipos.includes(factura.tipo)) {
          tipos.push(factura.tipo);
        }
        if (clientes.length > 1) throw new Error('Hay más de un cliente');
        if (tipos.length > 1) throw new Error('Hay más de un tipo');
      });
      if (clientes.length === 0) throw new Error('No tiene clientes');
      if (tipos.length === 0) throw new Error('Falta algún tipo un expediente');
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.EXPECTATION_FAILED,
        error: err,
      }, HttpStatus.EXPECTATION_FAILED, {
        cause: err
      });
    }
    //----------------------------------------------------

    //Generamos el último número de factura por tipo
    const maximo = await this.maxByType({
      tipo: tipos[0],
      serie: factura.serie,
    });
    const facturaDocument = await this.facturaModel.create({
      ...maximo,
      cliente: clientes[0],
      expedientes: factura.expedientes,
    });
    //Facturamos los expedientes
    await this.expedientesService.facturar(
      factura.expedientes,
      facturaDocument._id,
    );
    return facturaDocument;
  }
  async imprimirFactura(id) {
    const factura = (await this.getById(id)).toObject();
    const filePath = join(process.cwd(), 'templates', `factura.hbs`);
    const html = await fs.readFile(filePath, { encoding: 'utf8' });
    const compile = Handlebars.compile(html);
    const paginacion = (factura, num: number) => {
      let result = '';
      const { expedientes } = factura;
      const items = expedientes.length;
      const numeroPaginas = Math.ceil(items / num);
      console.log('Número de factura', factura.numero_factura);
      console.log('Serie enviada', factura.serie);
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
    //Fecha
    const fecha = new Date(factura.fecha).toLocaleDateString();
    const fechaFormateada = fecha;
    //Calcular el total de la factura
    const total = factura.expedientes.reduce((prev, currentValue) => {
      if (currentValue.importe && currentValue.unidades) {
        return prev + currentValue.importe * currentValue.unidades;
      }
      return prev;
    }, 0);
    const htmlCompiled = paginacion({ ...factura, total, fechaFormateada }, 10);
    const browser = await puppeteer.launch({ headless: true });
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
}
