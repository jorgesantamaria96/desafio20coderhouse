const { Router } = require("express");
const {
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
} = require("../controller/controller.js");
const { auth } = require("../middlewares/index.js");

const router = Router();

router.get("/", auth, getFormView);
router.get("/info", auth, getInfo);
router.get("/login", loginUser);
router.get("/register", registerUser);
router.post("/login", requestLogin);
router.post("/register", requestRegister);
router.post("/logout", logoutUser);
router.get("/product-test", auth, getProductTest);
router.get("/chat", auth, getChat);
router.get("/deleteAll", auth, deleteAllProducts);

module.exports = router;
