const faker = require("faker");
const { promises: fs } = require("fs");
const path = require("path");

const productFaker = async () => {
  let products = [];
  for (let i = 0; i < 5; i++) {
    products.push({
      id: i,
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      thumbnail: faker.image.animals(),
    });
  }
  await fs.writeFile(
    path.join(__dirname, "../contenedor/productos.txt"),
    JSON.stringify(products, null, 2)
  );
};

module.exports = {
  productFaker,
};
