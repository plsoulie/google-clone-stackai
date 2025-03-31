import React from "react";
import { MapPin, ExternalLink } from "lucide-react";

interface Place {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
  features: string[];
  image?: string;
  website?: string;
}

interface LocalMapProps {
  places: Place[];
  title: string;
}

const LocalMap: React.FC<LocalMapProps> = ({ places, title }) => {
  /* Image-related state and functions - commented out for now
  const [failedImages, setFailedImages] = useState<{[key: string]: boolean}>({});
  
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
    }
    return "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png";
  };
  */

  const handlePlaceClick = (place: Place) => {
    // Open a Google Maps search for this business
    const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="text-lg font-medium">{title}</h3>
        <button className="text-gray-500">
          <MapPin className="h-5 w-5" />
        </button>
      </div>

      <div className="h-44 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          Map View
        </div>
        
        <div className="absolute bottom-2 right-2 bg-white rounded px-2 py-1 text-xs text-gray-600">
          Map data ©2023 Google
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
                <div className="flex text-amber-500">
                  {"★".repeat(Math.floor(place.rating))}
                  {"☆".repeat(5 - Math.floor(place.rating))}
                </div>
                <span className="text-gray-500 ml-1">({place.reviews})</span>
                <span className="mx-1">·</span>
                <span className="text-gray-500">{place.type}</span>
              </div>
              <p className="text-sm text-gray-600">{place.address}</p>
              <div className="text-sm text-gray-600 mt-1">
                {place.features.join(" · ")}
              </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 absolute right-3 top-3 transition-opacity duration-200">
              <ExternalLink className="h-4 w-4 text-gray-600" />
            </div>
            
            {/* Image rendering section - commented out for now
            <div className="ml-3">
              {(() => { 
                console.log("Rendering image section for", place.name, ":", place.image, "failed:", failedImages[place.id]); 
                return null; 
              })()}
              <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden">
                <img
                  src={failedImages[place.id] ? getDefaultImage(place.name) : (place.image || getDefaultImage(place.name))}
                  alt={place.name}
                  className="h-full w-full object-cover"
                  onError={() => handleImageError(place.id, place.name, place.image || "")}
                />
              </div>
            </div>
            */}
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
