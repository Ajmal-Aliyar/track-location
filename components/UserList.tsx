import React from 'react';
import { UserEntry } from '../types';
import LocationDetails from './LocationDetails';
import { MapPinIcon } from './Icons';

interface UserListProps {
  users: UserEntry[];
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUserId, onSelectUser }) => {
  if (users.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
        <p>No one is on the map yet.</p>
        <p className="text-sm">Be the first to join!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const isSelected = user.id === selectedUserId;
        
        return (
          <div 
            key={user.id}
            className={`
              rounded-xl border transition-all duration-200 overflow-hidden
              ${isSelected 
                ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-500/20' 
                : 'bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50'
              }
            `}
          >
            <button
              onClick={() => onSelectUser(user.id)}
              className="w-full flex items-center p-4 text-left"
            >
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4
                ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}
              `}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                  {user.name}
                </h3>
                <div className="flex items-center text-xs text-gray-500 mt-0.5 truncate">
                  <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{user.location.formattedAddress}</span>
                </div>
              </div>

              <div className="ml-2">
                 <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isSelected ? 'rotate-180 text-indigo-500' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
              </div>
            </button>

            {/* Accordion Content */}
            {isSelected && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                <LocationDetails data={user.location} embedded={true} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserList;