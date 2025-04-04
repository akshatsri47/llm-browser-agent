import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onUpdateSimulation: (url: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onUpdateSimulation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome! I can help you automate browsing tasks. What would you like to automate today?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
  
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
  
    try {
      // Send message to backend's /send_task API
      const response = await fetch('http://localhost:5000/send_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: inputValue,
        }),
      });
  
      const data = await response.json();
  
      // Add assistant message with the actual content from the agent
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.message || 'I processed your request but received no result.',
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, assistantMessage]);
  
      // If simulation URL is provided, update it
      if (data.simulationUrl) {
        onUpdateSimulation(data.simulationUrl);
      }
    } catch (error) {
      console.error('Error sending message:', error);
  
      // Add error message
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'system',
        content: 'Failed to send message. Please try again.',
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'system'
                  ? 'bg-gray-300 text-gray-800'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your instructions..."
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={`p-3 rounded-md h-full ${
              isLoading || !inputValue.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? (
              <SpinnerIcon className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
