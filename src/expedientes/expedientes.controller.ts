import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';

@Controller('expedientes')
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
  async create(@Body() usuario) {
    return await this.expedientesService.create(usuario);
  }
  @Post('porFacturar')
  async getByDepartament(@Body('departamento') departamento) {
    return await this.expedientesService.getByDepartament(departamento);
  }
  @Post('porCliente')
  async getByClient(@Body('cliente') cliente) {
    return await this.expedientesService.getByClient(cliente);
  }
  @Post(':id')
  async update(@Body() expediente, @Param('id') id) {
    return await this.expedientesService.update(id, expediente);
  }
}
