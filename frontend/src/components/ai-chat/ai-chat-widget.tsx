import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "./chat-message";
import { VoiceSettingsDialog } from "./voice-settings-dialog";
import {
  generateAIResponse,
  generateQuickSuggestions,
  ChatMessage as ChatMessageType,
  ChatContext,
} from "@/lib/ai-chat-engine";
import { billStorage, errandStorage, appointmentStorage } from "@/lib/storage";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { showSuccess, showError } from "@/utils/toast";
import { sendMessageToClaude } from "@/lib/claude-api";
import {
  Bill,
  Errand,
  Appointment,
  BillCategory,
  ErrandCategory,
  ErrandPriority,
} from "@/types";

interface ExtractionType {
  item_type: "bill" | "errand" | "task" | "appointment";
  extracted_data: ExtractedData;
}

interface ExtractedData {
  name?: string;
  amount?: string;
  dueDate?: string;
  category?: BillCategory;
  type?: ErrandCategory;
  description?: string;
  priority?: ErrandPriority;
  title?: string;
  date?: string;
  time?: string;
  location?: string;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
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

  const quickSuggestions = generateQuickSuggestions(getContext());

  // Text-to-speech hook
  const {
    speak,
    cancel: cancelSpeech,
    isSpeaking,
    voices,
  } = useTextToSpeech({
    rate,
    pitch,
    volume,
    voice: selectedVoice,
  });

  // Speech recognition hook
  const {
    isListening,
    isSupported: isSpeechSupported,
    toggleListening,
  } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputValue(transcript);
      // Auto-send after voice input
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
    if (messages.length === 0) {
      const greeting: ChatMessageType = {
        id: "greeting",
        role: "assistant",
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

  // Auto-speak AI responses
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !isTyping) {
        // Clean up the message for speech (remove markdown formatting)
        const contentToSpeak =
          typeof lastMessage.content === "string"
            ? lastMessage.content
            : lastMessage.content.message;
        const cleanText = contentToSpeak
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/\n/g, ". ")
          .replace(/•/g, "")
          .replace(/📋|🛒|📅|💰|⚠️|✨|📊|💵|🔄|⏳/g, "");
        speak(cleanText);
      }
    }
  }, [messages, autoSpeak, isTyping, speak]);

  // Set default voice
  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      // Try to find an English voice
      const englishVoice = voices.find((v) => v.lang.startsWith("en"));
      setSelectedVoice(englishVoice || voices[0]);
    }
  }, [voices, selectedVoice]);
  const handleExtraction = (extraction: ExtractionType) => {
    const { item_type, extracted_data } = extraction;

    try {
      if (item_type === "bill") {
        const newBill: Bill = {
          id: `bill-${Date.now()}`,
          name: extracted_data.name || "Untitled Bill",
          amount: parseFloat(extracted_data.amount || "0") || 0,
          dueDate: extracted_data.dueDate || new Date().toISOString(),
          category: (extracted_data.category as BillCategory) || "general",
          status: "upcoming",
          recurrence: "as-billed",
          reminderDays: [],
          reminderEnabled: false,
          providerEmails: [],
          paymentHistory: [],
          autoPayEnabled: false,
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        billStorage.add(newBill);
        showSuccess(`Bill "${newBill.name}" has been added successfully!`);
      } else if (item_type === "errand" || item_type === "task") {
        const newErrand: Errand = {
          id: `errand-${Date.now()}`,
          type: (extracted_data.type as ErrandCategory) || "groceries",
          description: extracted_data.description || "No description",
          priority: (extracted_data.priority as ErrandPriority) || "normal",
          status: "pending",
          preferredDate: "",
          adminNotes: "",
          reminderEnabled: false,
          reminderHours: 24,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        errandStorage.add(newErrand);
        showSuccess(
          `Task "${newErrand.description}" has been added successfully!`
        );
      } else if (item_type === "appointment") {
        const newAppointment: Appointment = {
          id: `appointment-${Date.now()}`,
          title: extracted_data.title || "Untitled Appointment",
          date: extracted_data.date || new Date().toISOString(),
          time: extracted_data.time || "12:00",
          location: extracted_data.location || "TBD",
          type: "personal",
          notes: "",
          recurrence: "one-time",
          reminderMinutes: 60,
          reminderEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        appointmentStorage.add(newAppointment);
        showSuccess(
          `Appointment "${newAppointment.title}" has been scheduled!`
        );
      }
    } catch (e) {
      console.error("Failed to save extracted data:", e);
      showError("There was an error saving the item.");
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    cancelSpeech();

    try {
      const context = getContext();
      const aiResponse = await sendMessageToClaude(
        [...messages, userMessage].map((m) => ({
          role: m.role,
          content:
            typeof m.content === "string" ? m.content : m.content.message,
        })),
        context
      );
      console.log("AI Response:", aiResponse);

      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponse.message || "Sorry, I couldn't understand that.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle data extraction
      try {
        const parsedContent = JSON.parse(assistantMessage.content as string);
        console.log("Parsed AI Content:", parsedContent);
        if (parsedContent.extraction?.status === "complete") {
          handleExtraction(parsedContent.extraction);
        }
      } catch (e) {
        // Not a JSON response, likely a simple string message. Ignore.
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 z-50 group"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse"></span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col border-2 border-purple-200">
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
                    {isListening ? "🎤 Listening..." : "Always here to help"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Voice settings button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                  title="Voice settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {/* Mute/unmute button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 h-8 w-8"
                  title={autoSpeak ? "Mute AI voice" : "Enable AI voice"}
                >
                  {autoSpeak ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
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
                {messages.map((message) => (
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
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium">
                  Quick suggestions:
                </p>
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
                placeholder={
                  isListening ? "Listening..." : "Ask me anything..."
                }
                className="flex-1"
                disabled={isListening}
              />

              {/* Voice input button */}
              {isSpeechSupported && (
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className={isListening ? "animate-pulse" : ""}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* Send button */}
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
                  <div
                    className="w-1 h-3 bg-purple-600 rounded-full animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1 h-4 bg-purple-600 rounded-full animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1 h-3 bg-purple-600 rounded-full animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  ></div>
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
