import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { FacturasService } from './facturas.service';

@Controller('facturas')
export class FacturasController {
  constructor(private facturasService: FacturasService) {}
  @Get('')
  async getAll() {
    return await this.facturasService.getAll();
  }
  @Post('')
  async create(@Body() factura) {
    return await this.facturasService.create(factura);
  }
  @Post('porCliente')
  async getByClient(@Body('cliente') cliente) {
    return await this.facturasService.getByClient(cliente);
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
