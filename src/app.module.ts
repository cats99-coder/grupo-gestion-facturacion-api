import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ExpedientesModule } from './expedientes/expedientes.module';
import { FacturasModule } from './facturas/facturas.module';
import { ServiciosModule } from './servicios/servicios.module';
import { FiscalModule } from './fiscal/fiscal.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientesModule,
    MongooseModule.forRoot('mongodb://127.0.0.1/grupo-gestion'),
    UsuariosModule,
    ExpedientesModule,
    FacturasModule,
    ServiciosModule,
    FiscalModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}