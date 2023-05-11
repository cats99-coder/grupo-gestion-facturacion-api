import { Body, Controller, Post, Res } from '@nestjs/common';
import { FiscalService } from './fiscal.service';
import { ContratoAutonomo } from './dto/documentos';

@Controller('fiscal')
export class FiscalController {
  constructor(private fiscalService: FiscalService) {}
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
    return await this.fiscalService.imprimirContratoAutonomo(params);
  }
}
