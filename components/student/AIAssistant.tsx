'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX } from 'react-icons/fi';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I\'m your AI learning assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the most recent message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus the input field when the assistant opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponse,
          timestamp: new Date(),
        },
      ]);
      
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  // Generate a simulated AI response
  const generateAIResponse = (userInput: string): string => {
    const userInputLower = userInput.toLowerCase();
    
    if (userInputLower.includes('help') || userInputLower.includes('question')) {
      return "I'm here to help! What specific question do you have about your coursework?";
    }
    
    if (userInputLower.includes('deadline') || userInputLower.includes('due date')) {
      return "You can check all your upcoming deadlines in the Calendar section of each course. Would you like me to guide you on how to access that?";
    }
    
    if (userInputLower.includes('study') || userInputLower.includes('learn')) {
      return "Effective study techniques include active recall, spaced repetition, and teaching concepts to others. Would you like me to share some more specific study strategies for your courses?";
    }
    
    if (userInputLower.includes('grade') || userInputLower.includes('score')) {
      return "Your grades are confidential and can be viewed in the grade section of each course. Would you like to know how grades are calculated?";
    }
    
    if (userInputLower.includes('thank')) {
      return "You're welcome! Feel free to ask if you need anything else.";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting question. Let me help you with that.",
      "I can assist with that. Could you provide more details?",
      "I'm here to support your learning journey. What specific aspect would you like to know more about?",
      "Great question! This is commonly asked by students. The key thing to understand is that learning takes practice and persistence.",
      "I'd be happy to help you with that. Let's break it down together."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Handle input submission on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl h-[600px] max-h-[90vh] rounded-lg border border-zinc-800 bg-black/90 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="font-medium text-white">AI Learning Assistant</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close assistant"
          >
            <FiX />
          </button>
        </div>
        
        {/* Messages area */}
        <div className="p-4 h-[calc(100%-120px)] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs sm:max-w-md rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-[#ffc20b31] text-white' 
                      : 'bg-zinc-800 text-white'
                  }`}
                >
                  {message.text}
                  <div className="mt-1 text-right">
                    <span className="text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs sm:max-w-md rounded-lg p-3 bg-zinc-800 text-white">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Empty div for auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-black/90">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
              className="flex-1 rounded-md border border-zinc-800 bg-zinc-900/50 py-2 px-4 text-white placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-md bg-[#ffc20b31] p-2 text-[#f0bb1c] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 