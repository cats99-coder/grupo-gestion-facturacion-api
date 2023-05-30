import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Res({ passthrough: true }) res,
    @Body() signInDto: Record<string, any>,
  ) {
    const token = await this.authService.signIn(
      signInDto.usuario,
      signInDto.password,
    );
    return token;
  }
  @UseGuards(AuthGuard)
  @Post('verify')
  async verify() {
    return true;
  }
}
