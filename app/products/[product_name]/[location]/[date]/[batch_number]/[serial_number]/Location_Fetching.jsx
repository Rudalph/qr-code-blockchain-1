"use client"
import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';



  const firebaseConfig = {
    apiKey: "AIzaSyCpxGN2fTUXjRAmehUEbHbSx2kq3q2unEg",
    authDomain: "qrcode-blockchain-e3dc7.firebaseapp.com",
    projectId: "qrcode-blockchain-e3dc7",
    storageBucket: "qrcode-blockchain-e3dc7.firebasestorage.app",
    messagingSenderId: "494436534708",
    appId: "1:494436534708:web:b776643e6eb9be8caf0ae1",
    measurementId: "G-MY5GLW817G"
  };


  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  

  
const Location_Fetching = () => {
    const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  const getLocationAndStore = async () => {
    try {
      setStatus('Fetching location...');
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      setStatus('Storing location...');
      
      // Store in Firebase
      await addDoc(collection(db, 'userLocations'), {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      setStatus('Location stored successfully!');
    } catch (err) {
      if (err.code === 1) {
        setError('Location permission denied');
      } else {
        setError('Error getting location: ' + err.message);
      }
    }
  };

  const handleLocationPrompt = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    getLocationAndStore();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Share Your Location</h2>
      
      <button
        onClick={handleLocationPrompt}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Share Location
      </button>

      {status && (
        <p className="mt-4 text-green-600">{status}</p>
      )}

      {error && (
        <p className="mt-4 text-red-600">{error}</p>
      )}
    </div>
  );
}

export default Location_Fetching