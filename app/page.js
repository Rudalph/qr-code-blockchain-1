"use client"
import React, { useEffect, useState } from "react"
import Web3 from "web3";
import contractABI from "./abi.json";
import Link from "next/link";


// Remove the top-level Web3 initialization
const contractAddress = "0xB8005CFb5e6Ff4A63a770699c5ED71C439066F61";

export default function Home() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [data, setData] = useState({
    product_name: '',
    batch_number: '',
    location: '',
    date: '',
    serial_number: '',
    price: '',
    weight: '',
    man_name: ''
  });

  const [qrCode, setQrCode] = useState(null);
  const [url, setUrl] = useState(null);
  const [hashValue, setHashValue] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // useEffect(() => {
  //   const initializeWeb3 = async () => {
  //     if (typeof window !== "undefined" && window.ethereum) {
  //       try {
  //         const web3Instance = new Web3(window.ethereum);
  //         setWeb3(web3Instance);

  //         const contractInstance = new web3Instance.eth.Contract(
  //           contractABI,
  //           contractAddress
  //         );
  //         setContract(contractInstance);
  //       } catch (error) {
  //         console.error("Error initializing Web3:", error);
  //       }
  //     }
  //   };

  //   initializeWeb3();
  // }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // const sendData = async (e) => {
  //   e.preventDefault();
  //   console.log("Form Data:", data);

  //   try {
  //     // https://qr-code-blockchain-1d-backend.onrender.com/qrcode
  //     const response = await fetch('https://qr-code-blockchain-1d-backend.onrender.com/qrcode', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(data)
  //     });

  //     const result = await response.json();
  //     console.log('API Response:', result);
  //     const qrCodeImage = result.qr_image;
  //     const productUrl = result.url;
  //     const productHash = result.hash_value;

  //     setQrCode(qrCodeImage);
  //     setUrl(productUrl);
  //     setHashValue(productHash);

  //     // if (!window.ethereum) {
  //     //   alert("MetaMask is not installed");
  //     //   return;
  //     // }

  //     // try {
  //     //   await window.ethereum.request({ method: "eth_requestAccounts" });
  //     //   const accounts = await web3.eth.getAccounts();
  //     //   const sender = accounts[0];

  //     //   const tx = await contract.methods.addProduct(
  //     //     data.product_name,
  //     //     data.batch_number,
  //     //     data.location,
  //     //     data.date,
  //     //     data.serial_number,
  //     //     data.price,
  //     //     data.weight,
  //     //     data.man_name,
  //     //     productUrl,
  //     //     productHash
  //     //   ).send({ from: sender });

  //     //   console.log("Transaction Hash:", tx.transactionHash);
  //     //   setTxHash(tx.transactionHash);
  //     // } catch (error) {
  //     //   console.error("Error sending transaction:", error);
  //     // }

  //     try {
  //       console.log("I am data at frontend:",data)
  //       const response = await fetch('/api/contract_api', {
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({
  //             ...data,
  //             url:productUrl,
  //             hashValue:productHash

  //           })
  //       });

  //       const result = await response.json();
  //       if (result.success) {
  //           setTxHash(result.txHash);
  //           alert(`Transaction Successful: ${result.txHash}`);
  //       } else {
  //           alert(`Transaction Failed: ${result.error}`);
  //       }
  //   } catch (error) {
  //       console.error('Error:', error);
  //       alert("Error submitting transaction.");
  //   } 
  //   } catch (error) {
  //     console.error('Error sending data:', error);
  //   }
  // };


  const sendData = async (e) => {
    e.preventDefault();
    console.log("Form Data:", data);
  
    try {
      // First API call to generate QR code
      const qrResponse = await fetch('https://qr-code-blockchain-1d-backend.onrender.com/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!qrResponse.ok) {
        throw new Error(`QR code API error: ${qrResponse.status} ${qrResponse.statusText}`);
      }
  
      const qrResult = await qrResponse.json();
      console.log('QR API Response:', qrResult);
      
      // Extract and set QR code data
      const qrCodeImage = qrResult.qr_image;
      const productUrl = qrResult.url;
      const productHash = qrResult.hash_value;
  
      setQrCode(qrCodeImage);
      setUrl(productUrl);
      setHashValue(productHash);
  
      // Second API call to handle contract interaction
      const contractResponse = await fetch('/api/contract_api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          url: productUrl,
          hashValue: productHash
        })
      });
  
      if (!contractResponse.ok) {
        throw new Error(`Contract API error: ${contractResponse.status} ${contractResponse.statusText}`);
      }
  
      const contractResult = await contractResponse.json();
      
      if (contractResult.success) {
        setTxHash(contractResult.txHash);
        alert(`Transaction Successful: ${contractResult.txHash}`);
      } else {
        // This handles when the API returns success:false rather than throwing an error
        throw new Error(contractResult.error || 'Transaction failed without specific error');
      }
      
    } catch (error) {
      // Unified error handling
      console.error('Error in transaction process:', error);
      alert(`Transaction Error: ${error.message || 'Unknown error occurred'}`);
    }
  };

  
  return (
    <>
      <div className="flex justify-center align-middle items-center gap-6 mt-10">
        {/** Product Form */}
        <div className="max-w-lg w-1/2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-full">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Product Details</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "product_name", label: "Product Name" },
                { name: "batch_number", label: "Batch Number" },
                { name: "location", label: "Location" },
                { name: "date", label: "Date", type: "date" },
                { name: "serial_number", label: "Serial Number" },
                { name: "price", label: "Price", type: "number" },
                { name: "weight", label: "Weight (kg)", type: "number" },
                { name: "man_name", label: "Manufacturer Name" },
              ].map(({ name, label, type = "text" }) => (
                <div key={name}>
                  <label className="block text-gray-600 font-medium mb-1" htmlFor={name}>{label}</label>
                  <input
                    type={type}
                    id={name}
                    name={name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              onClick={sendData}
            >
              Submit
            </button>
          </form>
        </div>

        {/** QR Code Display */}
        <div className="max-w-4xl w-1/2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col items-center">
          <div className="w-full h-80 rounded-lg flex items-center justify-center text-gray-500 text-lg">
            {qrCode ? (
              <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-full h-full object-contain" />
            ) : (
              'QR Code Image'
            )}
          </div>
          <div className="mt-4 space-y-2 w-full">
            <p className="text-gray-700 font-medium">URL: {url ? <span className="text-gray-500">{url}</span> : <span className="text-gray-500">URL will be displayed here</span>}</p>
            <p className="text-gray-700 font-medium">HASH: {hashValue ? <span className="text-gray-500">{hashValue}</span> : <span className="text-gray-500">Hash of data will be displayed here</span>}</p>
            <p className="text-gray-700 font-medium">Transaction Hash: {txHash ? <span className="text-gray-500">{txHash}</span> : <span className="text-gray-500">Transaction hash will be displayed here</span>}</p>
          </div>
        </div>
      </div>

      {/* <div className="flex justify-center align-middle items-center w-96 mx-[550px] mt-12 border border-green-600 bg-green-100 rounded-lg h-16">
        {!web3 ? <p>Web3 not initialized. Please connect your wallet.</p> : <p>Connected to Smart Contract</p>}
      </div> */}

      <Link href="/validation">
      <div className="flex justify-center align-middle items-center w-96 mx-[550px] mt-5 border border-blue-600 bg-[#A0C3FF] rounded-lg h-16">
          <p>Validate Product</p>
      </div>
      </Link>
    </>
  );
}