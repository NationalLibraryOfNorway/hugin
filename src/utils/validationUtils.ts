export function validateBetweenZeroAndFive(value: number) {
  let error;
  if (value < 0) {
    error = 'Tallet kan ikke være negativt';
  } else if (value > 5) {
    error = 'Tallet kan ikke være større enn 5';
  }
  return error;
}
