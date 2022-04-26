// Funcion random
const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const calculatorRandom = (limit) => {
  let result = {};

  for (let i = 0; i < limit; i++) {
    let number = random(1, 1000);
    if (result[number]) {
      {
        result[number] += 1;
      }
    } else {
      result[number] = 1;
    }
  }

  return result;
};

process.on("message", (limit) => {
  let resultFinal = calculatorRandom(limit);
  process.send(resultFinal);
});

