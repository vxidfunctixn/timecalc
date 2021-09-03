const MODE = {
  PLUS: 'plus',
  MINUS: 'minus',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide'
}
const MODE_VALUES = Object.values(MODE)

const ERROR_CODES = [
  /* 0  */ "OK",
  /* 1  */ "Podano wartość z poza zakresu",
  /* 2  */ "Nie podano prawidłowej wartości",
  /* 3  */ "Dzielić i mnożyć można jedynie przez wartość w formacie liczbowym",
  /* 4  */ "Podano zerową wartość",
]

export {
  MODE,
  MODE_VALUES,
  ERROR_CODES
}

