import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private configService: ConfiguracionService) {}
  @Get()
  async getConfig() {
    return await this.configService.getconfig()
  }
  @Post()
  async update(@Body('config') config: {}) {
    return await this.configService.update(config)
  }
}
