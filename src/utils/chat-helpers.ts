import { ChatMessage, ChatMessageRole } from "@/interfaces/chat";
import { generateRandomId } from "./helper-functions";
import { MessageSuggestion } from "@/app/assistant/utilities";

function createChatMessage(
  content: string,
  role: ChatMessageRole,
  isVisible: boolean = true
): ChatMessage {
  return {
    content,
    role,
    id: Date.now().toString() + generateRandomId(),
    isVisible,
  };
}

export { createChatMessage };
