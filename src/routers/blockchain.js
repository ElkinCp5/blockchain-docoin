const express = require("express");
const Blockchain = require("../classes/blockchain");
const Jwt = require("../classes/jwt");

const BlockchainRouter = express.Router();

/**
 * Route handler for getting all wallets.
 * @name GET/
 * @function
 * @memberof BlockchainRouter
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
BlockchainRouter.get("/", async function (req, res) {
  try {
    await Jwt.verify(req);
    res.json({ data: Blockchain.wallet().all() });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

/**
 * Route handler for getting blockchain balance.
 * @name GET/balance
 * @function
 * @memberof BlockchainRouter
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
BlockchainRouter.get("/balance", async function (req, res) {
  try {
    await Jwt.verify(req);
    const { address } = Blockchain.wallet().all()[0];
    res.json({
      data: Blockchain.wallet().balance(address),
    });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

/**
 * Route handler for transferring funds between wallets.
 * @name POST/transfer
 * @function
 * @memberof BlockchainRouter
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
BlockchainRouter.post("/transfer", async function (req, res) {
  try {
    await Jwt.verify(req);
    const { sender, recipient, amount: amount } = req.body;

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
 * Route handler for mining new blocks.
 * @name POST/mine
 * @function
 * @memberof BlockchainRouter
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
BlockchainRouter.post("/mine", async function (req, res) {
  try {
    const { address } = await Jwt.extract(req);
    res.json({ data: Blockchain.mineBlock(address) });
  } catch ({ message }) {
    res.json({ error: message }).status(500);
  }
});

module.exports = BlockchainRouter;
