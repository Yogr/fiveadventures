'use client';

import React, { useEffect, useRef } from 'react';

interface CombatMessagePanelProps {
  messages: string[];
}

export default function CombatMessagePanel({ messages }: CombatMessagePanelProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Effect to scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Only show last 3 messages maximum to prevent overflow
  const displayMessages = messages.length > 3 ? messages.slice(-3) : messages;
  
  // Function to highlight skill names in messages
  const formatMessage = (message: string) => {
    // Check if message contains a skill reference in square brackets
    if (message.includes('[') && message.includes(']')) {
      // Use regex to find skill names in square brackets and wrap them in span with special styling
      return message.replace(/\[(.*?)\]/g, (_, skillName) => (
        `<span class="text-cyan-300 font-extrabold">${skillName}</span>`
      ));
    }
    return message;
  };
  
  return (
    <div className="absolute top-2 left-0 right-0 z-10 flex flex-col items-center">
      <div 
        ref={messagesContainerRef}
        className="bg-black bg-opacity-50 p-2 rounded-md max-w-xl max-h-[10vh] overflow-hidden"
      >
        {messages.length === 0 ? (
          <p className="text-center text-yellow-300">Battle has begun! Choose your action...</p>
        ) : (
          displayMessages.map((message, index) => (
            <p 
              key={index} 
              className="text-center text-yellow-300 font-bold text-shadow"
              dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
            />
          ))
        )}
      </div>
    </div>
  );
}
