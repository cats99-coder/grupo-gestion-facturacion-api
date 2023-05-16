import { Factura } from '../schemas/factura.schema';

export const calculoTotales = (factura: Factura) => {
  const totales = factura.expedientes.reduce(
    (prev, currentValue) => {
      //Vemos si ya existe un elemento con ese IVA
      const index = prev.IVAs.findIndex((linea) => {
        return currentValue.IVA === linea.IVA;
      });
      if (index !== -1) {
        prev.IVAs[index].total_concepto += currentValue.importe;
        prev.IVAs[index].importe_IVA +=
          currentValue.importe * (currentValue.IVA / 100);
        prev.IVAs[index].importe_parcial +=
          currentValue.importe +
          currentValue.importe * (currentValue.IVA / 100);
      } else {
        prev.IVAs.push({
          IVA: currentValue.IVA,
          total_concepto: currentValue.importe,
          importe_IVA: currentValue.importe * (currentValue.IVA / 100),
          importe_parcial:
            currentValue.importe +
            currentValue.importe * (currentValue.IVA / 100),
        });
      }
      //Sumamos los suministros y complementos
      prev.total_complementos = +currentValue.suplidos;
      //Calcular la base de retencion
      prev.total_retencion += currentValue.importe;
      //Calculo del total de la factura
      prev.total_factura +=
        currentValue.importe +
        currentValue.importe * (currentValue.IVA / 100) +
        currentValue.suplidos;
      return prev;
    },
    {
      IVAs: [],
      total_complementos: 0,
      total_suministros: 0,
      total_retencion: 0,
      total_factura: 0,
    },
  );
  const retencion = factura.cliente.retencion ? 15 : 0;
  const importe_retencion = (retencion / 100) * totales.total_retencion;
  return { ...totales, retencion, importe_retencion };
};
