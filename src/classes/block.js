const SHA256 = require("crypto-js/sha256");

const DIFFICULTY = 3;
const MINE_RATE = 3000;
const MINING_REWARD = 1;
const MINER_REWARD = 0.45;
const COINDO_REWARD = 0.55;

class Block {
  constructor(timestamp, previousHash, hash, transaction, nonce, difficulty) {
    this.timestamp = timestamp;
    this.transaction = transaction;
    this.previousHash = previousHash;
    this.hash = hash; // Calcular el hash del bloque actual
    this.nonce = nonce; // Para la prueba de trabajo
    this.difficulty = difficulty; // Para la prueba de trabajo
  }

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

  static createHash(...props) {
    return SHA256(
      props.map((name) => JSON.stringify(name)).join("")
    ).toString();
  }

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

  static miningReward() {
    return MINING_REWARD * MINER_REWARD;
  }

  static coindoReward() {
    return MINING_REWARD * COINDO_REWARD;
  }
}

module.exports = Block;
