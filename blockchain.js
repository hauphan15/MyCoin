const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {

    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    //tính chuỗi hash
    calculateHash() {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
    }

    //ký vào chuỗi được hash từ thông tin giao dịch
    signTransaction(signingKey) {
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');

        this.signature = sig.toDER('hex');
    }

    //kiểm tra giao dịch có hợp lệ không
    isValid() {
        if (this.fromAddress === null) return true; //không có địa chỉ
        //không có chữ ký
        if (!this.signature || this.signature.length === 0) {
            throw new Error('Signature is not found in transaction');
        }

        //verify chữ ký
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {

    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    //tính chuỗi hash của block
    calculateHash() {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    //Đào coin với độ khó là difficulty
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block has been mined: ${this.hash}`);
    }

    //kiểm tra tính hợp lệ của giao dịch trong block
    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(Date.parse('2017-01-01'), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //Đào các giao dịch đã được thực hiện xong
    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction('MyCoin System', miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block has mined successfully !');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    //thêm giao dịch vào block
    addTransaction(transaction) {
        this.pendingTransactions.push(transaction);
        console.log('transaction added: %s', transaction);
    }

    //lấy số dư ví: truyền vào địa chỉ ví
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) { //duyệt các block trong blockchain
            for (const trans of block.transactions) { //duyệt các giao dịch trong mỗi block
                if (trans.fromAddress === address) { //kiểm tra nếu đúng địa chỉ gửi tiền thì trừ số tiền thực hiện giao dịch
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) { //kiểm tra nếu đúng địa chỉ nhận tiền thì thêm vào
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }


    //thống kê lại tất cả giao dịch của 1 ví
    getAllTransactionsForWallet(address) {
        const txs = [];

        for (const block of this.chain) { //duyệt block trong blockchain
            for (const tx of block.transactions) { //duyệt các transaction trong block

                //ghi lại các giao dịch gửi và nhận từ địa chỉ ví(address) 
                if (tx.fromAddress === address || tx.toAddress === address) {
                    txs.push(tx);
                }
            }
        }

        console.log('All transactions of the wallet: %s', txs.length);
        return txs;
    }

    //kiểm tra tính hợp lệ của blockchain
    isChainValid() {

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];

            if (!currentBlock.hasValidTransactions()) { //giao dịch mỗi block
                return false;
            }

            //kiểm tra chuỗi hash block hiện tại có khớp hay không
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;