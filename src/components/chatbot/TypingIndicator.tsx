
import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex space-x-1 p-3 bg-muted/50 rounded-2xl rounded-tl-none w-fit animate-pulse">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
    </div>
  );
}
