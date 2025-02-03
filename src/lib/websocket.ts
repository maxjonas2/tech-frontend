import { useRef, useEffect } from "react";

const RECONNECT_INTERVAL = 2000; // Start with 2 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

let reconnectAttempts = 0;
const pendingMessages: string[] = []; // Store messages that arrive while reconnecting

export function useWebSocket(API_URL: string) {
  const socket = useRef<WebSocket | null>(null);
  const browserId = useRef<string>(Math.random().toString(36).slice(2));

  function handleClose(event: CloseEvent) {
    console.log("[DEBUG] WebSocket disconnected:", event);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = RECONNECT_INTERVAL * 2 ** reconnectAttempts; // Exponential backoff
      console.log(
        `[DEBUG] Attempting reconnection in ${delay / 1000} seconds...`
      );
      reconnectAttempts++;

      setTimeout(() => {
        setupWebSocket();
      }, delay);
    } else {
      console.log(
        "[DEBUG] Max reconnection attempts reached. Stopping retries."
      );
    }
  }

  function setupWebSocket() {
    if (socket.current) {
      socket.current.removeEventListener("open", handleOpen);
      socket.current.removeEventListener("message", handleMessage);
      socket.current.removeEventListener("error", handleError);
      socket.current.removeEventListener("close", handleClose);
    }

    socket.current = new WebSocket(
      `${API_URL}/ws/${browserId.current || "abcd1234"}`
    );

    socket.current.addEventListener("open", handleOpen);
    socket.current.addEventListener("message", handleMessage);
    socket.current.addEventListener("error", handleError);
    socket.current.addEventListener("close", handleClose);
  }

  function handleOpen() {
    console.log("[DEBUG] WebSocket connection established.");
    reconnectAttempts = 0; // Reset reconnection attempts on success

    // Resend any messages that were received while reconnecting
    while (pendingMessages.length > 0) {
      console.log("[DEBUG] Processing queued message:", pendingMessages[0]);
      handleMessage({ data: pendingMessages.shift()! } as MessageEvent);
    }
  }

  function handleMessage(event: MessageEvent) {
    let wsData;
    console.log("Got data from WS.", event.data);

    try {
      wsData = JSON.parse(event.data);
    } catch (error) {
      wsData = event.data;
    }

    // If disconnected, store messages in a queue to be processed after reconnection
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      console.log("[DEBUG] WebSocket not open, queuing message.");
      pendingMessages.push(event.data);
    }
  }

  function handleError(event: Event) {
    console.log("[DEBUG] WebSocket error:", event);
  }

  useEffect(() => {
    console.log("[DEBUG] Setting up WebSocket connection...");
    setupWebSocket();

    return () => {
      if (socket.current) {
        console.log(
          "[DEBUG] Closing WebSocket connection due to component unmount."
        );
        socket.current.close();
      }
    };
  }, []);

  return { socket };
}
