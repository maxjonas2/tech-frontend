export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  isVisible?: boolean;
};
