"use client";

import { useEffect, useState } from 'react';
import { getProductDetails } from '@/app/lib/contract.js';
import { Copy, ExternalLink } from 'lucide-react';

export default function UploadQR() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadResult(null);
      setError(null);
      setProduct(null);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${field} copied!`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };

  const fetchProduct = async (identifier) => {
    try {
      if (!identifier) {
        throw new Error("No product identifier found");
      }

      console.log("Fetching product with identifier:", identifier);
      const productData = await getProductDetails(identifier);
      
      if (!productData) {
        throw new Error("No product data returned");
      }

      console.log("Received product data:", productData);
      setProduct(productData);
      setWalletConnected(true);
      setError(null);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message || "Failed to fetch product details");
      setProduct(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first!");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload_qr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUploadResult(data);

      if (data.formatted_string) {
        await fetchProduct(data.formatted_string);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload and scan QR code");
    } finally {
      setLoading(false);
    }
  };

  const TruncatedField = ({ label, value, copyable = true }) => {
    const isUrl = value.startsWith('http');
    const displayValue = value.length > 50 ? `${value.substring(0, 47)}...` : value;

    return (
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 flex-grow font-mono">{displayValue}</p>
          <div className="flex gap-2">
            {copyable && (
              <button
                onClick={() => copyToClipboard(value, label)}
                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={16} className="text-gray-600" />
              </button>
            )}
            {isUrl && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                title="Open link"
              >
                <ExternalLink size={16} className="text-gray-600" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProductDetails = ({ product }) => {
    if (!product) return null;

    const longFormFields = ['url', 'hashValue'];
    const standardFields = Object.keys(product).filter(key => !longFormFields.includes(key));
    
    return (
      <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Product Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {standardFields.map(key => (
            <div key={key} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-gray-600">{product[key].toString()}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {longFormFields.map(field => (
            product[field] && (
              <TruncatedField
                key={field}
                label={field.replace(/([A-Z])/g, ' $1').trim()}
                value={product[field]}
              />
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Product Verification</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload QR Code
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
          />
        </div>

        <button
          onClick={handleUpload}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !selectedFile}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Verify Product"
          )}
        </button>

        {copySuccess && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {copySuccess}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {uploadResult && !error && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Scan Results</h3>
            <TruncatedField label="Extracted URL" value={uploadResult.url} />
            <TruncatedField label="Formatted String" value={uploadResult.formatted_string} />
          </div>
        )}

        {product && <ProductDetails product={product} />}
      </div>
    </div>
  );
}