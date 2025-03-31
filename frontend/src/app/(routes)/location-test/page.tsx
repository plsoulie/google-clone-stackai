'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LocationTest() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [coords, setCoords] = useState<{latitude: number; longitude: number} | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Check if API key is present
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      setApiKeyStatus(`API Key found: ${apiKey.substring(0, 10)}...`);
    } else {
      setApiKeyStatus('API Key not found in environment variables');
    }

    // Get current position
    setStatus('Getting geolocation...');
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setStatus('Geolocation received. Performing reverse geocoding...');

        try {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            throw new Error('Google Maps API key not found');
          }

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=locality|administrative_area_level_1|country&key=${apiKey}`
          );

          if (!response.ok) {
            throw new Error(`Geocoding API returned ${response.status}`);
          }

          const data = await response.json();
          console.log('Geocoding response:', data);

          if (data.status !== 'OK') {
            throw new Error(`Geocoding error: ${data.status}`);
          }

          if (data.results && data.results.length > 0) {
            const formattedLocation = data.results[0].formatted_address;
            setLocation(formattedLocation);
            setStatus('Success! Location detected.');
          } else {
            throw new Error('No location results found');
          }
        } catch (err) {
          console.error('Error in reverse geocoding:', err);
          setError(err instanceof Error ? err.message : String(err));
          setStatus('Error occurred during reverse geocoding');
        }
      },
      (err) => {
        console.error('Error getting location:', err);
        setError(err.message);
        setStatus('Failed to get geolocation');
      },
      {
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: false
      }
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Location Retrieval Test</h1>
      
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">API Key Status</h2>
        <p className={`${apiKeyStatus.includes('not found') ? 'text-red-500' : 'text-green-600'}`}>
          {apiKeyStatus}
        </p>
      </div>

      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Test Status</h2>
        <p className="mb-2">{status}</p>
        {error && (
          <p className="text-red-500 mt-2">
            Error: {error}
          </p>
        )}
      </div>

      {coords && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Coordinates</h2>
          <p>Latitude: {coords.latitude}</p>
          <p>Longitude: {coords.longitude}</p>
        </div>
      )}

      {location && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Detected Location</h2>
          <p className="text-green-600 font-medium">{location}</p>
        </div>
      )}

      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Implementation Notes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>This test shows if the Google Maps Geocoding API is working correctly.</li>
          <li>The location is detected using browser geolocation + reverse geocoding.</li>
          <li>This process is the same as what's used in the search functionality.</li>
          <li>If successful, local search results will be personalized to your location.</li>
        </ul>
      </div>

      <div className="mt-8">
        <Link 
          href="/"
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
} 