// import Web3 from 'web3';


//Hardhat : 0x08B299Fc65373bFA2678727763f2D6d8aDc883e9
//Remix IDE Sepolia: 0xB8005CFb5e6Ff4A63a770699c5ED71C439066F61
// Replace with your contract address and ABI
const CONTRACT_ADDRESS = '0xB8005CFb5e6Ff4A63a770699c5ED71C439066F61'; // Your contract address
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "productName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "batchNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "date",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "serialNumber",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "weight",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "manufacturerName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "url",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "hashValue",
				"type": "string"
			}
		],
		"name": "addProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "identifier",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "productName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "serialNumber",
				"type": "string"
			}
		],
		"name": "ProductAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "identifier",
				"type": "string"
			}
		],
		"name": "getProduct",
		"outputs": [
			{
				"internalType": "string",
				"name": "productName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "batchNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "date",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "serialNumber",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "weight",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "manufacturerName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "url",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "hashValue",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// export const connectWallet = async () => {
//   if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
//     try {
//       // Request account access
//       await window.ethereum.request({ method: 'eth_requestAccounts' });
//       const web3 = new Web3(window.ethereum);
//       return web3;
//     } catch (error) {
//       throw new Error('Failed to connect wallet: ' + error.message);
//     }
//   } else {
//     throw new Error('Please install MetaMask!');
//   }
// };

// export const getProductDetails = async (identifier) => {
//   try {
//     const web3 = await connectWallet();
//     const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
//     const product = await contract.methods.getProduct(identifier).call();
    
//     return {
//       productName: product[0],
//       batchNumber: product[1],
//       location: product[2],
//       date: product[3],
//       serialNumber: product[4],
//       price: product[5],
//       weight: product[6],
//       manufacturerName: product[7],
//       url: product[8],
//       hashValue: product[9]
//     };
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     throw error;
//   }
// };




import Web3 from 'web3';

// const CONTRACT_ADDRESS = '0xB8005CFb5e6Ff4A63a770699c5ED71C439066F61';
// const CONTRACT_ABI = [.....];

// Fixed connection configuration
const INFURA_URL = 'https://sepolia.infura.io/v3/39715bab56e746109b70cff36598e0f2';
const PRIVATE_KEY = '33b5deb26cc43522d0b3e040dd9a9050342017f4495f5a00c8b267962b97ff99';

// Create a fixed web3 instance
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
const account = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// No need for connectWallet function anymore
export const getProductDetails = async (identifier) => {
  try {
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    const product = await contract.methods.getProduct(identifier).call({
      from: account.address
    });
    
    return {
      productName: product[0],
      batchNumber: product[1],
      location: product[2],
      date: product[3],
      serialNumber: product[4],
      price: product[5],
      weight: product[6],
      manufacturerName: product[7],
      url: product[8],
      hashValue: product[9]
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

