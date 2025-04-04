import React, { useState } from 'react';
import ChatInterface from '../chat/ChatInterface';
import SimulationViewer from '../chat/SimulationViewer';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [simulationUrl, setSimulationUrl] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const updateSimulationUrl = (url: string) => {
    setSimulationUrl(url);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar (collapsible) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main content area with chat and simulation */}
      <div className="flex flex-1 flex-col h-full">
        {/* Top navbar */}
        <div className="h-14 bg-white shadow-sm flex items-center px-4 z-10">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 mr-4"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-xl">Browserless Automation</h1>
        </div>
        
        {/* Split content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat section - exactly 50% width */}
          <div className="w-1/2 flex flex-col border-r border-gray-200">
            <div className="bg-white shadow-sm p-4 flex items-center justify-between">
              <h2 className="font-medium">Chat Interface</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface onUpdateSimulation={updateSimulationUrl} />
            </div>
          </div>
          
          {/* Simulation section - exactly 50% width */}
          <div className="w-1/2 flex flex-col">
            <SimulationViewer url={simulationUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

// Icons used above
const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
