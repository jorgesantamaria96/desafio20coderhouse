const socket = io();

socket.on("server:list_products", (dataProds) => {
  renderProds(dataProds);
});

const renderProds = (dataProds) => {
  document.querySelector("#prods").innerHTML = dataProds.map((prod) => {
    return `
            <div class="card mb-3" style="max-width: 540px;">
                <div class="row g-0">
                <div class="col-md-4">
                    <img src=${prod.thumbnail} class="img-fluid rounded-start" alt="...">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                    <h5 class="card-title">${prod.name}</h5>
                    <p class="card-text">${prod.price}</p>
                    </div>
                </div>
                </div>
            </div>
        `;
  });
};

const formProducts = document.querySelector("#form-products");
const productName = document.querySelector("#name");
const price = document.querySelector("#price");
const thumbnail = document.querySelector("#thumbnail");

formProducts.addEventListener("submit", (e) => {
  e.preventDefault();

  const newProduct = {
    name: productName.value,
    price: price.value,
    thumbnail: thumbnail.value,
  };

  socket.emit("client:save_product", newProduct);
});
