import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UseGuards,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { AuthGuard } from 'src/auth/auth.guard';
import * as fs from 'fs/promises';

@Controller('facturas')
@UseGuards(AuthGuard)
export class FacturasController {
  constructor(private facturasService: FacturasService) {}
  @Get('')
  async getAll() {
    return await this.facturasService.getAll();
  }
  @Post('')
  async create(@Req() req: Request, @Body() factura) {
    return await this.facturasService.create(factura, req);
  }
  @Post('porCliente')
  async getByClient(@Req() req: Request, @Body('cliente') cliente) {
    return await this.facturasService.getByClient(req, cliente);
  }
  @Post('generarExcel')
  async generateExcel(
    @Res({ passthrough: true }) res,
    @Body('facturas') facturas,
  ) {
    // res.set({
    //   // pdf
    //   // 'Content-Type':
    //   //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //   // 'Content-Disposition': 'attachment; filename=facturas.xlsx',
    //   // prevent cache
    //   'Cache-Control': 'no-cache, no-store, must-revalidate',
    //   Pragma: 'no-cache',
    //   Expires: 0,
    // });
    const fileUrl = await this.facturasService.generateExcel(facturas);
    console.log(fileUrl)
    const buffer = await fs.readFile(`${fileUrl}`);
    console.log(buffer)
    return new StreamableFile(buffer);
  }
  @Post('imprimir')
  async imprimir(@Res({ passthrough: true }) res, @Body('id') id) {
    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    });
    return await this.facturasService.imprimirFactura(id);
  }
}
