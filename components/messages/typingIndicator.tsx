"use client"

interface TypingIndicatorProps {
  typingUsers: Record<string, boolean>;
  participantsData: Record<string, { name: string }>;
  currentReceiverId: string;
}

export function TypingIndicator({ 
  typingUsers, 
  participantsData, 
  currentReceiverId 
}: TypingIndicatorProps) {
  const isTyping = typingUsers[currentReceiverId];
  
  if (!isTyping) return null;

  const userName = participantsData[currentReceiverId]?.name || 'Someone';

  return (
    <div className="flex items-center space-x-2 text-gray-500">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
      <div
        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: '0.2s' }}
      />
      <div
        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: '0.4s' }}
      />
      <span className="text-sm">
        {userName} is typing...
      </span>
    </div>
  );
}
