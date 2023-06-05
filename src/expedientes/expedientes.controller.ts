import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('expedientes')
@UseGuards(AuthGuard)
export class ExpedientesController {
  constructor(private expedientesService: ExpedientesService) {}
  @Get('')
  async getAll() {
    return await this.expedientesService.getAll();
  }
  @Get(':id')
  async getByid(@Param('id') id) {
    return await this.expedientesService.getById(id);
  }
  @Post('')
  async create(@Req() req: Request, @Body() expediente) {
    return await this.expedientesService.create(req, expediente);
  }
  @Post('porFacturar')
  async getByTipo() {
    return await this.expedientesService.getByTipo();
  }
  @Post('porCliente')
  async getByClient(@Req() req: Request, @Body('cliente') cliente) {
    return await this.expedientesService.getByClient(req, cliente);
  }
  @Post('colaboraciones')
  async getColaboraciones(@Body('usuario') usuario) {
    return await this.expedientesService.getColaboraciones(usuario);
  }
  @Post('imprimirRecibo')
  async imprimir(@Res({ passthrough: true }) res, @Body() recibo) {
    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    });
    return this.expedientesService.getRecibo(recibo);
  }
  @Post(':id')
  async update(@Body() expediente, @Param('id') id) {
    return await this.expedientesService.update(id, expediente);
  }
  @Delete(':id')
  async delete(@Param('id') id) {
    return await this.expedientesService.delete(id);
  }
}
