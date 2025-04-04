import React from 'react';
import AppLayout from './components/layout/AppLayout';

const App: React.FC = () => {
  return (
    <AppLayout />
  );
};

export default App;

// src/api/chat.ts
// This is where you would integrate with your Quart backend

export interface ChatResponse {
  reply: string;
  simulationUrl?: string;
}

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  const response = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};