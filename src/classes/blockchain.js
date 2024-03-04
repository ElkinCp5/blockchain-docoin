const Block = require("./block");
const Wallet = require("./wallet");

const notExist = "This wallet does not exist or does not have permissions.";

class Blockchain {
  // Singleton instance of the Blockchain class
  static instance;
  // Array to store blockchain blocks
  static chain = [];
  // Array to store wallet information
  static wallets = [];
  // Array to store reward transactions
  static rewardTransactions = [];

  /**
   * Creates an instance of the Blockchain class.
   * Initializes the blockchain with a genesis block and a main wallet.
   */
  constructor() {
    if (!!Blockchain.instance) return Blockchain.instance;
    Blockchain.instance = this;

    // Create genesis block and main wallet
    Blockchain.chain.push(Block.genesis());
    Blockchain.wallets.push(Wallet.main());
  }

  /**
   * Returns the latest block in the blockchain.
   * @returns {Block} The latest block.
   */
  static latest_block() {
    return Blockchain.chain[Blockchain.chain.length - 1];
  }

  /**
   * Returns an object with wallet-related methods.
   * @returns {Object} Wallet methods.
   */
  static wallet() {
    return {
      all: function () {
        return [...Blockchain.wallets].map((w) => ({
          address: w.address,
          names: w.names,
        }));
      },
      find: (address) => {
        // Find wallet by address
        const id = Blockchain.wallets.findIndex(
          ({ address: dir }) => dir === address
        );
        if (id < 0) {
          throw new Error(notExist);
        }
        return Blockchain.wallets[id];
      },
      // Add a new wallet
      add: (names) => {
        if (!names || (names && !names.length)) {
          throw new Error("Invalid wallet!, parameter names is required");
        }
        // Create and add a new wallet
        const wallet = new Wallet(names, 0, Blockchain.wallets.length - 1 + 1);
        Blockchain.wallets.push(wallet);
        return wallet;
      },
      // Get balance for a wallet address
      balance: (address) => {
        // Find wallet by address
        const id = Blockchain.wallets.findIndex(
          ({ address: dir }) => dir === address
        );
        if (id < 0) {
          throw new Error(notExist);
        }
        // Calculate wallet balance, credit, and debit
        let credit = 0;
        let debit = 0;
        let transactions = [];

        for (const block of Blockchain.chain) {
          if (!block?.transaction) {
            continue;
          }
          const { transaction } = block;
          if (transaction) {
            const { recipient, miner, sender } = transaction;
            const { timestamp, concept, amount } = transaction;

            if (recipient && recipient == address) {
              credit += amount;
              transactions.push({ credit: amount, timestamp, concept });
            } else if (miner && miner?.recipient == address) {
              credit += miner.amount;
              transactions.push({ credit: miner.amount, timestamp, concept });
            } else if (sender && sender === address) {
              debit += amount;
              transactions.push({ debit: amount, timestamp, concept });
            }
          }
        }

        Blockchain.wallets[id].balance = credit - debit;
        return {
          balance: Blockchain.wallets[id].balance,
          transactions,
        };
      },
    };
  }

  /**
   * Mines a new block for the specified address.
   * @param {string} address - The wallet address of the miner.
   * @returns {Block} The newly mined block.
   */
  static mineBlock(address) {
    // Get main blockchain wallet
    const blockchain = Blockchain.wallets[0];
    if (!blockchain) {
      throw new Error("The Coin do not have been initialized correctly");
    }
    // Find wallet by address
    const wallet = Blockchain.wallets.find(
      (wallet) => wallet.address === address
    );
    if (!wallet) {
      throw new Error(notExist);
    }

    // Mine new block
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

  /**
   * Creates and mines a transfer block between two addresses.
   * @param {string} senderAddress - The wallet address of the sender.
   * @param {string} recipientAddress - The wallet address of the recipient.
   * @param {number} amount - The amount to transfer.
   * @param {string} concept - The concept of the transfer.
   * @returns {Block} The newly mined transfer block.
   */
  static transferBlock(senderAddress, recipientAddress, amount, concept) {
    const previousBlock = Blockchain.latest_block();
    const block = Block.mine(previousBlock, {
      sender: senderAddress,
      recipient: recipientAddress,
      amount,
      other: concept,
      timestamp: Date.now(),
      concept: "transfer",
    });

    Blockchain.chain.push(block);
    // Add transaction
    Blockchain.rewardTransactions.push({
      hash: block.hash,
      ...block.transaction,
    });
    return block;
  }

  /**
   * Adds reward transactions for mining to the rewardTransactions array.
   * @param {Block} block - The block containing the reward transactions.
   */
  static rewardTransaction(block) {
    const {
      hash,
      timestamp,
      transaction: { miner, bank },
    } = block;

    // Add miner reward transaction
    Blockchain.rewardTransactions.push({
      hash,
      sender: null,
      recipient: miner.recipient,
      amount: miner.amount,
      timestamp,
      concept: "mining",
    });

    // Add bank reward transaction
    Blockchain.rewardTransactions.push({
      hash,
      sender: null,
      recipient: bank.recipient,
      amount: bank.amount,
      timestamp,
      concept: "mining",
    });
  }
}

module.exports = Blockchain;
