import { NextResponse } from "next/server";
import Web3 from "web3";
import contractABI from "../../abi.json";

// Array of RPC URLs to cycle through
const RPC_URLS = [
  // "https://sepolia.infura.io/v3/12fb888867724956b930449cf10fc4e8", // Infura
  "https://rpc.ankr.com/eth_sepolia/b07958a95bc376a0482bf33eec57f93fe14b5eeaf86e83752774276cac7d05b9",
];

// Track which RPC URL to use next
let currentRpcIndex = 0;

const PRIVATE_KEY = "0x33b5deb26cc43522d0b3e040dd9a9050342017f4495f5a00c8b267962b97ff99";
const CONTRACT_ADDRESS = "0xB8005CFb5e6Ff4A63a770699c5ED71C439066F61";

// In-memory nonce tracker
let lastNonce = null;
let nonceInitialized = false;
const pendingNonces = new Set();

// Mutex for nonce management
const nonceMutex = {
  locked: false,
  queue: [],
  
  async lock() {
    if (!this.locked) {
      this.locked = true;
      return Promise.resolve();
    }
    
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  },
  
  unlock() {
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      nextResolve();
    } else {
      this.locked = false;
    }
  }
};

// Function to get the next RPC URL using round-robin
function getNextRpcUrl() {
  const url = RPC_URLS[currentRpcIndex];
  
  // Increment the index and loop back to 0 if we've reached the end
  currentRpcIndex = (currentRpcIndex + 1) % RPC_URLS.length;
  
  console.log(`Using RPC URL: ${url} (index ${currentRpcIndex - 1 >= 0 ? currentRpcIndex - 1 : RPC_URLS.length - 1})`);
  return url;
}

// Function to safely get the next nonce
async function getSafeNonce(web3, account) {
  // Acquire the mutex lock
  await nonceMutex.lock();
  
  try {
    // Initialize the nonce counter if not already done
    if (!nonceInitialized) {
      const currentNonce = await web3.eth.getTransactionCount(account.address, "pending");
      lastNonce = Number(currentNonce) - 1;
      nonceInitialized = true;
      console.log(`Initialized nonce counter to ${lastNonce} for account ${account.address}`);
    }
    
    // Find the next available nonce
    let nextNonce = lastNonce + 1;
    while (pendingNonces.has(nextNonce)) {
      nextNonce++;
    }
    
    // Update last nonce and mark this nonce as pending
    lastNonce = nextNonce;
    pendingNonces.add(nextNonce);
    
    console.log(`Assigned nonce ${nextNonce} for account ${account.address}`);
    return nextNonce;
  } finally {
    // Release the mutex lock
    nonceMutex.unlock();
  }
}

// Function to release a nonce after use (success or failure)
function releaseNonce(nonce) {
  pendingNonces.delete(nonce);
  console.log(`Released nonce ${nonce}`);
}

// Convert value to appropriate format for web3
function convertToWeb3Format(value) {
  if (typeof value === 'number') {
    // Convert number to string to avoid BigInt issues
    return value.toString();
  }
  return value;
}

export async function POST(req) {
    let assignedNonce = null;
    let txData = null;
    
    try {
        const body = await req.json();
        console.log("Request payload:", body);
        let { product_name, batch_number, location, date, serial_number, price, weight, man_name, url, hashValue } = body;
        
        // Convert numeric values to strings to avoid BigInt issues
        price = convertToWeb3Format(price);
        weight = convertToWeb3Format(weight);
        
        // Get the next RPC URL from the round-robin algorithm
        const rpcUrl = getNextRpcUrl();
        
        // Create a new Web3 instance with the selected RPC URL
        const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
        const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
        const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
        web3.eth.accounts.wallet.add(account);

        // Create transaction
        const tx = contract.methods.addProduct(
            product_name,
            batch_number,
            location,
            date,
            serial_number,
            price,
            weight,
            man_name,
            url,
            hashValue
        );

        // Get a safe nonce for this transaction
        assignedNonce = await getSafeNonce(web3, account);
        console.log(`Using nonce ${assignedNonce} for account ${account.address}`);

        // Get gas estimate and price - convert to strings to avoid BigInt issues
        const gas = await tx.estimateGas({ from: account.address });
        const gasPrice = await web3.eth.getGasPrice();
        
        const data = tx.encodeABI();
        txData = {
            from: account.address,
            to: CONTRACT_ADDRESS,
            gas: Web3.utils.toHex(gas),  // Convert to hex format
            gasPrice: Web3.utils.toHex(gasPrice),  // Convert to hex format
            nonce: Web3.utils.toHex(assignedNonce),  // Convert to hex format
            data
        };

        // Sign and send transaction
        const signedTx = await web3.eth.accounts.signTransaction(txData, PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        // Release the nonce after successful transaction
        releaseNonce(assignedNonce);
        
        return NextResponse.json({
            success: true,
            txHash: receipt.transactionHash,
            rpcUrl: rpcUrl,  // Include which RPC URL was used for debugging
            nonce: assignedNonce
        });
    } catch (error) {
        // If we have a nonce error, we should still release the nonce for retry
        if (assignedNonce !== null) {
            releaseNonce(assignedNonce);
        }
        
        console.error(`Blockchain transaction error with RPC URL ${getNextRpcUrl()}: ${error}`);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            details: error.stack,
        }, { status: 500 });
    }
}
