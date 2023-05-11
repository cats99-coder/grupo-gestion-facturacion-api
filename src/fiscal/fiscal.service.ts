import { Injectable, StreamableFile } from '@nestjs/common';
import { join } from 'path';
import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import { ClientesService } from 'src/clientes/clientes.service';
import Handlebars from 'handlebars';
import { ContratoAutonomo } from './dto/documentos';

@Injectable()
export class FiscalService {
  constructor(private clientesService: ClientesService) {}
  async imprimirContratoAutonomo(params: ContratoAutonomo): Promise<StreamableFile> {
    //Preparando la plantilla
    const filePath = join(
      process.cwd(),
      'templates',
      'fiscal',
      `contrato_autonomo.hbs`,
    );
    const html = await fs.readFile(filePath, { encoding: 'utf-8' });
    const compile = Handlebars.compile(html);

    //Cargar Datos del cliente
    const cliente = (await this.clientesService.getById(params._id)).toObject();
    //Fecha
    const fecha = new Date().toLocaleString()
    const htmlCompiled = compile({cliente, fecha});
    const browser = await puppeteer.launch();
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
