
import React from "react";
import { MapPin } from "lucide-react";

interface Place {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
  features: string[];
  image?: string;
}

interface LocalMapProps {
  places: Place[];
  title: string;
}

const LocalMap: React.FC<LocalMapProps> = ({ places, title }) => {
  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
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
        
        <div className="absolute bottom-2 right-2 bg-white rounded-sm px-2 py-1 text-xs text-gray-600">
          Map data ©2023 Google
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="p-2 flex gap-2 text-sm border-b border-gray-100">
          <button className="flex items-center text-gray-700">
            <span>Rating</span>
            <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="flex items-center text-gray-700">
            <span>Price</span>
            <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="flex items-center text-gray-700">
            <span>Hours</span>
            <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {places.map((place) => (
          <div key={place.id} className="p-3 border-b border-gray-100 flex">
            <div className="flex-grow">
              <h4 className="font-medium">{place.name}</h4>
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
            {place.image && (
              <div className="ml-3">
                <div className="h-16 w-16 bg-gray-200 rounded-sm overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="p-3 flex justify-center">
          <button className="text-blue-600 text-sm flex items-center">
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
