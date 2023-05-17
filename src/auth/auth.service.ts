import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}
  async signIn(username: string, pass: string): Promise<any> {
    const user = (await this.usuariosService.getByUser(username)).toObject();
    if (user?.password !== pass || user === null) {
      throw new UnauthorizedException();
    }
    const payload = {
      _id: user._id,
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: `${process.env.JWT}`,
        expiresIn: '12h',
      }),
    };
  }
}
