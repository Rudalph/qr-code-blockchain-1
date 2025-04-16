import { NextResponse } from "next/server";
import Web3 from "web3";
import contractABI from "../../abi.json";

const RPC_URL = "https://sepolia.infura.io/v3/12fb888867724956b930449cf10fc4e8";  // Infura, Alchemy, or any Ethereum provider
const PRIVATE_KEY = "0x33b5deb26cc43522d0b3e040dd9a9050342017f4495f5a00c8b267962b97ff99";  // Private key of fixed MetaMask wallet
const CONTRACT_ADDRESS = "0xB8005CFb5e6Ff4A63a770699c5ED71C439066F61";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("I am body at bakend",body)
        const { product_name, batch_number, location, date, serial_number, price, weight, man_name, url, hashValue } = body;

        const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
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

        const gas = await tx.estimateGas({ from: account.address });
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();
        const txData = {
            from: account.address,
            to: CONTRACT_ADDRESS,
            gas,
            gasPrice,
            data
        };

        // Sign and send transaction
        const signedTx = await web3.eth.accounts.signTransaction(txData, PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return NextResponse.json({ success: true, txHash: receipt.transactionHash });
    } catch (error) {
        console.error("Blockchain transaction error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


// import { NextResponse } from "next/server";
// import Web3 from "web3";
// import contractABI from "../../abi.json";

// // Array of RPC URLs to cycle through
// const RPC_URLS = [
//   "https://sepolia.infura.io/v3/12fb888867724956b930449cf10fc4e8", // Infura
// //   "https://blue-dimensional-grass.zkevm-cardona.quiknode.pro/4dcd1a823d658f611ec1bf7d3aeaea5515584e15/",
//   "https://rpc.ankr.com/eth_sepolia/b07958a95bc376a0482bf33eec57f93fe14b5eeaf86e83752774276cac7d05b9",
// //   "https://eth-sepolia.g.alchemy.com/v2/your-api-key",            // Alchemy
// //   "https://sepolia.gateway.tenderly.co",                          // Tenderly
// //   "https://eth-sepolia-public.unifra.io",                         // Unifra
// //   "https://rpc.sepolia.org"                                       // Public Sepolia RPC
// ];

// // Track which RPC URL to use next
// let currentRpcIndex = 0;

// const PRIVATE_KEY = "0x33b5deb26cc43522d0b3e040dd9a9050342017f4495f5a00c8b267962b97ff99";
// const CONTRACT_ADDRESS = "0xB8005CFb5e6Ff4A63a770699c5ED71C439066F61";

// // Function to get the next RPC URL using round-robin
// function getNextRpcUrl() {
//   const url = RPC_URLS[currentRpcIndex];
  
//   // Increment the index and loop back to 0 if we've reached the end
//   currentRpcIndex = (currentRpcIndex + 1) % RPC_URLS.length;
  
//   console.log(`Using RPC URL: ${url} (index ${currentRpcIndex - 1 >= 0 ? currentRpcIndex - 1 : RPC_URLS.length - 1})`);
//   return url;
// }

// export async function POST(req) {
//     try {
//         const body = await req.json();
//         console.log("Request payload:", body);
//         const { product_name, batch_number, location, date, serial_number, price, weight, man_name, url, hashValue } = body;

//         // Get the next RPC URL from the round-robin algorithm
//         const rpcUrl = getNextRpcUrl();
        
//         // Create a new Web3 instance with the selected RPC URL
//         const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
//         const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
//         const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
//         web3.eth.accounts.wallet.add(account);

//         // Create transaction
//         const tx = contract.methods.addProduct(
//             product_name,
//             batch_number,
//             location,
//             date,
//             serial_number,
//             price,
//             weight,
//             man_name,
//             url,
//             hashValue
//         );

//         const gas = await tx.estimateGas({ from: account.address });
//         const gasPrice = await web3.eth.getGasPrice();
//         const data = tx.encodeABI();
//         const txData = {
//             from: account.address,
//             to: CONTRACT_ADDRESS,
//             gas,
//             gasPrice,
//             data
//         };

//         // Sign and send transaction
//         const signedTx = await web3.eth.accounts.signTransaction(txData, PRIVATE_KEY);
//         const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

//         return NextResponse.json({ 
//             success: true, 
//             txHash: receipt.transactionHash,
//             rpcUrl: rpcUrl  // Include which RPC URL was used for debugging
//         });
//     } catch (error) {
//         console.error(`Blockchain transaction error with RPC URL ${getNextRpcUrl()}: ${error}`);
//         return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }
// }