"use client";

import { ChatMessage } from "@/interfaces/chat";
import { createChatMessage } from "@/utils/chat-helpers";
import { generateRandomId, j2s } from "@/utils/helper-functions";
import { useContext, useEffect, useRef, useState } from "react";
import { AssistantContext } from "../providers";
import { actions, createAction } from "../reducer";
import {
  createStreamingWritable,
  fetchClientInfo,
  getCustomerSuggestions,
  getIntentFromHeaders,
  handleIntent,
  MessageSuggestion,
} from "../utilities";
import ChatMessagesContainer from "./chat-container";
import LeftDashboard from "./left-dashboard";
import RightSidePanel from "./right-panel";

/** Interfaces */

const firstMessageWithSuggestions: ChatMessage = {
  id: generateRandomId(),
  role: "assistant",
  content: "Olá! Sobre qual cliente ou empresa você gostaria de falar?",
};

/** Main Component */
export default function AssistantContainer() {
  const { dispatch, state } = useContext(AssistantContext);

  const API_URL = state.ipAddress.replace(/\/$/, "") + ":" + state.portNumber;

  const [interfaceMessages, setInterfaceMessages] = useState<ChatMessage[]>([
    firstMessageWithSuggestions,
  ]);
  const [fetchingSuggestions, setFetchingSuggestions] =
    useState<boolean>(false);

  const [serverLog, setServerLog] = useState<string[]>([]);

  const firstMessageSuggestions: MessageSuggestion[] = [
    { content: "Apple", available: true },
    { content: "Google", available: true },
    { content: "Microsoft", available: true },
    { content: "Amazon", available: true },
    { content: "Facebook", available: true },
  ];

  const suggestionsShown = useRef<boolean>(false);

  function showFirstMessageSuggestions() {
    if (suggestionsShown.current) return;
    const newMessage = createChatMessage(
      "Olá! Sobre qual cliente ou empresa você gostaria de falar?",
      "assistant",
      true
    );
    setInterfaceMessages([newMessage]);
    suggestionsShown.current = true;
  }

  // ==============================
  // Dashboard state variables
  // ==============================

  // const [clientNews, setClientNews] = useState<NewsItem[] | null>(null);
  // const [sectorNews, setSectorNews] = useState<NewsItem[] | null>(null);

  // ==============================
  // ==============================

  const [streamingMessage, setStreamingMessage] = useState<string>("");

  const suggestionsFetched = useRef<boolean>(false);

  useEffect(() => {
    console.log("JSON INFO:", state.jsonInfo);
  }, [state.jsonInfo]);

  function addInterfaceMessage(message: ChatMessage) {
    setInterfaceMessages((prev) => [...prev, message]);
  }

  // WIDGETS INFO AND CONTENT STATE

  // let { socket } = useWebSocket(API_URL);

  if (interfaceMessages.length == 2) {
    // Trigger data fetching. The server will build a knowledge graph and send it back.
    // Meanwhile, the assistant will ask the user what they want to know about the client.
  }

  async function handleRequestSubmitMessage(inputMessage: string) {
    // TODO Implement debouncing logic to prevent multiple requests in quick succession
    const newUserMessage = createChatMessage(inputMessage, "user");
    const newAssistantMessage = createChatMessage(
      "Entendi! O que você gostaria de saber sobre esse cliente?",
      "assistant",
      true
    );

    // TODO Make sure this is in fact the client name
    if (interfaceMessages.length === 1) {
      // TODO Implement logic to validate client name
      console.log("[DEBUG] Initiating client info fetch...");
      const clientName = inputMessage;
      dispatch(createAction(actions.SET_CLIENT, clientName));
      fetchClientInfo(clientName, dispatch, API_URL);
      setInterfaceMessages([...interfaceMessages, newUserMessage]);

      setTimeout(() => {
        addInterfaceMessage(newAssistantMessage);
        dispatch(
          createAction(
            actions.SET_CHAT_SUGGESTIONS,
            getCustomerSuggestions(inputMessage)
          )
        );
      }, 1000);
    } else if (interfaceMessages.length > 1) {
      addInterfaceMessage(createChatMessage(inputMessage, "user"));
      submitMessage(inputMessage);
    } else {
      console.log("Else case");
    }
  }

  function fetchSuggestions() {
    // TODO We'll refactor this to use the WebSocket connection instead of the HTTP API
    if (fetchingSuggestions) return;
    console.log(
      "Fetching suggestions based on messages:",
      interfaceMessages.slice(-1, -2)
    );
    setFetchingSuggestions(true);
    suggestionsFetched.current = false;

    fetch(`${API_URL}/get_followup_questions`, {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          console.log("Failed to fetch suggestions:", response.status);
          return Promise.reject("Failed to fetch suggestions");
        }
        return response.json();
      })
      .then((data: string[]) => {
        if (data) {
          dispatch(
            createAction(
              actions.SET_CHAT_SUGGESTIONS,
              data.map((item) => ({ content: item, available: true }))
            )
          );
        } else {
          dispatch(
            createAction(actions.SET_CHAT_SUGGESTIONS, [
              { content: "No suggestions available", available: false },
            ])
          );
        }
      })
      .catch((error) => void console.log("Error fetching suggestions:", error))
      .finally(() => {
        suggestionsFetched.current = true;
        setFetchingSuggestions(false);
      });
  }

  async function submitMessage(
    inputMessage: string,
    isFirstUserMessage: boolean = false
  ) {
    // TODO Change the client_name query parameter to be dynamic
    const url = `${API_URL}/message?isFirstUserMessage=${isFirstUserMessage}&client_name=${state.client}`;
    // TODO Validate input message
    // TODO This will later be refactored in the server so it handles both data fetching and WebSocket communication/interaction
    // Some of the data will be fetched from the server, and some will be streamed through the WebSocket connection
    // This can be achieved through the design pattern known as the "Adapter Pattern"

    dispatch(createAction(actions.SET_AWAITING_RESPONSE, true));
    dispatch(createAction(actions.SET_RIGHT_PANEL_LOADING, true));

    console.log("Submitting via handleMessageRequest:", inputMessage);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ content: inputMessage }),
        headers: { "Content-Type": "application/json" },
      });

      dispatch(createAction(actions.SET_AWAITING_RESPONSE, false));

      if (!response.ok) {
        console.log("API call failed with status:", response.status);
        return;
      }

      const intent = getIntentFromHeaders(response.headers);
      if (intent) {
        handleIntent(intent.intent, intent.argument, dispatch);
      }

      const contentType = response.headers.get("Content-Type");
      /** If it's JSON, handle it directly. If not, stream the response. */
      if (contentType === "application/json") {
        const data = await response.json();
        const newMessage = createChatMessage(
          j2s(data?.content || "No content"),
          "assistant",
          true
        );
        addInterfaceMessage(newMessage);
      } else {
        response.body?.pipeTo(
          createStreamingWritable(setStreamingMessage, function (finalText) {
            /** Once streaming is finished, add the assistant message to the array. */
            addInterfaceMessage(createChatMessage(finalText, "assistant"));
            /** Reset streaming display since we’re finished. */
            setStreamingMessage("");
            /** Fetch next question suggestions */
            fetchSuggestions();
          })
        );
      }
    } catch (error) {
      dispatch(createAction(actions.SET_AWAITING_RESPONSE, false));
      console.log("Error calling API:", error);
    }
  }

  function toggleDashboard() {
    dispatch(
      createAction(
        actions.SET_LEFT_DASHBOARD_WIDGETS_SHOWN,
        !state.leftDashboardWidgetsShown
      )
    );
    dispatch(
      createAction(actions.SET_LEFT_DASHBOARD_SHOWN, !state.leftDashboardShown)
    );
  }

  return (
    <div className="h-screen flex bg-zinc-100 relative overflow-hidden">
      <LeftDashboard
        isLoading={state.isLeftPanelLoading}
        clientName={state.client}
        shown={state.leftDashboardShown}
        clientNews={state.clientNews}
        sectorNews={state.sectorNews}
        generalInfo={state.summarizedInfo}
        widgetsShown={state.leftDashboardWidgetsShown}
        toggleDashboard={toggleDashboard}
      />
      <div className="chatbot-container flex-1 relative">
        <ChatMessagesContainer
          setMessages={setInterfaceMessages}
          messages={interfaceMessages}
          isAwaitingResponse={state.isAwaitingResponse}
          // TODO This will later be refactored to use the reducer instead of useState
          isAwaitingSuggestions={fetchingSuggestions}
          streamingMessage={streamingMessage}
          onRequestSubmitMessage={handleRequestSubmitMessage}
        />
      </div>
      <RightSidePanel
        isOpen={state.isRightPanelOpen}
        json={state.jsonInfo}
        loading={state.isRightPanelLoading}
        serverLog={serverLog}
      />
    </div>
  );
}
