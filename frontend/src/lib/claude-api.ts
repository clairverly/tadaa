import api from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  bills: any[];
  errands: any[];
  appointments: any[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  context?: ChatContext;
}

export interface ChatResponse {
  message: string;
  extraction: {
    detected: boolean;
    item_type: string;
    extracted_data: any;
    missing_fields: string[];
    status: string;
    confidence: number;
  };
}

/**
 * Send a message to Claude AI and get a response
 */
export async function sendMessageToClaude(
  messages: ChatMessage[],
  context?: ChatContext
): Promise<any> {
  try {
    const response = await api.post<ChatResponse>("/api/ai/chat", {
      messages,
      context,
    });

    let msg = response.data?.message;
    if (!msg) return "No response from AI.";

    // Step 1: Remove Markdown code block fences (```json or ```)
    msg = msg.replace(/```json|```/g, "").trim();

    // Step 2: Try parsing recursively until we get a JS object
    let parsed: any = msg;
    try {
      while (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch (e) {
      console.warn("⚠️ Could not parse message JSON, returning raw text");
      return msg;
    }

    console.log("✅ Final parsed Claude response:", parsed);
    return parsed; // or parsed.message if you only want the text
  } catch (error: any) {
    console.error("Claude API error:", error);

    if (error.response?.status === 401) {
      throw new Error("Please log in to use the AI assistant");
    } else if (error.response?.status === 500) {
      throw new Error(
        "AI service is temporarily unavailable. Please try again later."
      );
    } else {
      throw new Error("Failed to get AI response. Please try again.");
    }
  }
}
