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
    const filePath = join(process.cwd(), '/excel/EXPEDIENTES.xlsm');
    const file = await fs.readFile(filePath);
    const workbook = new Workbook();
    await workbook.xlsx.load(file);
    const ws = workbook.worksheets[0];
    //Cargamos los datos del excel
    let excel = [];
    ws.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return;
      excel.push({
        cliente: row.values[2],
        fecha: row.values[3],
        realiza: row.values[4],
        concepto: row.values[5],
        importe: row.values[9],
        IVA: row.values[10],
        suplidos: row.values[12],
        colaboradores: row.values[13],
        cobros: { importe: row.values[15], concepto: row.values[18] },
        pagoColaborador: row.values[18],
      });
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
      if (nombreSeparado.length === 3) {
        nombre = nombreSeparado[0];
        apellido1 = nombreSeparado[1];
        apellido2 = nombreSeparado[2];
      }
      if (nombreSeparado.length === 2) {
        nombre = nombreSeparado[0];
        apellido1 = nombreSeparado[1];
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

      if (!clienteId) {
        clientesId.push({
          clienteExcel: e.cliente,
          nombre,
          apellido1,
          apellido2,
        });
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
          nombre: clienteId.nombre,
          apellido1: clienteId.apellido1,
          apellido2: clienteId.apellido2,
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
        const maximo = await this.expedientesModel
          .find()
          .sort({ numero_expediente: -1 })
          .limit(1)
          .exec();
        let numero_expediente = 230000 + index + 1;
        if (index >= 12) {
          numero_expediente += 2;
        }
        if (index >= 18) {
          numero_expediente += 1;
        }
        if (index >= 132) {
          numero_expediente += 1;
        }
        return await this.expedientesModel.create({
          ...e,
          numero_expediente,
        });
      }),
    );
    return excel;
  }
}
