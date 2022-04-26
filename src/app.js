const express = require("express");
const cors = require("cors");
const { Server: HttpServer } = require("http");
const { Server: IoServer } = require("socket.io");
require("dotenv").config();
const minimist = require("minimist");
const { promises: fs } = require("fs");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const router = require("./router/routes.js");
const forkRouter = require("./router/forkRouter.js");
const ContenedorArchivo = require("./contenedor/contenedorArchivo.js");
const { normalizeChat } = require("./utils/normalizr.js");

const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

// Configuración server
const app = express();
const httpServer = new HttpServer(app);
const io = new IoServer(httpServer);

// Configuración de comandos ingresados por consola
const optMinimist = { default: { PORT: 8080, MODE: "FORK" } };
const args = minimist(process.argv.slice(2), optMinimist);
const port = args.port || process.env.PORT || 8080;
const mode = args.mode || process.env.MODE || "FORK";

// Session y MongoDB
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(process.env.MONGODB_URI);

app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      mongoOptions: advancedOptions,
    }),
    cookie: {
      maxAge: 60000 * 60, // 1 minute * 1 hour = 1 hour
    },
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Configuración general
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/public");
app.use("/", router);
app.use("/api", forkRouter);

/* Contenedores */
const ProductsContainer = new ContenedorArchivo("productos");
const ChatContainer = new ContenedorArchivo("chat");

// Instancia de socket.io
io.on("connection", async (socket) => {
  console.log("New conection " + socket.id);

  /* Sockect para products */

  // Envío de productos
  let products = await ProductsContainer.getAll();
  socket.emit("server:list_products", products);

  // Escucha nuevos productos
  socket.on("client:save_product", async (prod) => {
    await ProductsContainer.save(prod);

    products = await ProductsContainer.getAll();
    socket.emit("server:list_products", products);
  });

  /* Socket para el chat */

  // Envio los mensajes previos al cliente
  let messages = await ChatContainer.getAll();
  socket.emit("server:all_messages", messages);

  // Escucho los nuevos mensajes
  socket.on("client:new_message", async (msg) => {
    await ChatContainer.save(msg);

    messages = await ChatContainer.getAll();
    io.sockets.emit("server:all_messages", messages);
  });

  (async () => {
    try {
      await norm();
    } catch (err) {
      console.error(err);
    }
  })();
});

// Función normalizar que utiliza fileSystem
const norm = async () => {
  const data = await fs.readFile(__dirname + "/contenedor/chat.txt", "utf-8");
  const chat = normalizeChat(data);
  await fs.writeFile(
    __dirname + "/contenedor/normalized.txt",
    JSON.stringify(chat, null, 2)
  );
};

// Configuración del cluster
if (mode === "FORK") {
  console.log(`[FORK]: Worker ${process.pid} started...`);
  httpServer.listen(port, () => {
    console.log(`Server ${process.pid} on http://localhost:${port}`);
  });
} else {
  console.log(`[CLUSTER]: Master ${process.pid} is running on port ${port}`);
  if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died :(`);
    });
  } else {
    httpServer.listen(port, () => {
      console.log(`Server ${process.pid} on http://localhost:${port}`);
    });
    console.log(`Worker ${process.pid} started`);
  }
}
