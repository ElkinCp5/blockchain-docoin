const express = require("express");
const Blockchain = require("../classes/blockchain");

const BlockchainRouter = express.Router();

BlockchainRouter.get("/", function (req, res) {
  res.json({ data: Blockchain.wallet().all() });
});

BlockchainRouter.get("/balance", function (_, res) {
  res.json({ data: Blockchain.getBalanceCoinDo() });
});

BlockchainRouter.post("/mine", function (req, res) {
  const { address } = req.body;
  res.json({ data: Blockchain.mineBlock(address) });
});

BlockchainRouter.post("/", function (req, res) {
  const { names } = req.body;
  res.json({ data: Blockchain.wallet().add(names) });
});

module.exports = BlockchainRouter;
