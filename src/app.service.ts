import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join } from 'path';
import { Workbook } from 'exceljs';
import { ClientesService } from './clientes/clientes.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClienteDocument } from './clientes/schemas/clientes.schema';
import { ExpedienteDocument } from './expedientes/schemas/expediente.schema';
import { UsuarioDocument } from './usuarios/schemas/usuarios.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('usuario') private usuariosModel: Model<UsuarioDocument>,
    @InjectModel('cliente') private clientesModel: Model<ClienteDocument>,
    @InjectModel('expediente')
    private expedientesModel: Model<ExpedienteDocument>,
  ) {}
  async getHello() {
    let usuarios = await this.usuariosModel.find({});
    if (usuarios.length === 0) {
      await this.usuariosModel.create([
        {
          email: 'ruben@gmail.com',
          nombre: 'Rubén',
          password: '1234',
          rol: 'RUBEN',
          usuario: 'ruben',
        },
        {
          email: 'inma@gmail.com',
          nombre: 'Inma',
          password: '1234',
          rol: 'INMA',
          usuario: 'inma',
        },
        {
          email: 'andrea@gmail.com',
          nombre: 'Andrea',
          password: '1234',
          rol: 'ANDREA',
          usuario: 'andrea',
        },
        {
          email: 'cristina@gmail.com',
          nombre: 'Cristina',
          password: '1234',
          rol: 'CRISTINA',
          usuario: 'cristina',
        },
      ]);
    }
    usuarios = await this.usuariosModel.find({});
    const filePath = join(process.cwd(), '/excel/EXPEDIENTES.xlsx');
    const file = await fs.readFile(filePath);
    const workbook = new Workbook();
    await workbook.xlsx.load(file);
    const ws = workbook.worksheets[0];
    //Cargamos los datos del excel
    let excel = [];
    ws.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return;
      excel.push({
        numero_expediente: row.values[1],
        cliente: row.values[2],
        clienteTipo: row.values[3],
        fecha: row.values[4],
        realiza: row.values[5],
        concepto: row.values[6],
        importe: row.values[10],
        IVA: row.values[11],
        suplidos: row.values[13],
        colaboradores: row.values[14],
        cobros: { importe: row.values[16], concepto: row.values[19] },
        pagoColaborador: row.values[19],
      });
    });
    //Preparamos las fechas de los expedientes
    excel = excel.map((e) => {
      const fecha = new Date(e.fecha);
      const antigua = fecha.getTime();
      fecha.setTime(antigua - 60 * 60 * 2 * 1000);
      return { ...e, fecha };
    });
    //Preparamos los números de expediente
    excel = excel.map((e) => {
      const id = e.numero_expediente;
      const fecha = new Date(e.fecha).getTime();
      const fechaFin = new Date('01-01-2019').getTime();
      if (fecha > fechaFin) {
        const pre = new Date(fecha).getFullYear() - 2000;
        const numero_expediente = pre * 10000 + parseInt(id);
        return { ...e, numero_expediente };
      }
      return { ...e, numero_expediente: id };
    });

    //Preparamos los nombres de los clientes
    let clientesId = [];
    excel = excel.map((e) => {
      const clienteId = clientesId.find((clienteId) => {
        return clienteId.clienteExcel === e.cliente;
      });
      const nombreSeparado: Array<string> = e.cliente.split(' ');
      let nombre = '';
      let apellido1 = '';
      let apellido2 = '';
      let tipo = e.clienteTipo;
      let razon_social = '';
      if (nombreSeparado.length === 3) {
        nombre = nombreSeparado[0];
        apellido1 = nombreSeparado[1];
        apellido2 = nombreSeparado[2];
      }
      if (nombreSeparado.length === 2) {
        nombre = nombreSeparado[0];
        apellido1 = nombreSeparado[1];
      }
      if (nombreSeparado.length === 1) {
        nombre = nombreSeparado[0];
      }
      if (nombreSeparado.length === 4) {
        nombre = nombreSeparado[0] + ' ' + nombreSeparado[1];
        apellido1 = nombreSeparado[2];
        apellido2 = nombreSeparado[3];
      }
      if (nombreSeparado.length === 5) {
        nombre =
          nombreSeparado[0] + ' ' + nombreSeparado[1] + ' ' + nombreSeparado[2];
        apellido1 = nombreSeparado[3];
        apellido2 = nombreSeparado[4];
      }
      if (e.cliente === 'WILMAN DE JESUS DE MOYA CABRERA') {
        nombre = 'WILMAN DE JESUS';
        apellido1 = 'DE MOYA';
        apellido2 = 'CABRERA';
      }
      if (e.cliente === 'MANUEL ROQUE FONSECA FERREIRA DE BASTOS') {
        nombre = 'MANUEL ROQUE FONSECA';
        apellido1 = 'FERREIRA';
        apellido2 = 'DE BASTOS';
      }
      if (e.cliente === 'MARIA DE LAS MERCEDES FERNANDEZ GOMEZ') {
        nombre = 'MARIA DE LAS MERCEDES';
        apellido1 = 'FERNANDEZ';
        apellido2 = 'GOMEZ';
      }
      if (!clienteId && tipo === 'PERSONA') {
        clientesId.push({
          clienteExcel: e.cliente,
          nombre,
          apellido1,
          apellido2,
          tipo,
        });
      }

      if (!clienteId && tipo === 'EMPRESA') {
        razon_social = e.cliente;
        clientesId.push({
          clienteExcel: e.cliente,
          razon_social,
          tipo,
        });
      }
      if (tipo === 'EMPRESA') {
        razon_social = e.cliente;
        return {
          ...e,
          cliente: { razon_social },
          clienteExcel: e.cliente,
        };
      }
      return {
        ...e,
        cliente: { nombre, apellido1, apellido2 },
        clienteExcel: e.cliente,
      };
    });
    //Creamos los clientes y cargamos su id
    clientesId = await Promise.all(
      clientesId.map(async (clienteId) => {
        console.log(clienteId);
        const cliente = await this.clientesModel.create({
          ...clienteId,
        });
        return { ...clienteId, _id: cliente._id };
      }),
    );
    excel = excel.map((e) => {
      const cliente = clientesId.find((cliente) => {
        return cliente.clienteExcel === e.clienteExcel;
      });
      return { ...e, cliente: cliente._id };
    });
    //Preparamos los suplidos y cobros
    excel = excel.map((e) => {
      const suplidos = [];
      if (e.suplidos) {
        suplidos.push({
          tipo: '',
          importe: e.suplidos,
        });
      }
      const cobros = [];
      if (e.cobros.importe) {
        const tipo = e.cobros.concepto || '';
        cobros.push({
          tipo: tipo === 'SI' ? '' : tipo,
          importe: e.cobros.importe,
        });
      }
      return { ...e, suplidos, cobros };
    });

    //Preparamos los tipos y colaboradores
    excel = excel.map((e) => {
      if ((e.realiza as string).includes('/')) {
        const [tipo, colaborador] = e.realiza.split('/');
        const usuario = usuarios.find((usuario) => {
          return usuario.rol === colaborador;
        });
        if (e.pagoColaborador) {
          return {
            ...e,
            tipo,
            colaboradores: [
              {
                usuario: usuario._id,
                importe: e.colaboradores,
                pagos: [{ usuario: usuario._id, importe: e.colaboradores }],
              },
            ],
          };
        }
        return {
          ...e,
          tipo,
          colaboradores: [
            {
              usuario: usuario._id,
              importe: e.colaboradores,
              pagos: [],
            },
          ],
        };
      } else {
        const tipo = e.realiza;
        return { ...e, tipo, colaboradores: [] };
      }
    });
    //Creamos los expedientes
    excel = await Promise.all(
      excel.map(async (e, index) => {
        return await this.expedientesModel.create({
          ...e,
        });
      }),
    );
    return excel;
  }
}
