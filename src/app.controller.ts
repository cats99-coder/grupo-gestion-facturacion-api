import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('migracion')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('install')
  async getHello() {
    return await this.appService.getHello();
  }
  @Get('cambiarDatosCristina')
  async cambiarDatosCristina() {
    return await this.appService.cambiarDatosCristina();
  }
}
