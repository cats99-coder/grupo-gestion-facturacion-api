import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ExpedientesModule } from './expedientes/expedientes.module';
import { FacturasModule } from './facturas/facturas.module';
import { ServiciosModule } from './servicios/servicios.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RubenModule } from './ruben/ruben.module';
import { ColaboradoresModule } from './colaboradores/colaboradores.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './env/.env',
    }),
    ClientesModule,
    MongooseModule.forRoot(
      `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/grupo-gestion`,
      {
        autoIndex: true
      }
    ),
    UsuariosModule,
    ExpedientesModule,
    FacturasModule,
    ServiciosModule,
    AuthModule,
    RubenModule,
    ColaboradoresModule,
    ConfiguracionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
