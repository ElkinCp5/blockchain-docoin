const express = require("express");
const Blockchain = require("../classes/blockchain");
const Jwt = require("../classes/jwt");

/**
 * Router for handling wallet-related routes.
 * @type {express.Router}
 */
const WalletRouter = express.Router();

/**
 * Route handler for getting wallet details.
 * @name GET/detail
 * @function
 * @memberof WalletRouter
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
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

/**
 * Route handler for getting wallet balance.
 * @name GET/balance
 * @function
 * @memberof WalletRouter
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
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

/**
 * Route handler for transferring funds between wallets.
 * @name POST/transfer
 * @function
 * @memberof WalletRouter
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
WalletRouter.post("/transfer", async function (req, res) {
  const { address: sender } = await Jwt.extract(req);
  const { address: recipient, amount } = req.body;
  try {
    const { amount: sender_amount } = Blockchain.wallet().balance(sender);
    const { amount: recipient_amount } = Blockchain.wallet().balance(recipient);
    if (typeof amount !== "number" || !amount) {
      throw new Error("The shipping amount must be greater than 0.");
    }
    if (sender_amount < amount) {
      throw new Error("Insufficient amount for transfer.");
    }
    res.json({
      data: Blockchain.transferBlock(sender, recipient, amount, {
        sender_result: sender_amount - amount,
        recipient_result: recipient_amount + amount,
      }),
    });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

/**
 * Route handler for creating a new wallet.
 * @name POST/
 * @function
 * @memberof WalletRouter
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
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
