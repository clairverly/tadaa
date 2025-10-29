import { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  sendMessageWithExtraction,
  saveExtractedItem,
  isExtractionComplete,
  getFieldDisplayName,
  getItemTypeDisplayName,
  formatExtractedData,
  getExtractionStatusColor,
  getExtractionStatusIcon
} from '@/lib/ai-extraction';
import { ChatMessage, ExtractionResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface Message extends ChatMessage {
  extraction?: ExtractionResponse;
}

export function AIChatExtractionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [currentExtraction, setCurrentExtraction] = useState<ExtractionResponse | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageWithExtraction(input, conversationId);
      
      // Update conversation ID if this is a new conversation
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        extraction: response.extraction
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update current extraction if detected
      if (response.extraction?.detected) {
        setCurrentExtraction(response.extraction);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message || 'Failed to process your message'}. Please try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveExtraction = async () => {
    if (!conversationId || !currentExtraction || !isExtractionComplete(currentExtraction)) {
      return;
    }

    setIsSaving(true);
    try {
      // Find the item ID from the last extraction
      const messagesWithExtraction = messages.filter(m => m.extraction?.detected);
      const lastMessage = messagesWithExtraction[messagesWithExtraction.length - 1];
      if (!lastMessage?.extraction) {
        throw new Error('No extraction found');
      }

      // For now, we'll use a generated ID based on timestamp
      const itemId = `item_${Date.now()}`;
      
      const result = await saveExtractedItem(conversationId, itemId);
      
      toast({
        title: 'Success!',
        description: `${getItemTypeDisplayName(currentExtraction.item_type)} saved successfully`,
      });

      // Clear current extraction
      setCurrentExtraction(undefined);

      // Add a confirmation message
      const confirmMessage: Message = {
        role: 'assistant',
        content: `✅ Great! I've saved your ${getItemTypeDisplayName(currentExtraction.item_type).toLowerCase()} to ${result.collection}. Is there anything else I can help you with?`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmMessage]);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save item',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        size="icon"
      >
        <span className="text-2xl">🤖</span>
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-2xl transition-all ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span>🤖</span>
          Tadaa AI Assistant
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-4rem)]">
          {/* Extraction Status Panel */}
          {currentExtraction && currentExtraction.detected && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getExtractionStatusIcon(currentExtraction.status)}</span>
                    <span className="font-semibold text-sm">
                      {getItemTypeDisplayName(currentExtraction.item_type)}
                    </span>
                    <Badge variant="outline" className={getExtractionStatusColor(currentExtraction.status)}>
                      {currentExtraction.status}
                    </Badge>
                  </div>
                  
                  {Object.keys(currentExtraction.extracted_data).length > 0 && (
                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      {Object.entries(currentExtraction.extracted_data).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="font-medium">{getFieldDisplayName(key)}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {currentExtraction.missing_fields.length > 0 && (
                    <div className="text-xs text-amber-600 mt-2">
                      <span className="font-medium">Still needed:</span>{' '}
                      {currentExtraction.missing_fields.map(getFieldDisplayName).join(', ')}
                    </div>
                  )}
                </div>
                
                {isExtractionComplete(currentExtraction) && (
                  <Button
                    size="sm"
                    onClick={handleSaveExtraction}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg mb-2">👋 Hi! I'm your AI assistant</p>
                <p className="text-sm">
                  Tell me about tasks, bills, reminders, appointments, or payment methods you need to manage.
                  I'll help extract and organize the information!
                </p>
                <div className="mt-4 space-y-2 text-xs text-left bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold">Try saying:</p>
                  <p>• "I need to pay my electricity bill of $150 by Friday"</p>
                  <p>• "Remind me to buy groceries tomorrow at 5pm"</p>
                  <p>• "Schedule a doctor's appointment next Monday at 2pm"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.extraction?.detected && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <div className="text-xs opacity-75">
                            Detected: {getItemTypeDisplayName(message.extraction.item_type)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}