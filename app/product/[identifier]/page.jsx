"use client"; 
import { useEffect, useState } from "react";

export default function ProductDetails({ params }) {
    const { identifier } = params;  // Extract identifier from URL
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/product/${identifier}`);
                if (!response.ok) throw new Error("Failed to fetch product details");

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchProductDetails();
    }, [identifier]);

    if (error) return <p className="text-red-500">Error: {error}</p>;

    if (!product) return <p>Loading...</p>;

    return (
        <div className="p-6 border border-gray-300 rounded-lg shadow-md max-w-lg mx-auto my-10">
            <h1 className="text-2xl font-bold mb-4">Product Details</h1>
            <ul className="list-disc pl-5 space-y-2">
                {Object.entries(product).map(([key, value]) => (
                    <li key={key}>
                        <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: </strong> 
                        {value}
                    </li>
                ))}
            </ul>
        </div>
    );
}
