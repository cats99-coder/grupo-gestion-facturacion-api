import { Body, Controller, Post, Res } from '@nestjs/common';
import { ContratoAutonomo } from './dto/documentos';
import { RubenService } from './ruben.service';

@Controller('ruben')
export class RubenController {
  constructor(private rubenService: RubenService) {}
  
  @Post('contrato-autonomo')
  async imprimirContratoAutonomo(
    @Res({ passthrough: true }) res,
    @Body() params: ContratoAutonomo,
  ) {
    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    });
    return await this.rubenService.imprimirContratoAutonomo(params);
  }
}
