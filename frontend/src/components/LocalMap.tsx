'use client';

import React, { useState, useEffect, useRef } from "react";
import { MapPin, ExternalLink, Star } from "lucide-react";

interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviews?: number;
  type?: string;
  features?: string[];
  image?: string;
  website?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocalMapProps {
  places: Place[];
  title: string;
}

declare global {
  interface Window {
    google: any;
    googleMapsLoaded: boolean;
    googleMapsLoadPromise: Promise<void>;
  }
}

const LocalMap: React.FC<LocalMapProps> = ({ places, title }) => {
  const [failedImages, setFailedImages] = useState<{[key: string]: boolean}>({});
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Add debug logging
      console.log('Places data:', places);
      
      // If already loaded, initialize map
      if (window.googleMapsLoaded && window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // If already loading, wait for it and initialize
      if (window.googleMapsLoadPromise) {
        await window.googleMapsLoadPromise;
        initializeMap();
        return;
      }

      // Create new loading promise
      window.googleMapsLoadPromise = new Promise((resolve, reject) => {
        // Check if script is already in the document
        if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
          window.googleMapsLoaded = true;
          resolve();
          return;
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          window.googleMapsLoaded = true;
          resolve();
        };

        script.onerror = (error) => {
          console.error('Error loading Google Maps:', error);
          reject(error);
        };

        document.head.appendChild(script);
      });

      try {
        await window.googleMapsLoadPromise;
        initializeMap();
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="absolute inset-0 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <p>Unable to load Google Maps</p>
                <p class="text-sm mt-1">Please check your ad blocker settings</p>
              </div>
            </div>
          `;
        }
      }
    };

    const initializeMap = () => {
      console.log('Initializing map...');
      console.log('Map ref:', mapRef.current);
      console.log('Google maps loaded:', window.google?.maps);
      
      if (!mapRef.current || !places.length || !window.google?.maps) {
        console.log('Missing required dependencies for map initialization');
        return;
      }

      // Default to Berkeley coordinates if no places have coordinates
      const defaultCenter = { lat: 37.8715, lng: -122.2730 };
      
      let center = defaultCenter;
      if (places[0]?.gps_coordinates) {
        center = {
          lat: places[0].gps_coordinates.latitude,
          lng: places[0].gps_coordinates.longitude
        };
      }

      const mapOptions = {
        center,
        zoom: 14,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
        disableDefaultUI: false, // Enable default UI for testing
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true
      };

      try {
        console.log('Creating map with options:', mapOptions);
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
        
        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add markers for all places
        places.forEach(place => {
          if (place.gps_coordinates) {
            try {
              // Try to create an advanced marker first
              const markerView = new window.google.maps.marker.PinView({
                background: "#4285F4",
                borderColor: "#ffffff",
                glyphColor: "#ffffff",
                scale: 1.2,
              });

              const marker = new window.google.maps.marker.AdvancedMarkerElement({
                map: mapInstanceRef.current,
                position: { 
                  lat: place.gps_coordinates.latitude, 
                  lng: place.gps_coordinates.longitude 
                },
                title: place.name,
                content: markerView.element,
              });

              marker.addListener('click', () => {
                const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
                window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank', 'noopener,noreferrer');
              });

              markersRef.current.push(marker);
            } catch (markerError) {
              console.warn('Falling back to basic marker:', markerError);
              // Fallback to basic marker
              const marker = new window.google.maps.Marker({
                position: { 
                  lat: place.gps_coordinates.latitude, 
                  lng: place.gps_coordinates.longitude 
                },
                map: mapInstanceRef.current,
                title: place.name,
                animation: window.google.maps.Animation.DROP
              });

              marker.addListener('click', () => {
                const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
                window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank', 'noopener,noreferrer');
              });

              markersRef.current.push(marker);
            }
          }
        });
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="absolute inset-0 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <p>Error loading map</p>
                <p class="text-sm mt-1">Please try refreshing the page</p>
              </div>
            </div>
          `;
        }
      }
    };

    loadGoogleMaps();

    return () => {
      // Cleanup markers and map instance
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [places]);

  const handleImageError = (id: string, name: string, url: string) => {
    console.error(`Image load error for ${name}:`, url);
    setFailedImages(prev => ({...prev, [id]: true}));
  };
  
  const getDefaultImage = (name: string) => {
    // Return a default image based on business name
    const normalizedName = name.toLowerCase();
    if (normalizedName.includes('starbucks')) {
      return "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png";
    } else if (normalizedName.includes('houndstooth')) {
      return "https://images.squarespace-cdn.com/content/v1/5b69adef7106992a45ce2bfb/1604615229582-YI4V6T80V33DHPZPPVHH/houndstoothlogo.png";
    } else if (normalizedName.includes('lucky') && normalizedName.includes('lab')) {
      return "https://luckylabcoffee.com/wp-content/uploads/2020/03/luckydog.png";
    } else if (normalizedName.includes('mcdonald')) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png";
    } else if (normalizedName.includes('burger king') || normalizedName.includes('bk')) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png";
    } else if (normalizedName.includes('wendy')) {
      return "https://upload.wikimedia.org/wikipedia/en/thumb/3/32/Wendy%27s_full_logo_2012.svg/640px-Wendy%27s_full_logo_2012.svg.png";
    } else if (normalizedName.includes('taco bell')) {
      return "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Taco_Bell_2016.svg/1200px-Taco_Bell_2016.svg.png";
    } else if (normalizedName.includes('kfc') || normalizedName.includes('kentucky fried')) {
      return "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/1200px-KFC_logo.svg.png";
    }
    return "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png";
  };

  const handlePlaceClick = (place: Place) => {
    // Open a Google Maps search for this business
    const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank', 'noopener,noreferrer');
  };

  // Format the rating as stars
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex text-amber-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-amber-500" />
        ))}
        {hasHalfStar && (
          <span className="relative inline-block h-3.5 w-3.5">
            <Star className="absolute h-3.5 w-3.5 text-gray-300" />
            <div className="absolute overflow-hidden w-1/2 h-full">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
            </div>
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="text-lg font-medium">{title}</h3>
        <button className="text-gray-500">
          <MapPin className="h-5 w-5" />
        </button>
      </div>

      <div className="h-96 bg-gray-200 relative">
        <div ref={mapRef} className="absolute inset-0 w-full h-full">
          {!window.google && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Loading map...
            </div>
          )}
        </div>
        
        <div className="absolute bottom-2 right-2 bg-white rounded px-2 py-1 text-xs text-gray-600 z-10">
          Map data ©2024 Google
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="p-2 flex gap-2 text-sm border-b border-gray-100">
          <button className="flex items-center text-gray-700 px-2 py-1 rounded transition-all duration-200 hover:bg-gray-100">
            <span>Rating</span>
            <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="flex items-center text-gray-700 px-2 py-1 rounded transition-all duration-200 hover:bg-gray-100">
            <span>Price</span>
            <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="flex items-center text-gray-700 px-2 py-1 rounded transition-all duration-200 hover:bg-gray-100">
            <span>Hours</span>
            <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {places.map((place) => (
          <div 
            key={place.id} 
            className="p-3 border-b border-gray-100 flex cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-50 hover:pl-5 hover:shadow-inner relative group"
            onClick={() => handlePlaceClick(place)}
          >
            <div className="flex-grow">
              <h4 className="font-medium group-hover:text-black transition-colors duration-200">{place.name}</h4>
              <div className="flex items-center text-sm mb-1">
                {place.rating ? (
                  <>
                    {renderRating(place.rating)}
                    {place.reviews && <span className="text-gray-500 ml-1">({place.reviews})</span>}
                  </>
                ) : (
                  <div className="text-gray-400 text-xs">No ratings</div>
                )}
                {place.type && (
                  <>
                    <span className="mx-1">·</span>
                    <span className="text-gray-500">{place.type}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">{place.address}</p>
              {place.features && place.features.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  {place.features.join(" · ")}
                </div>
              )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 absolute right-3 top-3 transition-opacity duration-200">
              <ExternalLink className="h-4 w-4 text-gray-600" />
            </div>
            
            <div className="ml-3">
              <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden">
                <img
                  src={failedImages[place.id] ? getDefaultImage(place.name) : (place.image || getDefaultImage(place.name))}
                  alt={place.name}
                  className="h-full w-full object-cover"
                  onError={() => handleImageError(place.id, place.name, place.image || "")}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="p-3 flex justify-center">
          <button className="text-gray-600 text-sm flex items-center transition-all duration-200 ease-in-out hover:text-black px-4 py-2 rounded-full hover:bg-gray-100">
            View all
            <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalMap;
