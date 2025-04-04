// src/components/simulation/SimulationViewer.tsx
import React, { useState, useEffect } from 'react';

const SimulationViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const vncUrl = "http://3.84.243.199:6080/vnc.html";

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load simulation');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h2 className="font-medium">Simulation Preview</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 truncate max-w-xs mr-2">{vncUrl}</span>
          <button 
            onClick={() => window.open(vncUrl, '_blank')}
            className="p-1 rounded hover:bg-gray-100"
            title="Open in new tab"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="p-1 rounded hover:bg-gray-100 ml-2"
            title="Refresh"
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-white overflow-hidden relative">
        <iframe
          src={vncUrl}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Automation Simulation"
          sandbox="allow-same-origin allow-scripts"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <SpinnerIcon className="h-10 w-10 animate-spin mx-auto text-blue-500" />
              <p className="mt-4 text-gray-600">Loading simulation...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-red-500">
              <ExclamationIcon className="h-10 w-10 mx-auto" />
              <p className="mt-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationViewer;


// Icons used above
const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const BrowserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
  const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );