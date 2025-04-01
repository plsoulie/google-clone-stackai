'use client';

import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
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
  thumbnail?: string;
  city?: string;
}

interface LocalMapProps {
  places: Place[];
  title: string;
}

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center coordinates (Berkeley)
const defaultCenter = {
  lat: 37.8715,
  lng: -122.2730
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ],
};

const LocalMap: React.FC<LocalMapProps> = ({ places, title }) => {
  const [failedImages, setFailedImages] = useState<{[key: string]: boolean}>({});
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [geocodedCoordinates, setGeocodedCoordinates] = useState<{[key: string]: {lat: number, lng: number}}>({});
  const mapRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [cityBounds, setCityBounds] = useState<google.maps.LatLngBounds | null>(null);
  
  // Load the Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    mapIds: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ? [process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID] : undefined
  });

  // Update bounds to include all markers
  const updateBounds = useCallback(() => {
    if (!isLoaded || !places.length) return;

    const newBounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    places.forEach(place => {
      let coordinates = place.gps_coordinates 
        ? { lat: place.gps_coordinates.latitude, lng: place.gps_coordinates.longitude }
        : geocodedCoordinates[place.id];

      if (coordinates) {
        newBounds.extend(coordinates);
        hasValidCoordinates = true;
      }
    });

    if (hasValidCoordinates) {
      setBounds(newBounds);
      if (map) {
        map.fitBounds(newBounds);
        
        // Add a small padding to ensure markers aren't right at the edges
        const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          map.setZoom(Math.min(map.getZoom() || 14, 15));
        });
        
        return () => {
          google.maps.event.removeListener(listener);
        };
      }
    }
  }, [isLoaded, places, geocodedCoordinates, map]);

  // Effect to update bounds when places or geocoded coordinates change
  useEffect(() => {
    updateBounds();
  }, [updateBounds, places, geocodedCoordinates]);

  // Add this new function to get city bounds
  const getCityBounds = useCallback(async (cityName: string) => {
    if (!isLoaded) return null;
    
    const geocoder = new google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({
        address: cityName,
        componentRestrictions: { country: 'US' }
      });

      if (result.results && result.results.length > 0) {
        // Get the viewport of the city result
        const viewport = result.results[0].geometry.viewport;
        if (viewport) {
          // Create a slightly smaller bounding box (about 2-3 miles around the city center)
          const center = result.results[0].geometry.location;
          const lat = center.lat();
          const lng = center.lng();
          const offset = 0.04; // Approximately 2-3 miles
          
          return new google.maps.LatLngBounds(
            { lat: lat - offset, lng: lng - offset },
            { lat: lat + offset, lng: lng + offset }
          );
        }
        return result.results[0].geometry.viewport;
      }
    } catch (error) {
      console.error('Error getting city bounds:', error);
    }
    return null;
  }, [isLoaded]);

  // Modify the geocodePlaces function
  const geocodePlaces = useCallback(async () => {
    if (!isLoaded || !places || !places.length) return;

    const geocoder = new google.maps.Geocoder();
    const newGeocodedCoordinates: {[key: string]: {lat: number, lng: number}} = {};

    // Get the city name from the first place's address or city field
    const firstPlace = places[0];
    const cityMatch = firstPlace.address.match(/([^,]+),\s*([A-Z]{2})/);
    const cityName = cityMatch ? cityMatch[1] : firstPlace.city;

    // Get bounds for the city if we don't have them yet
    if (!cityBounds && cityName) {
      const bounds = await getCityBounds(cityName);
      if (bounds) {
        setCityBounds(bounds);
      }
    }

    for (const place of places) {
      if (place.gps_coordinates || geocodedCoordinates[place.id]) continue;

      try {
        let result;
        
        // Extract city and state from address if possible
        const addressParts = place.address.split(',').map(part => part.trim());
        const cityStatePattern = /^([^,]+),\s*([A-Z]{2})/;
        let state = '';
        
        // Look for city, state pattern in address parts
        for (const part of addressParts) {
          const match = part.match(cityStatePattern);
          if (match) {
            state = match[2];
            break;
          }
        }

        // Geocoding options using city bounds if available
        const geocodeOptions: google.maps.GeocoderRequest = {
          region: 'us',
          bounds: cityBounds || undefined
        };

        // Try geocoding with full address first
        result = await geocoder.geocode({ 
          address: place.address,
          ...geocodeOptions,
          componentRestrictions: state ? { country: 'US', administrativeArea: state } : { country: 'US' }
        });

        if (result?.results && result.results.length > 0) {
          // Filter results to prefer those with higher precision
          const bestResult = result.results.find(r => 
            r.types.includes('street_address') || 
            r.types.includes('premise') ||
            r.types.includes('subpremise') ||
            r.types.includes('point_of_interest')
          ) || result.results[0];

          const location = bestResult.geometry.location;
          
          // Verify the location is within our city bounds if we have them
          if (!cityBounds || cityBounds.contains(location)) {
            newGeocodedCoordinates[place.id] = {
              lat: location.lat(),
              lng: location.lng()
            };
          }
        }
      } catch (error) {
        console.error(`Error geocoding address for ${place.name}:`, error);
      }
    }

    setGeocodedCoordinates(prev => ({...prev, ...newGeocodedCoordinates}));
  }, [isLoaded, places, geocodedCoordinates, cityBounds, getCityBounds]);

  // Effect to geocode places when they change
  useEffect(() => {
    if (isLoaded && places.length > 0) {
      geocodePlaces();
    }
  }, [isLoaded, places, geocodePlaces]);

  // Get the center coordinates from the city or first place with GPS coordinates
  const getMapCenter = useCallback(async () => {
    // First try to get city from the first place
    if (places && places.length > 0) {
      const firstPlace = places[0];
      
      // If we have GPS coordinates, use them
      if (firstPlace.gps_coordinates) {
        const coords = {
          lat: firstPlace.gps_coordinates.latitude,
          lng: firstPlace.gps_coordinates.longitude
        };
        setMapCenter(coords);
        return coords;
      }
      
      // If we have a city, geocode it
      if (firstPlace.city) {
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ address: firstPlace.city });
          
          if (result.results && result.results.length > 0) {
            const location = result.results[0].geometry.location;
            const coords = {
              lat: location.lat(),
              lng: location.lng()
            };
            setMapCenter(coords);
            return coords;
          }
        } catch (error) {
          console.error('Error geocoding city:', error);
        }
      }
      
      // If we have an address, try to geocode it
      if (firstPlace.address) {
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ address: firstPlace.address });
          
          if (result.results && result.results.length > 0) {
            const location = result.results[0].geometry.location;
            const coords = {
              lat: location.lat(),
              lng: location.lng()
            };
            setMapCenter(coords);
            return coords;
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
        }
      }
    }
    
    return defaultCenter;
  }, [places]);

  // Effect to update map center when places change
  useEffect(() => {
    if (isLoaded && places.length > 0) {
      getMapCenter();
    }
  }, [isLoaded, places, getMapCenter]);

  // Callback when the map is loaded
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // If we already have bounds, fit the map to them
    if (bounds) {
      map.fitBounds(bounds);
      // Add a small padding to ensure markers aren't right at the edges
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        map.setZoom(Math.min(map.getZoom() || 14, 15));
      });
    } else {
      // Otherwise use the center point
      getMapCenter().then(center => {
        map.setCenter(center);
      });
    }
  }, [getMapCenter, bounds]);

  // Callback when the map is unmounted
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
  };

  // Handle closing the info window
  const handleInfoWindowClose = () => {
    setSelectedPlace(null);
  };

  // Open place in Google Maps
  const handlePlaceClick = (place: Place) => {
    const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank', 'noopener,noreferrer');
  };

  const handleImageError = (id: string, name: string, url: string) => {
    console.error(`Image load error for ${name}:`, url);
    console.log(`Using fallback image for ${name}: ${getDefaultImage(name)}`);
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
    } else if (normalizedName.includes('yoga') || normalizedName.includes('fitness') || 
              normalizedName.includes('pilates') || normalizedName.includes('brooklyn yoga project') ||
              normalizedName.includes('yoga house')) {
      return "https://cdn.pixabay.com/photo/2016/08/01/15/00/silouette-1561170_1280.png";
    }
    
    return "/placeholder-business.png";
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

  // Render map content based on loading state
  const renderMap = () => {
    if (loadError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p>Error loading Google Maps</p>
            <p className="text-sm mt-1">Please check your API key or try refreshing</p>
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">Loading map...</div>
        </div>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Render markers for places with coordinates (either GPS or geocoded) */}
        {places.map((place) => {
          // Get coordinates either from GPS or geocoded results
          let coordinates = place.gps_coordinates 
            ? { lat: place.gps_coordinates.latitude, lng: place.gps_coordinates.longitude }
            : geocodedCoordinates[place.id];

          return coordinates && (
            <Marker
              key={place.id}
              position={coordinates}
              title={place.name}
              onClick={() => handleMarkerClick(place)}
              animation={google.maps.Animation.DROP}
            />
          );
        })}

        {/* Info window for selected place */}
        {selectedPlace && (
          <InfoWindow
            position={
              selectedPlace.gps_coordinates
                ? {
                    lat: selectedPlace.gps_coordinates.latitude,
                    lng: selectedPlace.gps_coordinates.longitude
                  }
                : geocodedCoordinates[selectedPlace.id]
            }
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-medium text-sm">{selectedPlace.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{selectedPlace.address}</p>
              {selectedPlace.rating && (
                <div className="mt-1">{renderRating(selectedPlace.rating)}</div>
              )}
              <button
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                onClick={() => handlePlaceClick(selectedPlace)}
              >
                View on Google Maps
                <ExternalLink className="h-3 w-3 ml-1" />
              </button>
            </div>
          </InfoWindow>
        )}

        {/* Child components, markers, etc. */}
        <></>
      </GoogleMap>
    );
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="text-lg font-medium">{title}</h3>
        <button 
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          onClick={updateBounds}
          title="Fit all markers in view"
        >
          <MapPin className="h-5 w-5" />
        </button>
      </div>

      <div className="h-96 bg-gray-200 relative">
        {renderMap()}
        
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
                  src={failedImages[place.id] 
                    ? getDefaultImage(place.name) 
                    : ((place.thumbnail && place.thumbnail.length > 0) 
                        ? place.thumbnail 
                        : ((place.image && place.image.length > 0) 
                            ? place.image 
                            : getDefaultImage(place.name)))}
                  alt={place.name}
                  className="h-full w-full object-cover"
                  onError={() => handleImageError(place.id, place.name, place.thumbnail || place.image || "")}
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
