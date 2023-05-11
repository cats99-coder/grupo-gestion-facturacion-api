import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
  constructor(private clientesService: ClientesService) {}
  @Get('')
  async getAll() {
    return await this.clientesService.getAll();
  }
  @Get(':id')
  async getById(@Param('id') id) {
    return await this.clientesService.getById(id);
  }
  @Post('')
  async create(@Body() cliente) {
    return await this.clientesService.create(cliente);
  }
  @Post(':id')
  async update(@Body() cliente, @Param('id') id) {
    return await this.clientesService.update(id, cliente);
  }
}
