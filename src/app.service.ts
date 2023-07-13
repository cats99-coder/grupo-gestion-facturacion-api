import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join } from 'path';
import { Workbook } from 'exceljs';
import { ClientesService } from './clientes/clientes.service';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ClienteDocument } from './clientes/schemas/clientes.schema';
import { ExpedienteDocument } from './expedientes/schemas/expediente.schema';
import { UsuarioDocument } from './usuarios/schemas/usuarios.schema';
import { ColaboradorDocument } from './colaboradores/colaborador.schema';
import { objectId, zfill } from './utils/numeros';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('usuario') private usuariosModel: Model<UsuarioDocument>,
    @InjectModel('cliente') private clientesModel: Model<ClienteDocument>,
    @InjectModel('colaborador')
    private colaboradoresModel: Model<ColaboradorDocument>,
    @InjectModel('expediente')
    private expedientesModel: Model<ExpedienteDocument>,
  ) {}
  async getHello() {
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
    const numeros_expedientes = [];
    const expedientes_repedidos = [];
    excel.forEach((e) => {
      const index = numeros_expedientes.findIndex((num) => {
        return num === e.numero_expediente;
      });
      if (index !== -1) {
        expedientes_repedidos.push(e.numero_expediente);
      }
      numeros_expedientes.push(e.numero_expediente);
    });
    console.log(expedientes_repedidos);
    if (expedientes_repedidos.length !== 0) {
      throw new BadRequestException(expedientes_repedidos);
    }
    let usuarios = await this.usuariosModel.find({});
    if (usuarios.length === 0) {
      await this.usuariosModel.create([
        {
          email: '',
          nombre: 'Rubén',
          password: '1111',
          rol: 'RUBEN',
          usuario: 'ruben',
        },
        {
          email: '',
          nombre: 'Inma',
          password: '1111',
          rol: 'INMA',
          usuario: 'inma',
        },
        {
          email: '',
          nombre: 'Andrea',
          password: '1111',
          rol: 'ANDREA',
          usuario: 'andrea',
        },
        {
          email: '',
          nombre: 'Cristina',
          password: '1111',
          rol: 'CRISTINA',
          usuario: 'cristina',
        },
      ]);
    }
    usuarios = await this.usuariosModel.find({});
    //Creamos el colaborador auxiliar
    const auxColaborador = await this.colaboradoresModel.create({
      nombre: 'Ajuste de Origen',
    });
    //Preparamos el IVA
    excel = excel.map((e) => {
      const importe = e.importe || 0;
      const colaboradores = e.colaboradores || 0;
      if (e.IVA) {
        const IVA = (e.IVA * 100) / (importe + colaboradores);
        return { ...e, IVA };
      }

      return e;
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
    console.log('clientes');
    //Preparamos los suplidos y cobros
    excel = excel.map((e) => {
      const suplidos = [];
      const cobros = [];
      if (e.cobros.importe) {
        const fecha = new Date(e.fecha).getTime();
        const fechaFin = new Date('01-01-2023').getTime();
        //Tiene un suplido
        if (e.suplidos) {
          const id = objectId();
          suplidos.push({
            _id: new mongoose.Types.ObjectId(id),
            concepto: '',
            abonado: fecha > fechaFin ? false : true,
            importe: e.suplidos,
          });
          if (e.cobros.concepto !== 'SI' && e.cobros.concepto !== '') {
            cobros.push(
              {
                tipo: 'SUPLIDO',
                suplido: new mongoose.Types.ObjectId(id),
                importe: e.suplidos,
              },
              {
                tipo: 'GENERAL',
                cobradoPor: e.cobros.concepto,
                importe:
                  Number(e.cobros.importe || 0) - Number(e.suplidos || 0),
              },
            );
          } else {
            cobros.push(
              {
                tipo: 'SUPLIDO',
                suplido: new mongoose.Types.ObjectId(id),
                importe: e.suplidos,
              },
              {
                tipo: 'GENERAL',
                importe:
                  Number(e.cobros.importe || 0) - Number(e.suplidos || 0),
              },
            );
          }
        }
        //No tiene suplido
        else {
          if (e.cobros.concepto !== 'SI' && e.cobros.concepto !== '') {
            cobros.push({
              tipo: 'GENERAL',
              cobradoPor: e.cobros.concepto,
              importe: Number(e.cobros.importe || 0),
            });
          } else {
            cobros.push({
              tipo: 'GENERAL',
              importe: Number(e.cobros.importe || 0),
            });
          }
        }
      } else {
        if (e.suplidos) {
          const fecha = new Date(e.fecha).getTime();
          const fechaFin = new Date('01-01-2023').getTime();
          const id = objectId();
          suplidos.push({
            _id: new mongoose.Types.ObjectId(id),
            concepto: '',
            abonado: fecha > fechaFin ? false : true,
            importe: e.suplidos,
          });
        }
      }
      return { ...e, suplidos, cobros };
    });
    console.log('suplidos');
    //Preparamos los tipos y colaboradores
    excel = excel.map((e) => {
      if (e.realiza === 'INMA') {
        if (e.colaboradores) {
          const tipo = e.realiza;
          return {
            ...e,
            tipo,
            colaboradores: [
              {
                usuario: auxColaborador._id,
                importe: Number(e.colaboradores || 0),
                pagos: [
                  {
                    usuario: auxColaborador._id,
                    importe: Number(e.colaboradores || 0),
                  },
                ],
              },
            ],
          };
        } else {
          const tipo = e.realiza;
          return {
            ...e,
            tipo,
            colaboradores: [],
          };
        }
      }
      if (e.realiza === 'RUBEN') {
        if (e.colaboradores) {
          const tipo = e.realiza;
          return {
            ...e,
            tipo,
            colaboradores: [
              {
                usuario: auxColaborador._id,
                importe: Number(e.colaboradores || 0),
                pagos: [
                  {
                    usuario: auxColaborador._id,
                    importe: Number(e.colaboradores || 0),
                  },
                ],
              },
            ],
          };
        } else {
          const tipo = e.realiza;
          return {
            ...e,
            tipo,
            colaboradores: [],
          };
        }
      }
      if ((e.realiza as string).includes('/')) {
        const [tipo, colaborador] = e.realiza.split('/');
        const usuario = usuarios.find((usuario) => {
          return usuario.rol === colaborador;
        });
        if (e.realiza === 'INMA/RUBEN') {
          return {
            ...e,
            importe: Number(e.importe || 0) / 2,
            tipo,
            colaboradores: [
              {
                usuario: usuario._id,
                importe: Number(e.importe || 0) / 2,
                pagos: [
                  { usuario: usuario._id, importe: Number(e.importe || 0) / 2 },
                ],
              },
              {
                usuario: auxColaborador._id,
                importe: Number(e.colaboradores || 0),
                pagos: [
                  {
                    usuario: auxColaborador._id,
                    importe: Number(e.colaboradores || 0),
                  },
                ],
              },
            ],
          };
        }
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
    console.log('colaboradores');
    //Creamos los expedientes
    excel = await Promise.all(
      excel.map(async (e, index) => {
        if (e.tipo === 'inma') {
          console.log(e);
        }
        e.cobros.forEach((element) => {
          if (Number.isNaN(element.importe)) {
            console.log(e);
          }
        });
        if (e.colaboradores.length !== 0) {
          if (Number.isNaN(e.colaboradores[0].importe)) {
            console.log(e);
          }
        }
        return await this.expedientesModel.create({
          ...e,
        });
      }),
    );
    return excel;
  }
  async cambiarDatosCristina() {
    let expedientes = await this.expedientesModel
      .find({
        tipo: 'CRISTINA',
      })
      .sort({ numero_expediente: 1 })
      .lean()
      .exec();
    const ruben = await this.usuariosModel.findOne({ rol: 'RUBEN' });
    expedientes = expedientes.map((expediente) => {
      let importe = expediente.importe;
      //Tiene colaborador
      if (expediente.colaboradores.length !== 0) {
        const aux = expediente.colaboradores[0].importe;
        expediente.colaboradores[0].importe = importe;
        if (expediente.colaboradores[0].pagos.length !== 0) {
          expediente.colaboradores[0].pagos[0].importe = importe;
        }
        importe = aux;
        //No tiene colaborador
      } else {
        importe *= 0.5;
        expediente.colaboradores.push({
          usuario: ruben,
          importe: importe,
          pagos: [
            {
              fecha: new Date(),
              importe,
              usuario: ruben,
            },
          ],
        });
      }
      return { ...expediente, importe };
    });
    const suma = expedientes.reduce(
      (suma: any, expediente: any) => {
        suma.sumaImporte += Number(expediente.importe || 0);
        suma.sumaColaboradores += expediente.colaboradores.reduce(
          (suma, colaborador) => {
            return suma + Number(colaborador.importe || 0);
          },
          0,
        );
        return suma;
      },
      {
        sumaImporte: 0,
        sumaColaboradores: 0,
      },
    );
    await this.expedientesModel.deleteMany({ tipo: 'CRISTINA' });
    await this.expedientesModel.create(expedientes);
    return [
      {
        ruben,
        'Suma Importes': suma.sumaImporte,
        'Suma Colaboradores': suma.sumaColaboradores,
      },
      expedientes,
    ];
  }
  async tipoGestion() {
    const filePath = join(process.cwd(), '/excel/TIPOGESTION.xlsx');
    const file = await fs.readFile(filePath);
    const workbook = new Workbook();
    await workbook.xlsx.load(file);
    const ws = workbook.worksheets[0];
    const excel = [];
    ws.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return;
      excel.push({
        year: row.values[1],
        numero: row.values[2],
        tipoGestion: row.values[3],
      });
    });
    excel.forEach(async (e) => {
      const numero = e.year
        ? Number(e.year) * 10000 + Number(e.numero)
        : Number(e.numero);
      const res = await this.expedientesModel.updateOne(
        { numero_expediente: numero },
        { $set: { tipoGestion: e.tipoGestion } },
      );
      console.log(res);
    });
    return excel;
  }
}
