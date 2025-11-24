import React, { useState } from 'react';
import { SearchIcon, LoaderIcon } from './Icons';

interface AddressInputProps {
  onSearch: (address: string) => void;
  isLoading: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({ onSearch, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isLoading ? (
          <LoaderIcon className="h-5 w-5 text-indigo-500" />
        ) : (
          <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
        )}
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
        placeholder="Enter a location (e.g., Eiffel Tower, 1600 Amphitheatre Pkwy)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="absolute inset-y-2 right-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
      >
        Locate
      </button>
    </form>
  );
};

export default AddressInput;
