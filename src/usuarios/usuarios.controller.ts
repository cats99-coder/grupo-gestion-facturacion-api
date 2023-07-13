import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
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
  @Post('changePassword')
  async changePassword(
    @Req() req,
    @Body('oldPassword') oldPassword,
    @Body('newPassword') newPassword,
  ) {
    return await this.usuarioService.changePassword(
      req,
      oldPassword,
      newPassword,
    );
  }
  @Post(':id')
  async update(@Body() usuario, @Param('id') id) {
    return await this.usuarioService.update(id, usuario);
  }
}
