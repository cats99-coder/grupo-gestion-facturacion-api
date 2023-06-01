import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';

@Controller('colaboradores')
export class ColaboradoresController {
  constructor(private colaboradoresService: ColaboradoresService) {}
  @Get('')
  async getAll() {
    return await this.colaboradoresService.getAll();
  }
  @Get(':id')
  async getById(@Param('id') id) {
    return await this.colaboradoresService.getById(id);
  }
  @Post('')
  async create(@Body() cliente) {
    return await this.colaboradoresService.create(cliente);
  }
  @Post(':id')
  async update(@Body() cliente, @Param('id') id) {
    return await this.colaboradoresService.update(id, cliente);
  }
}
