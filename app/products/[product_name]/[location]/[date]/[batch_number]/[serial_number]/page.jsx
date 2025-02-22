'use client';

import { useEffect, useState } from 'react';
import { getProductDetails } from '@/app/lib/contract.js';
import Image from 'next/image';
import { Analytics } from '@vercel/analytics/react';

import Location_Fetching from './Location_Fetching';


export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const identifier = `${params.product_name}_${params.serial_number}`;
        const productData = await getProductDetails(identifier);
        setProduct(productData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <div className="text-red-500 text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <div className="text-center">Product not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          {/* <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-evenly align-middle items-center">
            <h1 className="text-2xl font-bold text-white text-center">
              Product Details
              <Image src="/msb.jpg" height={100} width={100}/>
            </h1>
          </div> */}

<div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
      <div className="flex flex-row items-center justify-center gap-6">
        <h1 className="text-2xl font-bold text-white">
          Product Details
        </h1>
        <Image src="/msb.jpg" height={100} width={100}/>
        <Location_Fetching />
      </div>
    </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Blockchain Verified
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Verified
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info Items */}
              <InfoItem label="Product Name" value={product.productName} />
              <InfoItem label="Batch Number" value={product.batchNumber} />
              <InfoItem label="Location" value={product.location} />
              <InfoItem label="Date" value={product.date} />
              <InfoItem label="Serial Number" value={product.serialNumber} />
              <InfoItem label="Price" value={`${product.price} Rs`} />
              <InfoItem label="Weight" value={`${product.weight} kg`} />
              <InfoItem label="Manufacturer" value={product.manufacturerName} />
              
              {/* Full Width Items */}
              {/* <div className="col-span-full">
                <InfoItem 
                  label="URL" 
                  value={
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 break-all"
                    >
                      {product.url}
                    </a>
                  } 
                />
              </div> */}
              
              {/* <div className="col-span-full">
                <InfoItem 
                  label="Hash Value" 
                  value={
                    <span className="break-all">
                      {product.hashValue}
                    </span>
                  } 
                />
              </div> */}
            </div>
          </div>

          {/* Verification Status */}
          {/* <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Blockchain Verified
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Verified
              </span>
            </div>
          </div> */}
        </div>
      </div>
      <Analytics />
    </div>
    
  );
}

// Helper component for info items
function InfoItem({ label, value }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <div className="text-base text-gray-900">
        {value}
      </div>
    </div>
  );
}