const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//tạo key
const key = ec.genKeyPair();
const privateKey = key.getPrivate('hex');

const myKey = ec.keyFromPrivate(privateKey);



//tạo public key đồng thời cũng là địa chỉ ví
const myWalletAddress = myKey.getPublic('hex');

// Tạo 1 instance của Blockchain class
const MyCoin = new Blockchain();



//tạo phiên giao dịch và ký bằng private key: truyền vào 2 địa chỉ gửi, địa chỉ nhận và tiền
const tx1 = new Transaction(myWalletAddress, '032132132156453545511545484132', 100);
tx1.signTransaction(myKey);
MyCoin.addTransaction(tx1);
// Bắt đầu đào MyCoin...
MyCoin.minePendingTransactions(myWalletAddress);



// Tạo phiên giao dịch thứ 2
const tx2 = new Transaction(myWalletAddress, '1544231540357514340553531875543517', 50);
tx2.signTransaction(myKey);
MyCoin.addTransaction(tx2);
// Đào
MyCoin.minePendingTransactions(myWalletAddress);



//in ra số dư tài khoản
console.log(`Balance: ${MyCoin.getBalanceOfAddress(myWalletAddress)}`);

//thống kê tất cả giao dịch
/**
 * Thông tin các giao dịch gồm: 
 * fromAddress: địa chỉ ví gửi tiền, nếu là MyCoin System thì là tiền thưởng hệ thống chuyển cho tài khoản người đào
 * toAddress: địa chỉ ví nhận tiền
 * amount: số tiền thực hiện trong giao diện
 * timestamp: thời gian thực hiện, định dạng Date.now()
 * signature: chữ ký trong giao dịch
 */
const trans = MyCoin.getAllTransactionsForWallet(myWalletAddress);
console.log(`All transactions: ${JSON.stringify(trans)}`);