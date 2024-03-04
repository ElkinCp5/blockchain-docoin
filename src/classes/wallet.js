const Block = require("./block");

class Wallet {
  constructor(names, amount) {
    this.address = Block.createHash(names, new Date().getTime());
    this.names = names;
    this.balance = amount | 0; // Saldo inicial
  }

  static main() {
    return {
      address: Block.createHash("coin do", new Date().getTime()),
      names: "coin do",
      balance: 100000000,
    };
  }
}

module.exports = Wallet;
