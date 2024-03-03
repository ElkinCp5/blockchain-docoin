const express = require("express");
const AuthRouter = require("./auth");
const WalletRouter = require("./wallet");
const BlockchainRouter = require("./blockchain");

const Routes = express.Router();

Routes.use("/auth/", AuthRouter);
Routes.use("/wallets/", WalletRouter);
Routes.use("/blockchain/", BlockchainRouter);

module.exports = Routes;
