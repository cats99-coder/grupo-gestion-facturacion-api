import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuarioService: UsuariosService) {}
  @Get('')
  async getAll() {
    return await this.usuarioService.getAll();
  }
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.usuarioService.getById(id);
  }
  @Post('')
  async create(@Body() usuario) {
    return await this.usuarioService.create(usuario);
  }
  @Post(':id')
  async update(@Body() usuario, @Param('id') id) {
    return await this.usuarioService.update(id, usuario);
  }
}
