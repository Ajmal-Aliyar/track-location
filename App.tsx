import React, { useState } from 'react';
import { UserEntry, Coordinates } from './types';
import AddUserForm from './components/AddUserForm';
import UserList from './components/UserList';
import MapContainer from './components/MapContainer';
import { MapPinIcon } from './components/Icons';

// Initial dummy data with coordinates for precise mapping
const INITIAL_USERS: UserEntry[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    location: {
      summary: "The Golden Gate Bridge is a suspension bridge spanning the Golden Gate, the one-mile-wide strait connecting San Francisco Bay and the Pacific Ocean.",
      formattedAddress: "Golden Gate Bridge, San Francisco, CA",
      coordinates: { lat: 37.8199, lng: -122.4783 },
      placeType: "Landmark",
      googleMapsUri: "https://maps.google.com/?q=Golden+Gate+Bridge"
    },
    joinedAt: new Date()
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    location: {
      summary: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel.",
      formattedAddress: "Champ de Mars, 5 Av. Anatole France, 75007 Paris, France",
      coordinates: { lat: 48.8584, lng: 2.2945 },
      placeType: "Monument",
      googleMapsUri: "https://maps.google.com/?q=Eiffel+Tower"
    },
    joinedAt: new Date()
  }
];

const App: React.FC = () => {
  const [users, setUsers] = useState<UserEntry[]>(INITIAL_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // States for "Pick on Map" functionality
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<Coordinates | null>(null);

  const handleAddUser = (newUser: UserEntry) => {
    setUsers((prev) => [newUser, ...prev]);
    setSelectedUserId(newUser.id);
    setIsSelectingLocation(false);
    setPickedCoordinates(null);
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserId(prev => prev === id ? null : id);
    // Exit selection mode if user clicks a list item
    setIsSelectingLocation(false);
  };

  const handleMapClick = (coords: Coordinates) => {
    if (isSelectingLocation) {
        setPickedCoordinates(coords);
        // We do NOT turn off selection mode immediately, allowing user to refine click
        // Selection mode ends when they submit the form or cancel
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              GeoMark Community
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar (Directory) */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-white flex flex-col border-r border-gray-100 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full">
          
          {/* Add User Section */}
          <div className="p-6 pb-2 flex-shrink-0">
            <AddUserForm 
                onAddUser={handleAddUser}
                onStartPicking={() => setIsSelectingLocation(true)}
                onCancelPicking={() => {
                    setIsSelectingLocation(false);
                    setPickedCoordinates(null);
                }}
                pickedCoordinates={pickedCoordinates}
                isPicking={isSelectingLocation}
            />
          </div>
          
          <div className="px-6 py-4 border-b border-gray-50">
             <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
               Community Members ({users.length})
             </h2>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
            <UserList 
              users={users} 
              selectedUserId={selectedUserId} 
              onSelectUser={handleSelectUser} 
            />
          </div>
          
          <div className="p-4 border-t border-gray-100 text-xs text-center text-gray-400 bg-gray-50/50">
             Data grounded by Google Maps • Visuals by OSM
          </div>
        </div>

        {/* Right Area (Map) */}
        <div className="flex-1 relative bg-gray-100 h-[50vh] md:h-full">
            <MapContainer 
              users={users}
              selectedUserId={selectedUserId}
              isSelecting={isSelectingLocation}
              onMapClick={handleMapClick}
              pickedCoordinates={pickedCoordinates}
            />
        </div>
      </main>
    </div>
  );
};

export default App;