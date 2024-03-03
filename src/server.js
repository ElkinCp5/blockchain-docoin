const express = require("express");
const methodOverride = require("method-override");
const { Server } = require("socket.io");
const morgan = require("morgan");
const http = require("http");
const routes = require("./routers");
const Channel = require("./classes/channel");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(methodOverride("X-HTTP-Method")); //          Microsoft
app.use(methodOverride("X-HTTP-Method-Override")); // Google/GData
app.use(methodOverride("X-Method-Override")); //      IBM
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

// Set up Socket.IO
app.use((_req, _res, next) => {
  new Channel(io);
  console.log({ sokect: "INSERT X-Socket-IO-ID set!" });
  next();
});

// Disable ETag
app.disable("etag");

// Routes
app.use(
  "/api/v1",
  (_, res, next) => {
    res.setHeader("Last-Modified", new Date().toUTCString());
    next();
  },
  routes
);

module.exports = { io, server };
