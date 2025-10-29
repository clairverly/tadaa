import { Home, ShoppingBag, Calendar, FileText, AlertCircle, Settings, Sparkles, X, Send, Mic, MicOff, Volume2, VolumeX, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatMessage as ChatMessageComponent } from '@/components/ai-chat/chat-message';
import { VoiceSettingsDialog } from '@/components/ai-chat/voice-settings-dialog';
import { ChatMessage as ChatMessageType } from '@/lib/ai-chat-engine';
import { sendMessageToClaude, ChatContext } from '@/lib/claude-api';
import { billStorage, errandStorage, appointmentStorage } from '@/lib/storage';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { showSuccess, showError } from '@/utils/toast';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Bills', href: '/bills', icon: FileText },
  { name: 'Tasks', href: '/errands', icon: ShoppingBag },
  { name: 'Schedules', href: '/appointments', icon: Calendar },
  { name: 'Profile', href: '/settings', icon: Settings },
  { name: 'Help', href: '/urgent-help', icon: AlertCircle },
];

export function Sidebar() {
  const location = useLocation();
  const [showAIChat, setShowAIChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load context data
  const getContext = (): ChatContext => ({
    bills: billStorage.getAll(),
    errands: errandStorage.getAll(),
    appointments: appointmentStorage.getAll(),
  });

  // Quick suggestions based on context
  const getQuickSuggestions = (): string[] => {
    const context = getContext();
    const suggestions: string[] = [];
    
    if (context.bills.length > 0) {
      suggestions.push('Show my bills');
    }
    if (context.errands.length > 0) {
      suggestions.push('Show my tasks');
    }
    if (context.appointments.length > 0) {
      suggestions.push('Show my appointments');
    }
    suggestions.push('Create a new task');
    
    return suggestions.slice(0, 4);
  };

  const quickSuggestions = getQuickSuggestions();

  // Text-to-speech hook
  const { speak, cancel: cancelSpeech, isSpeaking, voices } = useTextToSpeech({
    rate,
    pitch,
    volume,
    voice: selectedVoice,
  });

  // Speech recognition hook
  const { isListening, isSupported: isSpeechSupported, toggleListening } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputValue(transcript);
      setTimeout(() => {
        if (transcript.trim()) {
          handleSendMessage(transcript);
        }
      }, 500);
    },
    onError: (error) => {
      showError(`Voice input error: ${error}`);
    },
  });

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && showAIChat) {
      const greeting: ChatMessageType = {
        id: 'greeting',
        role: 'assistant',
        content: `👋 Hi! I'm your Tadaa AI assistant. I can help you manage your bills, tasks, and appointments. What would you like to know?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    }
  }, [showAIChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (showAIChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAIChat]);

  // Auto-speak AI responses
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isTyping) {
        const cleanText = lastMessage.content
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/\n/g, '. ')
          .replace(/•/g, '')
          .replace(/📋|🛒|📅|💰|⚠️|✨|📊|💵|🔄|⏳/g, '');
        speak(cleanText);
      }
    }
  }, [messages, autoSpeak, isTyping, speak]);

  // Set default voice
  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      setSelectedVoice(englishVoice || voices[0]);
    }
  }, [voices, selectedVoice]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    cancelSpeech();

    try {
      const context = getContext();
      
      // Convert messages to Claude API format
      const claudeMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call Claude API
      const responseText = await sendMessageToClaude(claudeMessages, context);
      
      const aiResponse: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      showError(error.message || 'Failed to get AI response');
      
      // Add error message to chat
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check if you\'re logged in.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMute = () => {
    if (isSpeaking) {
      cancelSpeech();
    }
    setAutoSpeak(!autoSpeak);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3 relative">
            {navigation.slice(0, 3).map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href === '/settings' && (
                  location.pathname.startsWith('/settings') ||
                  location.pathname === '/notifications' ||
                  location.pathname === '/payments' ||
                  location.pathname === '/profile'
                )) ||
                (item.href === '/appointments' && location.pathname === '/appointments') ||
                (item.href === '/' && location.pathname === '/');
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px]',
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <item.icon className={cn(
                    'h-6 w-6',
                    isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    isActive ? 'font-semibold' : ''
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* AI Assistant Button - In Menu */}
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px] relative group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600">AI</span>
            </button>

            {navigation.slice(3).map((item) => {
            const isActive = 
              location.pathname === item.href || 
              (item.href === '/settings' && (
                location.pathname.startsWith('/settings') ||
                location.pathname === '/notifications' ||
                location.pathname === '/payments' ||
                location.pathname === '/profile'
              )) ||
              (item.href === '/appointments' && location.pathname === '/appointments') ||
              (item.href === '/' && location.pathname === '/');
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px]',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                )}
              >
                <item.icon className={cn(
                  'h-6 w-6',
                  isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  isActive ? 'font-semibold' : ''
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>

      {/* AI Chat Modal */}
     {showAIChat && (
       <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAIChat(false)}>
         <Card className="w-full max-w-2xl h-[600px] flex flex-col border-2 border-purple-200" onClick={(e) => e.stopPropagation()}>
           {/* Header */}
           <CardHeader className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-t-lg pb-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                   <Sparkles className="h-5 w-5" />
                 </div>
                 <div>
                   <CardTitle className="text-lg">Tadaa AI Assistant</CardTitle>
                   <p className="text-xs text-purple-100">
                     {isListening ? '🎤 Listening...' : 'Always here to help'}
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-1">
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={() => setIsSettingsOpen(true)}
                   className="text-white hover:bg-white/20 h-8 w-8"
                   title="Voice settings"
                 >
                   <SettingsIcon className="h-4 w-4" />
                 </Button>
                 
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={toggleMute}
                   className="text-white hover:bg-white/20 h-8 w-8"
                   title={autoSpeak ? 'Mute AI voice' : 'Enable AI voice'}
                 >
                   {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                 </Button>

                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={() => setShowAIChat(false)}
                   className="text-white hover:bg-white/20 h-8 w-8"
                 >
                   <X className="h-5 w-5" />
                 </Button>
               </div>
             </div>
           </CardHeader>

           {/* Messages */}
           <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
             <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
               <div className="space-y-4">
                 {messages.map(message => (
                   <ChatMessageComponent key={message.id} message={message} />
                 ))}
                 
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
                 placeholder={isListening ? "Listening..." : "Ask me anything..."}
                 className="flex-1"
                 disabled={isListening}
               />
               
               {isSpeechSupported && (
                 <Button
                   onClick={toggleListening}
                   variant={isListening ? "destructive" : "outline"}
                   size="icon"
                   className={isListening ? "animate-pulse" : ""}
                   title={isListening ? "Stop recording" : "Start voice input"}
                 >
                   {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                 </Button>
               )}

               <Button
                 onClick={() => handleSendMessage()}
                 disabled={!inputValue.trim() || isListening}
                 className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                 size="icon"
               >
                 <Send className="h-4 w-4" />
               </Button>
             </div>

             {/* Voice status indicator */}
             {isListening && (
               <div className="mt-2 flex items-center justify-center gap-2 text-xs text-purple-600">
                 <div className="flex gap-1">
                   <div className="w-1 h-3 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-1 h-3 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                 </div>
                 <span className="font-medium">Listening to your voice...</span>
               </div>
             )}

             {/* Speaking indicator */}
             {isSpeaking && (
               <div className="mt-2 flex items-center justify-center gap-2 text-xs text-blue-600">
                 <Volume2 className="h-3 w-3 animate-pulse" />
                 <span className="font-medium">AI is speaking...</span>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
     )}

     {/* Voice Settings Dialog */}
     <VoiceSettingsDialog
       open={isSettingsOpen}
       onOpenChange={setIsSettingsOpen}
       voices={voices}
       selectedVoice={selectedVoice}
       onVoiceChange={setSelectedVoice}
       rate={rate}
       onRateChange={setRate}
       pitch={pitch}
       onPitchChange={setPitch}
       volume={volume}
       onVolumeChange={setVolume}
       autoSpeak={autoSpeak}
       onAutoSpeakChange={setAutoSpeak}
     />
    </>
  );
}