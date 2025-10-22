import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from './chat-message';
import { generateAIResponse, generateQuickSuggestions, ChatMessage as ChatMessageType, ChatContext } from '@/lib/ai-chat-engine';
import { billStorage, errandStorage, appointmentStorage } from '@/lib/storage';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load context data
  const getContext = (): ChatContext => ({
    bills: billStorage.getAll(),
    errands: errandStorage.getAll(),
    appointments: appointmentStorage.getAll(),
  });

  const quickSuggestions = generateQuickSuggestions(getContext());

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessageType = {
        id: 'greeting',
        role: 'assistant',
        content: `👋 Hi! I'm your Tadaa AI assistant. I can help you manage your bills, errands, and appointments. What would you like to know?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const context = getContext();
      const aiResponse = generateAIResponse(inputValue, context);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 500);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 z-50 group"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse"></span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col border-2 border-purple-200">
          {/* Header */}
          <CardHeader className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-t-lg pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tadaa AI Assistant</CardTitle>
                  <p className="text-xs text-purple-100">Always here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                      onClick={() => handleQuickSuggestion(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}