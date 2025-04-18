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
  
  return (
    <div className="absolute top-2 left-0 right-0 z-50 flex flex-col items-center">
      <div 
        ref={messagesContainerRef}
        className="bg-black bg-opacity-50 p-2 rounded-md max-w-xl max-h-[10vh] overflow-hidden"
      >
        {messages.length === 0 ? (
          <p className="text-center text-yellow-300">Battle has begun! Choose your action...</p>
        ) : (
          displayMessages.map((message, index) => (
            <p key={index} className="text-center text-yellow-300 font-bold text-shadow">{message}</p>
          ))
        )}
      </div>
    </div>
  );
}
