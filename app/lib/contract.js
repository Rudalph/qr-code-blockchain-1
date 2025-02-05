import Web3 from 'web3';

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

// export const getProductDetails = async (identifier, web3) => {
//   try {
//     // const web3 = await connectWallet();
//     const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
//     const product = await contract.methods.getProduct(identifier).call({ from: web3.eth.defaultAccount });
    
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

// Initialize Web3 with your RPC URL
const web3 = new Web3(process.env.NEXT_PUBLIC_RPC_URL);

// Initialize the fixed wallet
const initializeWallet = () => {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(
      process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
    return web3;
  } catch (error) {
    console.error('Failed to initialize wallet:', error);
    throw error;
  }
};

export const getProductDetails = async (identifier) => {
  try {
    // Initialize web3 with the fixed wallet
    const web3Instance = initializeWallet();
    
    const contract = new web3Instance.eth.Contract(
      CONTRACT_ABI, 
      CONTRACT_ADDRESS
    );
    
    const product = await contract.methods.getProduct(identifier).call({
      from: web3Instance.eth.defaultAccount
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