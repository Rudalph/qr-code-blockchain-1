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
