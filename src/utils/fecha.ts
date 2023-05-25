export function fechaLarga(date: Date = new Date()): string {
  const diaSemana = date.getDay();
  const dia = date.getDate();
  const diasSemana = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  const mes = date.getUTCMonth();
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const year = date.getFullYear();
  return `${diasSemana[diaSemana]}, ${dia}, ${meses[mes]} de ${year}`;
}
export function fechaCorta(date: Date = new Date()): string {
  const dia = date.getDate();
  const mes = date.getUTCMonth();
  const year = date.getFullYear();
  return `${dia < 10 ? '0' + dia : dia}/${
    mes < 9 ? '0' + (mes + 1) : mes + 1
  }/${year}`;
}
