const Block = require("./block");
const Wallet = require("./wallet");

class Blockchain {
  static instance;
  static chain = [];
  static wallets = [];
  static rewardTransactions = [];
  static balances = {};

  constructor() {
    if (!!Blockchain.instance) return Blockchain.instance;
    Blockchain.instance = this;

    Blockchain.chain.push(Block.genesis());
    Blockchain.wallets.push(Wallet.main());
  }

  static latest_block() {
    return Blockchain.chain[Blockchain.chain.length - 1];
  }

  static wallet() {
    return {
      all: () => {
        return Blockchain.wallets;
      },
      find: (address) => {
        const id = Blockchain.wallets.findIndex(
          ({ address: dir }) => dir === address
        );
        if (id < 0) {
          throw new Error(
            "This wallet does not exist or does not have permissions"
          );
        }
        return Blockchain.wallets[id];
      },
      add: (names) => {
        if (!names || (names && !names.length)) {
          throw new Error("Invalid wallet!, parameter names is required");
        }
        const wallet = new Wallet(names, 0, Blockchain.wallets.length - 1 + 1);
        Blockchain.wallets.push(wallet);
        return wallet;
      },
      balance: (address) => {
        const id = Blockchain.wallets.findIndex(
          ({ address: dir }) => dir === address
        );
        if (id < 0) {
          throw new Error(
            "This wallet does not exist or does not have permissions"
          );
        }
        const wallet = Blockchain.wallets[id];
        wallet.balance = 0;
        wallet.credit = 0;
        wallet.debit = 0;

        for (const block of Blockchain.chain) {
          if (!block?.transaction) {
            continue;
          }
          const { transaction } = block;
          if (transaction) {
            const { recipient, miner, sender, amount } = transaction;
            if (recipient && recipient == address) {
              wallet.credit += amount;
            } else if (miner && miner?.recipient == address) {
              wallet.credit += miner.amount;
            } else if (sender && sender === address) {
              wallet.debit += amount;
            }
          }
        }

        wallet.balance = wallet.credit - wallet.debit;
        Blockchain.wallets[id] = wallet;
        Blockchain.balances[wallet.address] = wallet.balance;
        return {
          balance: wallet.balance,
          credit: wallet.credit,
          debit: wallet.debit,
        };
      },
    };
  }

  static mineBlock(address) {
    const blockchain = Blockchain.wallets[0];
    if (!blockchain) {
      throw new Error("The Coin do not have been initialized correctly");
    }
    const wallet = Blockchain.wallets.find(
      (wallet) => wallet.address === address
    );
    if (!wallet) {
      throw new Error(
        "This wallet does not exist or does not have permissions"
      );
    }

    const previousBlock = Blockchain.latest_block();
    const block = Block.mine(previousBlock, {
      miner: {
        recipient: wallet.address,
        amount: Block.miningReward(), // 25% para el minero
      },
      bank: {
        recipient: blockchain.address,
        amount: Block.coindoReward(),
      },
      timestamp: Date.now(),
      concept: "mining",
    });

    Blockchain.chain.push(block);
    Blockchain.rewardTransaction(block);
    return block;
  }

  static transferBlock(sender, recipient, amount, other) {
    const previousBlock = Blockchain.latest_block();
    const block = Block.mine(previousBlock, {
      sender,
      recipient,
      amount,
      other,
      timestamp: Date.now(),
      concept: "transfer",
    });

    Blockchain.chain.push(block);
    Blockchain.rewardTransactions.push({
      hash: block.hash,
      ...block.transaction,
    });
    return block;
  }

  static rewardTransaction(block) {
    const {
      hash,
      timestamp,
      transaction: { miner, bank },
    } = block;

    Blockchain.rewardTransactions.push({
      hash,
      sender: null,
      recipient: miner.recipient,
      amount: miner.amount,
      timestamp,
      concept: "mining",
    });

    Blockchain.rewardTransactions.push({
      hash,
      sender: null,
      recipient: bank.recipient,
      amount: bank.amount,
      timestamp,
      concept: "mining",
    });
  }

  static getBalanceCoinDo() {
    const wallet = Blockchain.wallets[0];
    if (!wallet) {
      throw new Error("The Coin do not have been initialized correctly");
    }
    wallet.balance = 0;
    wallet.credit = 0;
    wallet.debit = 0;

    for (const block of Blockchain.chain) {
      if (!block?.transaction) {
        continue;
      }
      const { transaction } = block;
      if (transaction.bank == wallet.address) {
        wallet.credit += transaction.bank.amount;
      } else if (transaction.sender === wallet.address) {
        wallet.debit += transaction.amount;
      }
    }

    wallet.balance = wallet.credit - wallet.debit;
    Blockchain.wallets[id] = wallet;
    Blockchain.balances[wallet.address] = wallet.balance;
    return {
      balance: wallet.balance,
      credit: wallet.credit,
      debit: wallet.debit,
    };
  }

  addTransferBlock(senderAddress, recipientAddress, amount, concept) {
    const recipient = Blockchain.wallets.find(
      ({ address }) => address === recipientAddress
    );
    if (!recipient) {
      throw new Error("The Coin do not have been initialized correctly");
    }

    const sender = Blockchain.wallets.find(
      ({ address }) => address === senderAddress
    );
    if (!sender.address) {
      throw new Error(
        "This wallet does not exist or does not have permissions"
      );
    }

    const previousBlock = Blockchain.latest_block();
    const block = Block.mine(previousBlock, {
      sender: sender.address,
      recipient: recipient.address,
      concept,
      amount,
      timestamp: Date.now(),
    });

    Blockchain.chain.push(block);
    Blockchain.rewardTransactions.push(block.transaction);
  }
}

module.exports = Blockchain;
