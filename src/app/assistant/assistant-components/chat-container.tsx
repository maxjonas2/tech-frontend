import { ChatMessage, ChatMessageRole } from "@/interfaces/chat";
import { cn } from "@/utils/helper-functions";
import {
  Dispatch,
  Fragment,
  KeyboardEvent,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import Markdown from "react-markdown";
import { AssistantContext } from "../providers";
import { actions, createAction } from "../reducer";
import { MessageSuggestion } from "../utilities";
import MessageSkeleton from "./message-skeleton";

interface ChatMessagesContainerProps {
  onRequestSubmitMessage: (message: string) => void;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  messages: ChatMessage[];
  isAwaitingResponse: boolean;
  isAwaitingSuggestions: boolean;
  streamingMessage: string;
}

function ChatMessagesContainer({
  messages,
  onRequestSubmitMessage,
  isAwaitingResponse,
  isAwaitingSuggestions,
  streamingMessage,
}: ChatMessagesContainerProps) {
  const [currentUserMessage, setCurrentUserMessage] = useState<string>("");

  const { state, dispatch } = useContext(AssistantContext);

  const suggestions = state.chatSuggestions;

  const submitMessage = (message: string) => {
    console.log("Submitting message:", message);
    if (!message.trim()) return;
    setCurrentUserMessage("");
    onRequestSubmitMessage(message);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitMessage(currentUserMessage);
    }
  };

  function getMessageContainerClass(role: ChatMessageRole, isVisible: boolean) {
    return cn(
      "chat-message",
      role,
      role === "user" ? "ml-32 bg-zinc-200" : "ml-0",
      "p-4 rounded-2xl mb-3",
      isVisible ? "visible" : "hidden"
    );
  }

  const handleSuggestionClick = (suggestion: string) => {
    // TODO Perform logic to adjust the message based on the suggestion if needed
    dispatch(createAction(actions.SET_CHAT_SUGGESTIONS, []));
    submitMessage(suggestion);
  };

  return (
    <>
      <div className="chat-outer-container h-screen relative markdown">
        <div className="chat-messages-container h-full overflow-y-scroll pb-[102px] pt-4 px-4">
          {messages.map(({ id, role, content, isVisible }, idx) => {
            const isFirstMessage = idx === 0;
            const isLastMessage = idx === messages.length - 1;
            return (
              <Fragment key={idx}>
                <div
                  key={id}
                  className={getMessageContainerClass(role, isVisible ?? true)}
                >
                  <MessageContent
                    content={content}
                    index={idx}
                    isLastMessage={isLastMessage}
                  />
                </div>
              </Fragment>
            );
          })}
          {streamingMessage && (
            <div className="chat-message streaming-message p-4 rounded-2xl mb-3">
              <Markdown>{streamingMessage}</Markdown>
            </div>
          )}
          <div className="suggestions-container flex flex-wrap gap-2">
            {suggestions &&
              suggestions.map((suggestion, sIdx) => {
                return (
                  <SuggestionPill
                    key={sIdx}
                    index={sIdx}
                    suggestion={suggestion}
                    onClick={handleSuggestionClick}
                  />
                );
              })}
          </div>
        </div>
      </div>

      {/* If we’re waiting for the assistant, show a placeholder */}
      {isAwaitingResponse || isAwaitingSuggestions ? (
        <AssistantMessagePlaceholder />
      ) : null}

      <div className="chat-input-container absolute left-4 right-4 bottom-2 top-auto">
        <textarea
          className="w-full p-2 rounded-lg resize-none"
          placeholder="Enter a message..."
          rows={3}
          value={currentUserMessage}
          onChange={(e) => setCurrentUserMessage(e.target.value)}
          onKeyUp={handleKeyPress}
        />
      </div>
    </>
  );
}

function AssistantMessagePlaceholder() {
  return <MessageSkeleton />;
}

const SuggestionPill: React.FC<{
  suggestion: MessageSuggestion;
  index: number;
  onClick: (suggestionContent: string) => void;
}> = ({ suggestion, index, onClick }) => {
  const transitionDelay = index * 400;

  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsShown(true);
    });
  }, [suggestion.content]);

  return (
    <button
      onClick={() => onClick(suggestion.content)}
      className={cn(
        `bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200 text-sm relative transition-all ease-in-out`,
        !suggestion.available && "cursor-auto bg-gray-200 text-gray-500"
      )}
      style={{
        transitionDelay: `${transitionDelay}ms`,
        transitionDuration: "0.8s",
        opacity: isShown ? 1 : 0,
        top: isShown ? "0px" : "-40px",
      }}
    >
      {suggestion.content}
    </button>
  );
};

const MessageContent: React.FC<{
  content: string;
  index: number;
  isLastMessage: boolean;
}> = ({ content, index, isLastMessage }) => {
  const [shownText, setShownText] = useState<string>("");

  useEffect(() => {
    const charList = content.split("");
    const charLen = charList.length;
    charList.forEach((char, idx) => {
      setTimeout(() => {
        setShownText((prev) => prev + char);
      }, idx * 20);
    });
  }, [index === 0]);

  if (index === 0) {
    return <strong className="font-semibold">{shownText}</strong>;
  } else {
    return <Markdown>{content}</Markdown>;
  }
};

export default ChatMessagesContainer;
