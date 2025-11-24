import React from 'react';
import { LocationData } from '../types';
import { ExternalLinkIcon } from './Icons';

interface LocationDetailsProps {
  data: LocationData;
  embedded?: boolean;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({ data, embedded = false }) => {
  // If embedded, we strip the outer card styling to fit nicely inside the accordion
  const containerClasses = embedded 
    ? "p-4 animate-fade-in" 
    : "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in p-6";

  return (
    <div className={containerClasses}>
      <div className="space-y-3">
        {!embedded && (
            <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 uppercase tracking-wide">
                    {data.placeType}
                </span>
            </div>
        )}

        <div className="space-y-2">
            {embedded && (
                <div className="flex items-center justify-between">
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-600 uppercase tracking-wide">
                        {data.placeType}
                    </span>
                </div>
            )}
            <p className="text-gray-600 text-sm leading-relaxed">
            {data.summary}
            </p>
        </div>

        <div className="pt-3 border-t border-gray-200/60 mt-2">
            {data.googleMapsUri && (
                <a 
                    href={data.googleMapsUri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium group transition-colors"
                >
                    <span>Open in Google Maps</span>
                    <ExternalLinkIcon className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
            )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;