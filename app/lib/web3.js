import Web3 from "web3";
import contractABI from "../abi.json";

const RPC_URL = "https://sepolia.infura.io/v3/12fb888867724956b930449cf10fc4e8";
const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));

const contract = new web3.eth.Contract(contractABI, "0xB8005CFb5e6Ff4A63a770699c5ED71C439066F61");

export { web3, contract };
