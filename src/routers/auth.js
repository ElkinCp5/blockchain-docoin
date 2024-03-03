const express = require("express");
const Blockchain = require("../classes/blockchain");
const Jwt = require("../classes/jwt");

const AuthRouter = express.Router();

AuthRouter.post("/signup", async function (req, res) {
  try {
    const { wallet } = req.body;
    const { address } = Blockchain.wallet().add(wallet);
    const { jwt } = await (await Jwt.create(address)).setCookie(res);
    res.json({ authentication: jwt, address }).status(200);
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

AuthRouter.post("/signin", async function (req, res) {
  try {
    const wallet = Blockchain.wallet().find(req?.body?.wallet);
    if (!wallet?.address) throw new Error("Error trying to log in");
    const { jwt } = await (await Jwt.create(wallet?.address)).setCookie(res);
    res.json({ authentication: jwt }).status(200);
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

module.exports = AuthRouter;
