import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('facturas')
@UseGuards(AuthGuard)
export class FacturasController {
  constructor(private facturasService: FacturasService) {}
  @Get('')
  async getAll(@Req() req: Request) {
    return await this.facturasService.getAll(req);
  }
  @Post('')
  async create(@Body() factura) {
    return await this.facturasService.create(factura);
  }
  @Post('porCliente')
  async getByClient(@Req() req: Request, @Body('cliente') cliente) {
    return await this.facturasService.getByClient(req, cliente);
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
