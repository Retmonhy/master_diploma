(function Temp() {
  const dots = 20;
  const pow = Math.pow;
  //инициализация массива температуры
  let temp = new Array(dots);
  for (let i = 0; i <= dots; i++) temp[i] = new Array(dots);
  let alfa = new Array(dots);
  let beta = new Array(dots);
  let gamma = new Array(dots);
  let A = new Array(dots);
  let B = new Array(dots);
  let C = new Array(dots);
  let D = new Array(dots);
  let p = new Array(dots);
  let q = new Array(dots);
  //константы
  const lam = 3;
  const capacity = 700;
  const ro = 7500;
  const outerRadius = 1;
  const innerRadius = 0.1;
  const temp_upper = 500;
  const temp_lower = 300;
  const kappa = lam / (capacity * ro);
  //Значения шагов
  const tau = 0.01;
  const h_rad = (outerRadius - innerRadius) / dots;
  const h_fi = (2 * Math.PI) / dots;
  const kurant = (tau * kappa) / 2;

  //вспомогательные фукнции
  const rad_calc = (k) => innerRadius + h_rad * k;

  //начальные условия
  for (let i = 0; i <= dots; i++) {
    for (let k = 0; k <= dots; k++) {
      if (i <= dots / 2) temp[i][k] = temp_upper;
      if (i > dots / 2) temp[i][k] = temp_lower;
    }
  }

  //Расчет поля температуры
  let time = 0;
  do {
    time += tau;
    //расчет температуры по радиусу
    for (let i = 1; i <= dots - 1; i++) {
      for (let k = 1; k <= dots - 1; k++) {
        A[k] = 1 / pow(h_rad, 2);
        B[k] = -1.0 * (2 / pow(h_rad, 2) + 1 / (rad_calc(k) * h_rad) + 1 / kurant);
        C[k] = 1 / pow(h_rad, 2) + 1 / (rad_calc(k) * h_rad);
        D[k] =
          -1.0 *
          (temp[i + 1][k] * (1 / pow(rad_calc(k) * h_fi, 2)) +
            temp[i][k] * (1 / kurant - 2 / pow(rad_calc(k) * h_fi, 2)) +
            temp[i - 1][k] * (1 / pow(rad_calc(k) * h_fi, 2)));
      }
      A[0] = 0;
      B[0] = -1;
      C[0] = 1;
      D[0] = 0;
      A[dots] = -1;
      B[dots] = 1;
      C[dots] = 0;
      D[dots] = 0;

      alfa[0] = -C[0] / B[0];
      beta[0] = D[0] / B[0];

      for (let k = 1; k < dots; k++) {
        alfa[k] = -C[k] / (A[k] * alfa[k - 1] + B[k]);
        beta[k] = (D[k] - A[k] * beta[k - 1]) / (A[k] * alfa[k - 1] + B[k]);
      }
      temp[i][dots] = (D[dots] - A[dots] * beta[dots - 1]) / (A[dots] * alfa[dots - 1] + B[dots]);
      for (let k = dots - 1; k >= 0; k--) {
        temp[i][k] = temp[i][k + 1] * alfa[k] + beta[k];
      }
    }
    //Проверка на поломку
    for (let i = 0; i <= dots; i++) {
      for (let k = 0; k <= dots; k++) {
        if (typeof temp[k][i] !== "number" || temp[k][i] > 600) {
          throw Error(`Что то пошло не так в точке k = ${k}, i = , ${i}`);
        }
      }
    }
    //расчет температуры по углу;
    for (let k = 1; k <= dots - 1; k++) {
      const kur_fi = pow(rad_calc(k) * h_fi, 2);
      //проверить все нижестоящие формулы.  У Князевой буквы перед функцией другие
      A[1] = 1.0 / kur_fi;
      B[1] = -1.0 * (2.0 / kur_fi + 1.0 / kurant);
      C[1] = A[1];
      D[1] =
        -1.0 * temp[1][k + 1] * (1.0 / pow(h_rad, 2) + 1.0 / (rad_calc(k) * h_rad)) +
        temp[1][k] * (2.0 / pow(h_rad, 2) + 1.0 / (h_rad * rad_calc(k)) - 1.0 / kurant) -
        temp[1][k - 1] / pow(h_rad, 2);

      alfa[2] = -C[1] / B[1];
      beta[2] = D[1] / B[1];
      gamma[2] = -A[1] / B[1];

      for (let i = 2; i <= dots; i++) {
        A[i] = 1.0 / kur_fi;
        B[i] = -1.0 * (2.0 / kur_fi + 1.0 / kurant);
        C[i] = A[i];
        D[i] =
          -1.0 * temp[i][k + 1] * (1.0 / pow(h_rad, 2) + 1.0 / (rad_calc(k) * h_rad)) +
          temp[i][k] * (2.0 / pow(h_rad, 2) + 1.0 / (h_rad * rad_calc(k)) - 1.0 / kurant) -
          temp[i][k - 1] / pow(h_rad, 2);

        const denom = B[i] + alfa[i] * A[i];
        alfa[i + 1] = (-1.0 * C[i]) / denom;
        beta[i + 1] = (D[i] - A[i] * beta[i]) / denom;
        gamma[i + 1] = (-1.0 * A[i] * gamma[i]) / denom;
      }
      p[dots - 1] = beta[dots];
      q[dots - 1] = alfa[dots] + gamma[dots];
      for (let i = dots - 2; i > 0; i--) {
        p[i] = alfa[i + 1] * p[i + 1] + beta[i + 1];
        q[i] = alfa[i + 1] * q[i + 1] + gamma[i + 1];
      }
      //расчет поля температур
      temp[dots][k] = (p[1] * alfa[dots + 1] + beta[dots + 1]) / (1 - gamma[dots + 1] - q[1] * alfa[dots + 1]);
      temp[0][k] = temp[dots][k];
      for (let i = 1; i < dots; i++) {
        temp[i][k] = p[i] + temp[dots][k] * q[i];
        console.log(`temp[${i}][${k}] = `, temp[k][i]);
      }
      for (let i = 0; i <= dots; i++) {
        temp[i][0] = temp[i][1];
        temp[i][dots] = temp[i][dots - 1];
      }
    }
  } while (time < 5);
  console.log("temp = ", temp);
})();
