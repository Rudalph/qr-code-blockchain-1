"use client"
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const ProductTracker = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [productHistory, setProductHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Contract configuration
  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_productName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_currentLocation",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_currentDate",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_serialNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_uniqueIdentifier",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_verifierName",
          "type": "string"
        }
      ],
      "name": "addProductData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "productName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "currentLocation",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "currentDate",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "serialNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "uniqueIdentifier",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "verifierName",
          "type": "string"
        }
      ],
      "name": "ProductDataAdded",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "getAllUniqueIdentifiers",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_uniqueIdentifier",
          "type": "string"
        }
      ],
      "name": "getEntryCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_uniqueIdentifier",
          "type": "string"
        }
      ],
      "name": "getProductHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "productName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "currentLocation",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "currentDate",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "serialNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "uniqueIdentifier",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "verifierName",
              "type": "string"
            }
          ],
          "internalType": "struct ProductTracking.ProductData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  const contractAddress = "0x49e01702c9bC103EB6B1814A82a25E08A4B2645B";

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        
        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setContract(contractInstance);
      } catch (error) {
        setError("Failed to connect to wallet. Please ensure MetaMask is installed and unlocked.");
      }
    } else {
      setError("Please install MetaMask to use this application");
    }
  };

  const fetchProductHistory = async (e) => {
    e.preventDefault();
    if (!web3 || !contract || !account) {
      setError("Please connect your wallet first");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const history = await contract.methods.getProductHistory(uniqueId).call({ from: account });
      setProductHistory(history);
      console.log(history)
    } catch (err) {
      console.error(err);
      setError('Failed to fetch product history. Please verify the identifier and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Authentication Tracker</h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {account && (
            <div className="bg-blue-50 text-blue-600 p-4 rounded-lg mb-4">
              Connected Wallet: {account.substring(0, 6)}...{account.substring(38)}
            </div>
          )}
          
          <form onSubmit={fetchProductHistory} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter Unique Identifier"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                disabled={!web3 || !contract}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !uniqueId || !web3 || !contract}
            >
              {loading ? "Loading..." : "Track Product"}
            </button>
          </form>
        </div>

        {/* Product History Timeline */}
        {productHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Product Journey</h2>
            
            <div className="space-y-8">
              {productHistory.map((entry, index) => (
                <div key={index} className="relative pl-8 border-l-2 border-blue-500">
                  <div className="absolute left-0 top-0 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">{entry.productName}</h3>
                        <p className="text-gray-600">Location: {entry.currentLocation}</p>
                        <p className="text-gray-600">Date: {entry.currentDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Serial: {entry.serialNumber}</p>
                        <p className="text-gray-600">Verifier: {entry.verifierName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTracker;