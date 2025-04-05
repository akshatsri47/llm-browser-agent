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

interface PresetPrompt {
  id: string;
  label: string;
  prompt: string;
}

const presetPrompts: PresetPrompt[] = [
  {
    id: 'googleForm',
    label: 'Google Form Automation',
    prompt: `
*Updated Task Flow with Google Sign-In*

1. Navigate to form page directly: {credentials['form_url']}
2. Look for "Sign in" hyperlink (text: contains 'Sign in' or similar like 'itwinabgbov')
3. Click hyperlink to begin Google Sign-In flow
4. Enter:
   - Email: {credentials['email']}
   - Password: {credentials['password']}
5. Complete login and return to the form
6. Confirm user is signed in (check for user avatar or email on form)
7. Fill form as follows:
   - Name fields: "Saatvik Agnihotri"
   - Email fields: {credentials['email']}
   - Password fields: {credentials['password']}
   - Technical questions: Provide expert-level answers
   - Ratings: Use 4/5 for positives, 2/5 for negatives
   - Required unknown fields: Use "N/A"
   - Optional fields: Leave blank
8. Submit form
9. Validate submission and capture confirmation
    `.trim(),
  },
  {
    id: 'customSearch',
    label: 'Custom Search Query',
    prompt: `Search google for the latest news on artificial intelligence.`,
  },
  {
    id: 'linkedinJobApply',
    label: 'LinkedIn Job Application Automation',
    prompt: `
# LinkedIn Job Application Automation

## OBJECTIVE
Apply to multiple jobs on LinkedIn using the "Easy Apply" feature when available, or save jobs for later if they redirect to external sites.

## TASK

### 1. LOGIN
\`\`\`
Navigate to linkedin.com
Wait for page to load (3s)
Look for and click "Sign in" button
Enter credentials:
  - Email: {email}
  - Password: {password}
Click Sign in button
Wait for successful login (5s)
if security verification prompted wait for the user input  after user input then proceed
\`\`\`

### 2. SEARCH FOR JOBS
\`\`\`
Click on Jobs icon in top navigation
Wait for Jobs page to load (3s)
Find search field and enter {job_query}
Press Enter to search
Wait for search results (5s)
\`\`\`

### 3. PROCESS JOB LISTINGS (REPEAT FOR 5 JOBS)
\`\`\`
For each job listing:
  EXTRACT and REMEMBER job title and company name
  Click on job listing to view details
  Wait for job details to load (3s)
  Check if "Easy Apply" button exists
  
  If "Easy Apply" exists:
    Click "Easy Apply" button
    Wait for form to load (2s)
    Complete application form:
      Fill required text fields with appropriate information
      If resume is requested, skip the resume upload (resume is not required)
      Check any required checkboxes (prefer "Yes" for qualifications)
      Click Next/Continue/Submit buttons as they appear
      Wait for confirmation (3s)
    Close any confirmation dialogs
    Record successful application
  
  If only regular "Apply" button exists:
    DO NOT click it (avoids leaving LinkedIn)
    Find and click "Save" button instead
    Wait for save confirmation (1s)
    Record job as saved
  
  Return to search results:
    Click browser back button OR
    Navigate directly to job search results URL
    Wait for search results to reload (3s)
    
  Track progress (jobs applied vs saved)
\`\`\`

### IMPORTANT NOTES
- ALWAYS wait for page loads before interacting with elements
- NEVER attempt to apply through external websites
- If a job can't be processed, move to the next one
- Check element existence before clicking
- Use browser back navigation with caution
    `.trim(),
  },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onUpdateSimulation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForSecurityCode, setWaitingForSecurityCode] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
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

  // When the preset changes, update the input value
  useEffect(() => {
    if (selectedPreset === 'custom') {
      setInputValue('');
    } else {
      const preset = presetPrompts.find((p) => p.id === selectedPreset);
      if (preset) {
        setInputValue(preset.prompt);
      }
    }
  }, [selectedPreset]);

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
      const response = await fetch('http://172.20.172.179:5000/send_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Sending the task text under "task_text"
        body: JSON.stringify({
          task_text: inputValue,
        }),
      });

      const data = await response.json();

      // If the backend requests a security code, set the flag to show input
      if (data.status === "waiting_for_security_code") {
        setWaitingForSecurityCode(true);
      }

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

  const handleSecurityCodeSubmit = async () => {
    if (!securityCode.trim()) return;

    // Add user message for security code
    const securityMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: `Security Code: ${securityCode}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, securityMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://172.20.172.179:5000/receive_security_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          security_code: securityCode,
        }),
      });
      const data = await response.json();

      // Add assistant message with the result of security code submission
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.message || 'Security code submitted, but no result returned.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setWaitingForSecurityCode(false);
      setSecurityCode('');
    } catch (error) {
      console.error('Error submitting security code:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'system',
        content: 'Failed to submit security code. Please try again.',
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
      {/* Preset prompt selection */}
      <div className="p-4 bg-white border-b border-gray-200">
        <label className="block mb-2 font-semibold">Choose a preset prompt:</label>
        <select
          value={selectedPreset}
          onChange={(e) => setSelectedPreset(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="custom">Custom</option>
          {presetPrompts.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

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

      {/* If waiting for security code, show a dedicated input area */}
      {waitingForSecurityCode && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="mb-2 text-sm text-red-600">
            Security verification is required. Please enter the security code below:
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              placeholder="Enter security code..."
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSecurityCodeSubmit}
              disabled={isLoading || !securityCode.trim()}
              className={`p-3 rounded-md ${
                isLoading || !securityCode.trim()
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
      )}

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your instructions or use a preset..."
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
