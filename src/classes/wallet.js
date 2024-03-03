const Block = require("./block");

class Wallet {
  constructor(names, amount) {
    this.address = Block.createHash(names, new Date().getTime());
    this.names = names;
    this.balance = amount | 0; // Saldo inicial
    this.credit = 0;
    this.debit = 0;
  }

  static main() {
    return {
      address: Block.createHash("coin do", new Date().getTime()),
      names: "coin do",
      balance: 100000000,
      credit: 0,
      debit: 0,
    };
  }
}

module.exports = Wallet;
