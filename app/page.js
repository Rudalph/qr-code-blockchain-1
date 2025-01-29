"use client"
import React, { useEffect, useState } from "react"
import Web3 from "web3";
import contractABI from "./abi.json";

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

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const contractInstance = new web3Instance.eth.Contract(
            contractABI,
            contractAddress
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      }
    };

    initializeWeb3();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const sendData = async (e) => {
    e.preventDefault();
    console.log("Form Data:", data);

    try {
      const response = await fetch('http://127.0.0.1:5000/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('API Response:', result);
      const qrCodeImage = result.qr_image;
      const productUrl = result.url;
      const productHash = result.hash_value;

      setQrCode(qrCodeImage);
      setUrl(productUrl);
      setHashValue(productHash);

      if (!window.ethereum) {
        alert("MetaMask is not installed");
        return;
      }

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const sender = accounts[0];

        const tx = await contract.methods.addProduct(
          data.product_name,
          data.batch_number,
          data.location,
          data.date,
          data.serial_number,
          data.price,
          data.weight,
          data.man_name,
          productUrl,
          productHash
        ).send({ from: sender });

        console.log("Transaction Hash:", tx.transactionHash);
        setTxHash(tx.transactionHash);
      } catch (error) {
        console.error("Error sending transaction:", error);
      }
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <>
      <div className="flex justify-center align-middle items-center gap-6 mt-20">
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

      <div className="flex justify-center align-middle items-center w-96 mx-[550px] mt-12 border border-green-600 bg-green-100 rounded-lg h-16">
        {!web3 ? <p>Web3 not initialized. Please connect your wallet.</p> : <p>Connected to Smart Contract</p>}
      </div>
    </>
  );
}