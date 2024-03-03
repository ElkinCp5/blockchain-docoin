const { networkInterfaces } = require("os");

const network = () => {
  const nets = networkInterfaces();
  const results = {};
  const netNames = Object.keys(nets);
  const netChild = (name) => nets[name];

  for (const name of netNames) {
    for (const net of netChild(name)) {
      const { family, internal } = net;
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      if (internal) continue;
      if (family !== "IPv4" && family !== 4) continue;
      if (results[name]) continue;
      results[name] = net.address;
    }
  }
  console.log({ network: results });
  return results;
};

module.exports = network;
