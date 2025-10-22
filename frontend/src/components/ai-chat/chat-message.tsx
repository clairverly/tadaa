import { ChatMessage as ChatMessageType } from '@/lib/ai-chat-engine';
import { Button } from '@/components/ui/button';
import { Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const navigate = useNavigate();
  const isUser = message.role === 'user';

  const handleActionClick = (action: any) => {
    if (action.type === 'navigate' && action.data) {
      navigate(action.data);
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'
      }`}>
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`max-w-[80%] ${
          isUser 
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
            : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm'
        } px-4 py-3`}>
          <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
          
          {/* Action Buttons */}
          {message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.actions.map(action => (
                <Button
                  key={action.id}
                  size="sm"
                  variant={isUser ? 'secondary' : 'outline'}
                  onClick={() => handleActionClick(action)}
                  className="text-xs h-7"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}