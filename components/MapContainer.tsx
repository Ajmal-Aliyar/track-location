import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { Coordinates, UserEntry } from '../types';
import { LoaderIcon, NavigationIcon } from './Icons';

interface MapContainerProps {
  users: UserEntry[];
  selectedUserId: string | null;
  isSelecting: boolean;
  onMapClick?: (coords: Coordinates) => void;
  pickedCoordinates?: Coordinates | null;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  users, 
  selectedUserId, 
  isSelecting, 
  onMapClick,
  pickedCoordinates 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const pickedMarkerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Refs to track latest props for event listeners
  const isSelectingRef = useRef(isSelecting);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    isSelectingRef.current = isSelecting;
    onMapClickRef.current = onMapClick;
  }, [isSelecting, onMapClick]);

  // Initialize Map
  useEffect(() => {
    const mapContainer = document.getElementById('map-container');
    
    if (mapContainer && !mapRef.current) {
        // Google Maps Layers
        const googleStreets = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            attribution: '&copy; Google Maps'
        });

        const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            attribution: '&copy; Google Maps'
        });

        const googleTerrain = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            attribution: '&copy; Google Maps'
        });

        // Initialize map
        mapRef.current = L.map(mapContainer, {
            layers: [googleStreets],
            zoomControl: false, // We add it manually to position it
            attributionControl: false // Cleaner look, usually Google logo is enough in tiles
        }).setView([20, 0], 2);

        // Add Zoom Control to Bottom Right (Classic Google Maps position)
        L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
        
        // Add Layer Control
        const baseMaps = {
            "Map": googleStreets,
            "Satellite": googleHybrid,
            "Terrain": googleTerrain
        };
        L.control.layers(baseMaps, undefined, { position: 'topleft' }).addTo(mapRef.current);

        // Handle Map Clicks
        mapRef.current.on('click', (e) => {
          if (isSelectingRef.current && onMapClickRef.current) {
             onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
          }
        });
    }

    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []);

  // Update cursor based on mode
  useEffect(() => {
    if (mapRef.current) {
        const container = mapRef.current.getContainer();
        if (isSelecting) {
            container.style.cursor = 'crosshair';
            // Add a subtle visual cue for selection mode
            container.classList.add('cursor-crosshair');
        } else {
            container.style.cursor = 'grab';
            container.classList.remove('cursor-crosshair');
        }
    }
  }, [isSelecting]);

  // Handle "Picked" Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (pickedCoordinates) {
        // Standard Red Pin for picked location
        const icon = L.divIcon({
            className: 'leaflet-div-icon',
            html: `<div class="relative -mt-8 -ml-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EA4335" stroke="rgba(0,0,0,0.2)" stroke-width="1" class="w-10 h-10 drop-shadow-lg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                   </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        if (pickedMarkerRef.current) {
            pickedMarkerRef.current.setLatLng([pickedCoordinates.lat, pickedCoordinates.lng]);
        } else {
            pickedMarkerRef.current = L.marker([pickedCoordinates.lat, pickedCoordinates.lng], { icon }).addTo(mapRef.current);
        }
        
        mapRef.current.setView([pickedCoordinates.lat, pickedCoordinates.lng], 17, { animate: true });

    } else {
        if (pickedMarkerRef.current) {
            pickedMarkerRef.current.remove();
            pickedMarkerRef.current = null;
        }
    }
  }, [pickedCoordinates]);

  // Handle User Markers
  useEffect(() => {
    if (!mapRef.current) return;

    Object.keys(markersRef.current).forEach(id => {
       if (!users.find(u => u.id === id)) {
           markersRef.current[id].remove();
           delete markersRef.current[id];
       }
    });

    users.forEach(user => {
        const isSelected = user.id === selectedUserId;
        const color = isSelected ? "#4285F4" : "#EA4335"; // Google Blue for selected, Google Red for others
        const zIndex = isSelected ? 1000 : 1;
        const scale = isSelected ? "scale-125" : "scale-100";

        const icon = L.divIcon({
            className: 'leaflet-div-icon',
            html: `
                <div class="relative -mt-10 -ml-5 transition-transform duration-300 ${scale} origin-bottom">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" class="w-10 h-10 drop-shadow-md">
                        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 7 13s7-7.75 7-13c0-4.42-3.58-8-8-8z"/>
                        <circle cx="12" cy="8" r="3" fill="white"/>
                    </svg>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        if (user.location.coordinates) {
            const { lat, lng } = user.location.coordinates;
            if (markersRef.current[user.id]) {
                markersRef.current[user.id].setLatLng([lat, lng]).setIcon(icon).setZIndexOffset(zIndex);
            } else {
                const marker = L.marker([lat, lng], { icon, zIndexOffset: zIndex }).addTo(mapRef.current!);
                markersRef.current[user.id] = marker;
            }
        }
    });

    if (selectedUserId) {
        const selectedUser = users.find(u => u.id === selectedUserId);
        if (selectedUser && selectedUser.location.coordinates && mapRef.current) {
            mapRef.current.flyTo(
                [selectedUser.location.coordinates.lat, selectedUser.location.coordinates.lng],
                17,
                { duration: 1.2 }
            );
        }
    }
  }, [users, selectedUserId]);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 17, { duration: 1 });
            if (isSelecting && onMapClick) {
                onMapClick({ lat: latitude, lng: longitude });
            }
          }
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not detect your location.");
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#e5e3df]"> 
      {/* #e5e3df is the default Google Maps background color */}
      <div id="map-container" className="w-full h-full z-0 outline-none" />
      
      {isSelecting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-6 py-3 rounded-full shadow-lg z-[1000] text-sm font-medium flex items-center space-x-2 border border-gray-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span>Click map to place pin</span>
        </div>
      )}

      {/* Locate Me Button - Positioned above zoom controls bottom-right */}
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute bottom-24 right-[10px] z-[400] w-[34px] h-[34px] bg-white rounded shadow-[0_1px_4px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
        title="Show Your Location"
      >
        {isLocating ? (
          <LoaderIcon className="w-5 h-5 animate-spin text-blue-500" />
        ) : (
          <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute w-4 h-4 border-2 border-gray-600 rounded-full"></div>
              <div className="absolute w-4 h-[2px] bg-gray-600"></div>
              <div className="absolute h-4 w-[2px] bg-gray-600"></div>
              <div className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </button>

      {/* Google Attribution fallback if tiles don't show it */}
      <div className="absolute bottom-0 left-0 px-1 bg-white/60 text-[10px] text-gray-700 pointer-events-none z-[400]">
        Map data &copy;2024 Google
      </div>
    </div>
  );
};

export default MapContainer;