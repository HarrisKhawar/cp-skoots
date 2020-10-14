// Import SHA1 encryption for hashing
const sha1 = require('sha1');
// Import elliptic for Public Private Key Pair generation
const EC = require('elliptic').ec;
// Select secp256k1 as generation format
const ec = new EC('secp256k1');

/***** Transaction Class ******/
// @params {String} Sender's Wallet Address
// @params {String} Receiver's Wallet Address
// @params {Number} Transfer Amount
// Transactions are hashed with sha1 and
// included in the pendingTransactions array
// before being added to a block
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  // Return the hash of a transaction
  calculateHash() {
    return sha1(this.fromAddress + this.toAddress + this.amount).toString();
  }

  // @params {String} Private Key to Sign a Transaction
  // Sign a transaction with elliptic
  signTransaction(signingKey) {
    // if the respective Public Key of the given Private Key
    // does not match the fromAddress, throw error
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error("You cannot sign this transaction!")
    }
    // Hold the hash of the transaction
    const hashTx = this.calculateHash();
    // Sign the hash with base64
    const sig = signingKey.sign(hashTx, 'base64');
    // Store the signature to the transaction
    this.signature = sig.toDER('hex');
  }

  // Check if transaction is valid
  isValid() {
    // if the from Address is null, the transaction is a mining reward
    if (this.fromAddress === null) return true;
    // if there is a no signature or signature is empty, throw error
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }
    // Create a Public Key from the fromAddress
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    // Verify if the hash of the transaction is signed by its signature
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

/***** Block Class ******/
// @params {String} Block's creation date
// @params {Object} Block's data
// previousHash is assigned automatically when adding the Block
// for Genesis Block, previousHash remains empty
// nonce value is altered when mining a block
class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = "";
  }

  // Concatenate all properties of the Block
  // and return the hash generated with SHA-1
  calculateHash() {
    return sha1(this.index + this.timestamp + this.previousHash + this.nonce + JSON.stringify(this.transactions)).toString();
  }

  // Implement Proof of Work
  // increment nonce until the first {difficulty} numbers
  // of the calculated hash are all zeros
  // i.e. if difficulty is 3, calculate hash repeatedly by incrementing
  // nonce value everytime until the resulting hash starts with 3 zeroes
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    //Log resulting Hash Value
    console.log("Hash found: ", this.hash);
  }

  // Loop over all transactions and check if valid
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

/***** Blockchain Class ******/
// creates and adds genesis Block
// sets up a blockchain as an Array
// sets up pendingTransactions as an Array
// defines mining reward and mining difficulty
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  // Return genesis block with arbitrart values
  createGenesisBlock() {
    const genesisBlock = new Block('070712', "", "0");
    genesisBlock.hash = genesisBlock.calculateHash();
    return genesisBlock;
  }

  // Get block at the end index of the blockchain array
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Add all the transactions in the pendingTransactions Array
  // to the blockchain.
  minePendingTransactions(miningRewardAddress) {
    // Create a new Block with pending transactions
    let block = new Block(Date.now(), this.pendingTransactions);
    // Set the previousHash value of the block
    block.previousHash = this.getLatestBlock().hash;
    // Mine the block according to difficulty
    block.mineBlock(this.difficulty);
    // Log if/when the Block is mined
    console.log("Block Mined!");
    // Push the block onto the chain
    this.chain.push(block);
    // Clear the pendingTransactions Array and
    // add new transaction to reward the miner
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }

  // Push transaction to pendingTransactions Array
  addTransaction(transaction) {
    // Check if transaction has from and to address
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to addresses")
    }
    // Check if transaction is valid
    if (!transaction.isValid()) {
      throw new Error("Transaction is invalid");
    }
    // Push to pendingTransactions Array
    this.pendingTransactions.push(transaction);
  }

  // Loop over all transactions and calculate balance
  getBalanceOfAddress(address) {
    let balance = 0;
    // Loop over the chain
    for (const block of this.chain) {
      // Loop over a block
      for (const trans of block.transactions) {
        // if given address matches from address
        // deduct amount from balance
        if (trans.fromAddress === address) {
          console.log("Deduction:", trans.amount);
          balance -= trans.amount;
        }
        // if given address matches to address
        // add amount to balance
        if (trans.toAddress == address) {
          console.log("Addition:", trans.amount);
          balance += trans.amount;
        }
      }
    }
    return balance;
  }

  // Loop over all transactions and return specific transactions
  getTransactionHistory(address) {
    let transactionHistory = [];
    for ( const block of this.chain ) {
      for ( const trans of block.transactions ) {
        if ( trans.fromAddress === address || trans.toAddress === address ) {
          transactionHistory.push(trans);
        }
      }
    }
    return transactionHistory;
  }

  // Check if the chain is authentic
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      // check if all transactions in all blocks are valid
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
      // check if hash values of all blocks are correct
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      // check if previousHash value of each blocks is equal to
      // the hash value of the previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

// Export Blockchain and Transaction classes
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
