export function zfill(number, width) {
  var numberOutput = Math.abs(number); /* Valor absoluto del número */
  var length = number.toString().length; /* Largo del número */
  var zero = '0'; /* String de cero */

  if (width <= length) {
    if (number < 0) {
      return '-' + numberOutput.toString();
    } else {
      return numberOutput.toString();
    }
  } else {
    if (number < 0) {
      return '-' + zero.repeat(width - length) + numberOutput.toString();
    } else {
      return zero.repeat(width - length) + numberOutput.toString();
    }
  }
}
export function objectId() {
  const rnd = (r16: number) => Math.floor(r16).toString(16);
  return (
    rnd(Date.now() / 1000) +
    ' '.repeat(16).replace(/./g, () => rnd(Math.random() * 16))
  );
}
