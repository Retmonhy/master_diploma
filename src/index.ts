(function Temp() {
  const dots = 200;
  const pow = Math.pow;
  //инициализация массива температуры
  let temp = new Array(dots);
  for (let i = 0; i <= dots; i++) temp[i] = new Array(dots);
  let alfa = new Array(dots);
  let beta = new Array(dots);
  let A = new Array(dots);
  let B = new Array(dots);
  let C = new Array(dots);
  let D = new Array(dots);

  const lam = 30;
  const capacity = 700;
  const ro = 7500;
  const outerRadius = 1;
  const temp_upper = 500;
  const temp_lower = 300;
  const kappa = lam / (capacity * ro);
  //Значения шагов
  const tau = 0.01;
  const h_rad = outerRadius / dots;
  const h_fi = (2 * Math.PI) / dots;
  const kurant = (tau * kappa) / (2 * pow(h_rad, 2));

  let time = 0;
  //начальные условия
  for (let k = 0; k <= dots; k++) {
    for (let i = 0; i <= dots; i++) {
      if (i < 500) {
        temp[k][i] = temp_upper;
      }
      if (i >= 500) {
        temp[k][i] = temp_lower;
      }
    }
  }

  //Расчет поля температуры
  do {
    time += tau;
    //расчет температуры по радиусу
    for (let i = 1; i <= dots - 1; i++) {
      for (let k = 1; k <= dots - 1; k++) {
        const kur_fi = pow(pow(h_fi * k, 2), -1);
        A[k] = kurant * (1 + pow(k, -1));
        B[k] = kurant * (-2 - pow(k, -1)) - 1;
        C[k] = kurant;
        D[k] =
          -temp[k][i + 1] * kurant * kur_fi + temp[k][i] * (2 * kurant * kur_fi + 1) - temp[k][i - 1] * kurant * kur_fi;
      }
      A[0] = 0; // 1
      B[0] = -1;
      C[0] = 0;
      D[0] = 300; // 0
      A[dots] = -1;
      B[dots] = 1;
      C[dots] = 0;
      D[dots] = 0;

      alfa[0] = -A[0] / B[0];
      beta[0] = D[0] / B[0];

      for (let k = 1; k <= dots - 1; k++) {
        alfa[k] = -A[k] / (C[k] * alfa[k - 1] + B[k]);
        beta[k] = (D[k] - C[k] * beta[k - 1]) / (C[k] * alfa[k - 1] + B[k]);
      }
      temp[dots][i] = (D[dots] - C[dots] * beta[dots - 1]) / (C[dots] * alfa[dots - 1] + B[dots]);
      for (let k = dots - 1; k >= 0; k--) {
        temp[k][i] = temp[k + 1][i] * alfa[k] + beta[k];
      }
    }

    //расчет температуры по углу
    for (let k = 1; k <= dots - 1; k++) {
      for (let i = 1; i <= dots - 1; i++) {
        const kur_fi = pow(pow(h_fi * k, 2), -1);
        // if (i === 0 || i === dots / 2) {
        //   A[i] = 1;
        //   B[i] = -2;
        //   C[i] = 1;
        //   D[i] = 0;
        //   continue;
        // }
        A[i] = kurant * kur_fi;
        B[i] = -2 * kur_fi * kurant - 1;
        C[i] = A[k];
        D[i] =
          -temp[k + 1][i] * kurant * (1 + pow(k, -1)) -
          temp[k][i] * (1 - kurant * (2 + pow(k, -1))) -
          temp[k - 1][i] * kurant;

        if (Math.abs(temp[k][i]) > 5000) {
          return console.log(
            `Что-то идет не так, Числа слишком большие по модулю в точке k = ${k} и i = ${i}`,
            "temp = ",
            temp[k][i]
          );
        }
        // console.log("temp = ", temp[k - 1][i]);
      }
      A[0] = 1;
      B[0] = -2;
      C[0] = 1;
      D[0] = 0;
      A[dots] = 1;
      B[dots] = -2;
      C[dots] = 1;
      D[dots] = 0;
      alfa[0] = -A[0] / B[0];
      beta[0] = D[0] / B[0];
      for (let i = 1; i <= dots - 1; i++) {
        alfa[i] = -A[i] / (C[i] * alfa[i - 1] + B[i]);
        beta[i] = (D[i] - C[i] * beta[i - 1]) / (C[i] * alfa[i - 1] + B[i]);
      }
      temp[k][dots] = (D[dots] - C[dots] * beta[dots - 1]) / (C[dots] * alfa[dots - 1] + B[dots]);
      for (let i = dots - 1; i >= 0; i--) {
        temp[k][i] = temp[k][i + 1] * alfa[i] + beta[i];
      }
    }
  } while (time < 5);
})();
