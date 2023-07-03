import { Injectable, StreamableFile } from '@nestjs/common';
import { ClientesService } from 'src/clientes/clientes.service';
import { ContratoAutonomo } from './dto/documentos';
import { join } from 'path';
import * as fs from 'fs/promises';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { fechaLarga } from 'src/utils/fecha';

@Injectable()
export class RubenService {
  constructor(private clientesService: ClientesService) {}
  async imprimirContratoAutonomo(
    params: ContratoAutonomo,
  ): Promise<StreamableFile> {
    Handlebars.registerHelper('price', (price: string) => {
      if (!price) {
        return Number(0).toLocaleString('es', {
          style: 'currency',
          currency: 'EUR',
        });
      }
      const priceNumber = Number(price);
      return priceNumber.toLocaleString('es', {
        style: 'currency',
        currency: 'EUR',
      });
    });
    //Preparando la plantilla
    const filePath = join(
      process.cwd(),
      'templates',
      'ruben',
      `contrato_autonomo.hbs`,
    );
    const html = await fs.readFile(filePath, { encoding: 'utf-8' });
    const compile = Handlebars.compile(html);

    //Cargar Datos del cliente
    const cliente = (await this.clientesService.getById(params._id)).toObject();
    //Fecha
    const fecha = fechaLarga();
    const htmlCompiled = compile({ ...params, cliente, fecha,  });
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlCompiled);

    //Ajustes del pdf
    const pdf = await page.pdf({
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '2cm' },
      printBackground: true,
      format: 'A4',
    });
    await browser.close();
    return new StreamableFile(pdf);
  }
}
