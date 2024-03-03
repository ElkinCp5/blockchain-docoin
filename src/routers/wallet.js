const express = require("express");
const Blockchain = require("../classes/blockchain");
const Jwt = require("../classes/jwt");

const WalletRouter = express.Router();

WalletRouter.get("/", async function (req, res) {
  try {
    await Jwt.verify(req, null, "address");
    res.json({ data: Blockchain.wallet().all() });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

WalletRouter.get("/detail", async function (req, res) {
  try {
    const { address } = await Jwt.extract(req);
    res.json({
      data: Blockchain.wallet().find(req?.query?.address || address),
    });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

WalletRouter.get("/balance", async function (req, res) {
  try {
    const { address } = await Jwt.extract(req);
    res.json({
      data: Blockchain.wallet().balance(req?.query?.address || address),
    });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

WalletRouter.post("/transfer", async function (req, res) {
  try {
    const { address: sender } = await Jwt.extract(req);
    const { address: recipient, amount: shipping_amount } = req.body;
    const { amount: sender_amount } = Blockchain.wallet().balance(sender);
    const { amount: recipient_amount } = Blockchain.wallet().balance(recipient);
    if (typeof shipping_amount === "number" && shipping_amount > 0) {
      throw new Error("The shipping amount must be greater than 0.");
    }
    if (sender_amount < shipping_amount) {
      throw new Error("Insufficient amount for transfer.");
    }
    res.json({
      data: Blockchain.transferBlock(sender, recipient, shipping_amount, {
        sender_result: sender_amount - shipping_amount,
        recipient_result: recipient_amount + shipping_amount,
      }),
    });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

WalletRouter.post("/mine", async function (req, res) {
  try {
    const { address } = await Jwt.extract(req);
    res.json({ data: Blockchain.mineBlock(address) });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

WalletRouter.post("/", async function (req, res) {
  const { names } = req.body;
  try {
    await Jwt.verify(req);
    res.json({ data: Blockchain.wallet().add(names) });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

module.exports = WalletRouter;
