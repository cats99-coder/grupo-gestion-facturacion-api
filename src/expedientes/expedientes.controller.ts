import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
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
  @Post(':id')
  async update(@Body() expediente, @Param('id') id) {
    return await this.expedientesService.update(id, expediente);
  }
}
