const express = require("express");
const AuthRouter = require("./auth");
const WalletRouter = require("./wallet");
const BlockchainRouter = require("./blockchain");

/**
 * Router for defining API routes.
 * @type {express.Router}
 */
const Routes = express.Router();

// Middleware for handling authentication routes
Routes.use("/auth/", AuthRouter);

// Middleware for handling wallet-related routes
Routes.use("/wallets/", WalletRouter);

// Middleware for handling blockchain-related routes
Routes.use("/blockchain/", BlockchainRouter);

module.exports = Routes;
