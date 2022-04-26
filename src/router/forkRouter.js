const { Router } = require("express");
const { randomCalculator } = require("../controller/controller.js");

const forkRouter = Router();

forkRouter.get("/randoms", randomCalculator);

module.exports = forkRouter;
