import React, { useState, useEffect } from 'react';
import { LoaderIcon, MapPinIcon } from './Icons';
import { exploreLocation, getLocationFromCoordinates } from '../services/geminiService';
import { LocationData, UserEntry, Coordinates } from '../types';

interface AddUserFormProps {
  onAddUser: (user: UserEntry) => void;
  onStartPicking: () => void;
  onCancelPicking: () => void;
  pickedCoordinates: Coordinates | null;
  isPicking: boolean;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ 
  onAddUser, 
  onStartPicking, 
  onCancelPicking, 
  pickedCoordinates,
  isPicking 
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fetchedLocationData, setFetchedLocationData] = useState<LocationData | null>(null);

  // Effect: When coordinates are picked from the map, reverse geocode them
  useEffect(() => {
    const fetchLocationDetails = async () => {
        if (pickedCoordinates) {
            setIsLoading(true);
            setAddress(`${pickedCoordinates.lat.toFixed(4)}, ${pickedCoordinates.lng.toFixed(4)}...`);
            try {
                const data = await getLocationFromCoordinates(pickedCoordinates);
                setFetchedLocationData(data);
                setAddress(data.formattedAddress);
            } catch (err) {
                console.error(err);
                setError("Failed to identify location details.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (pickedCoordinates) {
        setIsOpen(true); // Ensure form is open
        fetchLocationDetails();
    }
  }, [pickedCoordinates]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      let finalLocationData = fetchedLocationData;

      // If user manually typed address instead of picking, or changed the picked address text
      if (!finalLocationData || finalLocationData.formattedAddress !== address) {
         finalLocationData = await exploreLocation(address);
      }
      
      const newUser: UserEntry = {
        id: crypto.randomUUID(),
        name: name.trim(),
        location: finalLocationData,
        joinedAt: new Date()
      };

      onAddUser(newUser);
      
      // Reset
      setName('');
      setAddress('');
      setFetchedLocationData(null);
      setIsOpen(false);
      onCancelPicking(); 

    } catch (err) {
      console.error(err);
      setError("We couldn't verify this location. Please try a more specific address.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePicking = () => {
      if (isPicking) {
          onCancelPicking();
      } else {
          onStartPicking();
          setIsOpen(true); // Open form so they can type name while picking
      }
  }

  if (!isOpen && !isPicking) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <span>Add Your Location</span>
      </button>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 animate-fade-in relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Join the Map</h3>
        <button 
          onClick={() => { setIsOpen(false); onCancelPicking(); }}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            placeholder="e.g., Alice Smith"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
                <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Address or click map..."
                />
                <MapPinIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
                type="button"
                onClick={handleTogglePicking}
                className={`px-3 py-2 rounded-lg border transition-colors flex items-center justify-center ${
                    isPicking 
                    ? 'bg-indigo-100 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title="Pick location on map"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                </svg>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !name || !address}
          className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <LoaderIcon className="w-4 h-4 text-white" />
              <span>Verifying Location...</span>
            </>
          ) : (
            <span>Add to List</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;