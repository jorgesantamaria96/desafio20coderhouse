const ContenedorArchivo = require("../contenedor/contenedorArchivo.js");
const User = require("../models/User.js");
const validator = require("validator");
const bcrypt = require("bcrypt");
const path = require("path");
const minimist = require("minimist");
const { fork } = require("child_process");

const { productFaker } = require("../utils/faker.js");

const ProductsContainer = new ContenedorArchivo("productos");
const ChatContainer = new ContenedorArchivo("chat");

const getFormView = async (req, res) => {
  try {
    const datos = await ProductsContainer.getAll();
    return res.render("../public/productos", {
      datos,
      email: req.session.email,
      error: false,
      renderTable: datos.length > 0,
    });
  } catch (error) {
    console.log(error);
  }
};

const getChat = async (req, res, next) => {
  const messages = await ChatContainer.getAll();
  return res.render("../public/chat", {
    messages,
    email: req.session.email,
  });
};

const getProductTest = async (req, res, next) => {
  try {
    (async () => {
      try {
        await productFaker();
      } catch (error) {
        console.log(error);
      }
    })();
    const datos = await ProductsContainer.getAll();
    return res.render("../public/product-test", {
      datos,
      email: req.session.email,
      error: false,
      renderTable: datos.length > 0,
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteAllProducts = async (req, res) => {
  await ProductsContainer.deleteAll();
  console.log("Productos borrados exitosamente");
  const datos = await ProductsContainer.getAll();
  return res.render("../public/productos", {
    datos: datos,
    email: req.session.email,
    error: false,
    renderTable: datos.length > 0,
  });
};

const loginUser = async (req, res) => {
  return res.render("../public/login", {
    error: "",
  });
};

const registerUser = async (req, res) => {
  return res.render("../public/register", {
    error: "",
  });
};

const requestLogin = async (req, res) => {
  const { email, password } = req.body;

  let validationEmail = validator.isEmail(email);
  let validationPassword = !validator.isEmpty(password);

  if (validationEmail && validationPassword) {
    try {
      const user = await User.findOne({ email: email });

      if (!user) {
        return res.render("../public/login", {
          error: "El usuario no se encuentra registrado.",
        });
      } else {
        const isUserValid = await bcrypt.compare(password, user.password);

        if (isUserValid) {
          req.session.email = email;
          res.redirect("/");
        }
      }
    } catch (error) {
      return res.render("../public/login", {
        error: "No existe el usuario.",
      });
    }
  } else {
    return res.render("../public/login", {
      error: "Los datos ingresados son incorrectos.",
    });
  }
};

const requestRegister = async (req, res) => {
  const { email, password } = req.body;

  let validationEmail = validator.isEmail(email);
  let validationPassword = !validator.isEmpty(password);

  if (!validationEmail && !validationPassword) {
    return res.render("../public/register", {
      error: "Los datos ingresados son incorrectos.",
    });
  } else {
    try {
      const foundUser = await User.findOne({ email: email });

      if (foundUser) {
        return res.render("../public/register", {
          error: "El usuario ya existe.",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const encryptPassword = await bcrypt.hash(password, salt);

        const user = new User({
          email,
          password: encryptPassword,
        });

        await user.save();

        req.session.email = email;
        return res.redirect("/");
      }
    } catch (error) {
      return res.render("../public/register", {
        error: "Por favor, ingrese los datos correctamente.",
      });
    }
  }
};

const logoutUser = async (req, res) => {
  req.session.destroy((err) => {
    if (!err) res.redirect("/");
    else res.send({ status: "Logout ERROR", body: err });
  });
};

const getInfo = (req, res) => {
  const args = minimist(process.argv)._; // Argumentos usando minimist
  const absoluteRoute = process.cwd(); // Ruta absoluta del proyecto
  const pid = process.pid; // id de proceso en mi máquina
  const version = process.version; // Version de node utilizada
  const title = process.title; // Cuál es el titulo del proceso
  const platform = process.platform; // Plataforma en la que se ejecuta el proyecto
  const memoryUsage = process.memoryUsage(); // Memoria utilizada
  const execPath = process.execPath; // Exec Path
  const numCPUS = require("os").cpus().length; // Numero de cpu's de mi pc

  return res.render("../public/info", {
    email: req.session.email,
    args,
    absoluteRoute,
    pid,
    version,
    title,
    platform,
    memoryUsage,
    execPath,
    numCPUS,
  });
};

const randomCalculator = (req, res) => {
  let limit = 100000000;
  if (req.query.cant) {
    limit = Number(req.query.cant);
  }

  let pathChild = path.join(__dirname, "../utils/calculator.js");
  const forked = fork(pathChild);
  forked.send(limit);

  forked.on("message", (msg) => {
    res.status(200).send(msg);
  });
};

module.exports = {
  getFormView,
  getProductTest,
  getChat,
  deleteAllProducts,
  loginUser,
  registerUser,
  requestLogin,
  logoutUser,
  requestRegister,
  getInfo,
  randomCalculator,
};
