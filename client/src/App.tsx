// App.tsx
import React from 'react';
import LandingPage from './components/Landingpage';  // Ensure the import path is correct based on your project structure

const App: React.FC = () => {
  return (
    <div className="App">
      <LandingPage />  {/* This renders the LandingPage component */}
    </div>
  );
}

export default App;
