"use client"
import { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getApp, initializeApp } from 'firebase/app';



  const firebaseConfig = {
    apiKey: "AIzaSyCpxGN2fTUXjRAmehUEbHbSx2kq3q2unEg",
    authDomain: "qrcode-blockchain-e3dc7.firebaseapp.com",
    projectId: "qrcode-blockchain-e3dc7",
    storageBucket: "qrcode-blockchain-e3dc7.firebasestorage.app",
    messagingSenderId: "494436534708",
    appId: "1:494436534708:web:b776643e6eb9be8caf0ae1",
    measurementId: "G-MY5GLW817G"
  };


  
  const app = getApp.length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  

  
const Location_Fetching = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const fetchLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          try {
            await addDoc(collection(db, 'locations'), {
              latitude,
              longitude,
              timestamp: new Date(),
            });
            alert('Location saved successfully!');
          } catch (err) {
            setError('Failed to save location');
          }
        },
        (err) => setError(err.message)
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold">Share Your Location</h2>
      <p>Would you like to share your location?</p>
      <button onClick={fetchLocation} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        Yes, Share Location
      </button>
      {location && (
        <p className="mt-2">Latitude: {location.latitude}, Longitude: {location.longitude}</p>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default Location_Fetching