const SHA256 = require("crypto-js/sha256");

const DIFFICULTY = 3;
const MINE_RATE = 3000;
const MINING_REWARD = 1;
const MINER_REWARD = 0.45;
const COINDO_REWARD = 0.55;

/**
 * Represents a block in a blockchain.
 */
class Block {
  /**
   * Creates a new block.
   * @param {number} timestamp - The timestamp of the block.
   * @param {string} previousHash - The hash of the previous block.
   * @param {string} hash - The hash of the current block.
   * @param {string} transaction - The transaction data of the block.
   * @param {number} nonce - The nonce value used in proof of work.
   * @param {number} difficulty - The difficulty level for mining.
   */
  constructor(timestamp, previousHash, hash, transaction, nonce, difficulty) {
    this.timestamp = timestamp;
    this.transaction = transaction;
    this.previousHash = previousHash;
    this.hash = hash;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  /**
   * Returns a string representation of the block.
   * @returns {string} The string representation of the block.
   */
  toString() {
    const { timestamp, previousHash, hash, transaction, nonce, difficulty } =
      this;
    return ` Block -
            timestamp: ${timestamp},
            previousHash: ${previousHash},
            hash: ${hash},
            transaction: ${transaction},
            nonce: ${nonce},
            difficulty: ${difficulty}
            --------------------------------------\n`;
  }

  /**
   * Creates the genesis block.
   * @returns {Block} The genesis block.
   */
  static genesis() {
    const timestamp = new Date().getTime();
    return new this(
      timestamp,
      undefined,
      "genesis hash",
      "Here we start the race towards the future",
      0,
      DIFFICULTY
    );
  }

  /**
   * Creates a hash based on the provided properties.
   * @param  {...any} props - The properties to include in the hash.
   * @returns {string} The hash generated from the properties.
   */
  static createHash(...props) {
    return SHA256(
      props.map((name) => JSON.stringify(name)).join("")
    ).toString();
  }

  /**
   * Mines a new block.
   * @param {Block} previousBlock - The previous block in the blockchain.
   * @param {string} transaction - The transaction data for the new block.
   * @returns {Block} The newly mined block.
   */
  static mine(previousBlock, transaction) {
    const { hash: previousHash } = previousBlock;
    let { difficulty } = previousBlock;
    let hash;
    let timestamp;
    let nonce = 0;

    do {
      timestamp = Date.now();
      nonce++;
      difficulty =
        previousBlock.timestamp + MINE_RATE > timestamp
          ? difficulty++
          : difficulty--;
      hash = Block.createHash(
        previousHash,
        timestamp,
        transaction,
        nonce,
        difficulty
      );
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    return new this(
      timestamp,
      previousHash,
      hash,
      transaction,
      nonce,
      difficulty
    );
  }

  /**
   * Calculates the mining reward.
   * @returns {number} The mining reward.
   */
  static miningReward() {
    return MINING_REWARD * MINER_REWARD;
  }

  /**
   * Calculates the coindo reward.
   * @returns {number} The coindo reward.
   */
  static coindoReward() {
    return MINING_REWARD * COINDO_REWARD;
  }
}

module.exports = Block;
