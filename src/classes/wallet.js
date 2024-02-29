const Block = require("./block");

class Wallet {
  constructor(names, amount, index) {
    this.address = Block.createHash(names, new Date().getTime(), index);
    this.names = names;
    this.balance = amount | 0; // Saldo inicial
    this.credit = 0;
    this.debit = 0;
  }

  static main() {
    return this("coin do", 100000000, 0);
  }
}

module.exports = Wallet;
