const Block = require("./block");
const Wallet = require("./wallet");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
    this.wallets = [Wallet.main()];
    this.rewardTransactions = [];
    this.balances = {};
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addWallet(names) {
    const wallet = new Wallet(names, 0, this.wallets.length - 1 + 1);
    this.wallets.push(wallet);
    return wallet;
  }

  addBlock(address) {
    const blockchain = this.wallets[0];
    if (!blockchain) {
      throw new Error("The Coin do not have been initialized correctly");
    }
    const wallet = this.wallets.find((wallet) => wallet.address === address);
    if (!wallet) {
      throw new Error(
        "This wallet does not exist or does not have permissions"
      );
    }

    const previousBlock = this.latestBlock();
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

    this.chain.push(block);
    this.rewardTransaction(block);
  }

  addTransferBlock(senderAddress, recipientAddress, amount, concept) {
    const recipient = this.wallets.find(
      ({ address }) => address === recipientAddress
    );
    if (!recipient) {
      throw new Error("The Coin do not have been initialized correctly");
    }

    const sender = this.wallets.find(
      ({ address }) => address === senderAddress
    );
    if (!sender.address) {
      throw new Error(
        "This wallet does not exist or does not have permissions"
      );
    }

    const previousBlock = this.latestBlock();
    const block = Block.mine(previousBlock, {
      sender: sender.address,
      recipient: recipient.address,
      concept,
      amount,
      timestamp: Date.now(),
    });

    this.chain.push(block);
    this.rewardTransactions.push(block.transaction);
  }

  rewardTransaction(block) {
    const {
      hash,
      timestamp,
      transaction: { miner, bank },
    } = block;

    this.rewardTransactions.push({
      hash,
      sender: null,
      recipient: miner.recipient,
      amount: miner.amount,
      timestamp,
      concept: "mining",
    });

    this.rewardTransactions.push({
      hash,
      sender: null,
      recipient: bank.recipient,
      amount: bank.amount,
      timestamp,
      concept: "mining",
    });
  }

  getBalanceCoinDo(address) {
    const wallet = this.wallets[0];
    if (!wallet) {
      throw new Error("The Coin do not have been initialized correctly");
    }
    wallet.balance = 0;
    wallet.credit = 0;
    wallet.debit = 0;

    for (const block of this.chain) {
      if (!block?.transaction) {
        continue;
      }
      const { transaction } = block;
      if (transaction.bank == address) {
        wallet.credit += transaction.bank.amount;
      } else if (transaction.sender === address) {
        wallet.debit -= transaction.amount;
      }
    }

    wallet.balance = wallet.credit - wallet.debit;
    this.wallets[id] = wallet;
    this.balances[wallet.address] = wallet.balance;
    return {
      balance: wallet.balance,
      credit: wallet.credit,
      debit: wallet.debit,
    };
  }

  getBalanceOfAddress(address) {
    const id = this.wallets.findIndex(({ address: dir }) => dir === address);
    if (id < 0) {
      throw new Error(
        "This wallet does not exist or does not have permissions"
      );
    }
    const wallet = this.wallets[id];
    wallet.balance = 0;
    wallet.credit = 0;
    wallet.debit = 0;

    for (const block of this.chain) {
      if (!block?.transaction) {
        continue;
      }
      const { transaction } = block;
      if (transaction.recipient && transaction.recipient == address) {
        wallet.credit += transaction.amount;
      } else if (transaction.sender && transaction.sender === address) {
        wallet.debit -= transaction.amount;
      }
    }

    wallet.balance = wallet.credit - wallet.debit;
    this.wallets[id] = wallet;
    this.balances[wallet.address] = wallet.balance;
    return {
      balance: wallet.balance,
      credit: wallet.credit,
      debit: wallet.debit,
    };
  }
}

module.exports = Blockchain;
