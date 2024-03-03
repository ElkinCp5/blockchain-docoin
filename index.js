const Blockchain = require("./src/classes/blockchain");
const Jwt = require("./src/classes/jwt");
new Blockchain();
new Jwt();

const { server: Server, io: Socket } = require("./src/server");
const network = require("./src/network");

const NETWORK_NAME = process.env?.NETWORK_NAME || "Wi-Fi";
const NETWORK_IP = network()[NETWORK_NAME] || "localhost";
const PORT = process.env?.PORT || 300;

// START SERVER
Server.listen(PORT, NETWORK_IP, () => {
  // START CLIENT SOCKET
  Socket.on("connection", (client) => {
    const socketId = client.id;
    client.on("start", async (email) => {
      console.log({ onClient: socketId, email });
    });
    client.on("disconnect", async () => {});
  });
  // PRIN PATH SERVER API DOCS
  console.warn(`Api docs: http://${NETWORK_IP}:${PORT}/api/docs`);
  console.warn(`Server running on: http://${NETWORK_IP}:${PORT}/api/v1`);
});
