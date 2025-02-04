import { Dispatch, SetStateAction } from "react";
import { actions, createAction } from "./reducer";
import { ChatMessage } from "@/interfaces/chat";
import { createChatMessage } from "@/utils/chat-helpers";
import { NewsItem } from "./assistant-components/client-news";
import { sleep } from "@/utils/helper-functions";

export type HandleMessageRequest = (
  inputMessage: string,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  dispatch: Dispatch<any>,
  api_url: string
) => Promise<void>;

export type AggreagatedClientInfo = {
  clientInfo: {
    knowledgeGraph?: Object;
    results: {
      question: string;
      responses: {
        content: string;
        title: string;
        url: string;
        news_source: string;
      }[];
      source: string;
    }[];
  };
  sector: string;
  sectorNews: {
    tav: {
      question: string;
      response: { content: string; title: string; url: string }[];
    }[];
    serper: {
      searchParameters: { q: string };
      news: { title: string; source: string; snippet: string; link: string }[];
    };
  };
  summarizedInfo: string;
};

export type MessageSuggestion = {
  content: string;
  available: boolean;
};

export type ClientNewsResponse = {
  question: string;
  engine: string;
  responses: NewsItem[];
};

export type InformationExtraction = {
  question: string;
  information: { [k: string]: string | string[] } | string;
};

// This is specific to calling the /message endpoint, which directly sends a user message to the model
const handleMessageRequest: HandleMessageRequest = async (
  inputMessage,
  setMessages,
  dispatch,
  api_url
) => {
  const url = `${api_url}/message`;
  try {
    dispatch(createAction(actions.SET_AWAITING_RESPONSE, true));

    // Awaiting the response from the server
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: inputMessage }),
    });

    dispatch(createAction(actions.SET_AWAITING_RESPONSE, false));

    if (!response.ok) {
      console.log("Failed to fetch message response");
      return;
    }

    // Awaiting the JSON-converted response from the 'response' object
    const responseData = await response.json();
    setMessages((prevMessages) => [
      ...prevMessages,
      createChatMessage(responseData.message, "assistant"),
    ]);
  } catch (error) {
    dispatch(createAction(actions.SET_AWAITING_RESPONSE, false));
    console.log("Error during message request:", error);
  }
};

function initializeSeversideChatbot(api_url: string): void {
  const url = `${api_url}/actions/initChatbot`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        console.log("API call failed with status:", response.status);
        return Promise.reject("API call failed");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log("Error calling API:", error);
    });
}

function getIntentFromHeaders(headers: Headers) {
  if (!headers.has("X-Intent") || !headers.has("x-intent")) {
    console.log("No intent found in headers.");
    return null;
  }

  const intent = headers.get("X-Intent")!;
  const argument = headers.get("X-Intent-Argument")!;

  return { intent, argument };
}

// Specifically fetches client info from the API.
// This is NOT a chat message request endpoint.
async function fetchClientInfo(
  clientName: string,
  dispatch: Dispatch<any>,
  api_url: string
): Promise<void> {
  dispatch(createAction(actions.SET_LEFT_PANEL_LOADING, true));
  const urlGeneralInfo = `${api_url}/comp_info/${clientName}?mode=basic&q=general`;
  const urlExtractions = `${api_url}/comp_info/${clientName}?mode=basic&q=extractions`;
  const urlClientNews = `${api_url}/comp_info/${clientName}?mode=basic&q=clientNews`;
  const urlSectorNews = `${api_url}/comp_info/${clientName}?mode=basic&q=sectorNews`;

  console.log("Fake fetching client info for:", clientName);

  // fetch(`${api_url}/set_client`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ content: clientName }),
  // })
  //   .then((response) => {
  //     if (!response.ok) {
  //       console.log("Failed to set client.");
  //       return;
  //     } else {
  //       return response.json();
  //     }
  //   })
  //   .then(console.log)
  //   .catch(console.error);

  // Fetching general information
  fetch(urlGeneralInfo)
    .then((response) => {
      if (!response.ok) {
        console.log("Failed to fetch general info");
        return;
      }
      return response.json();
    })
    .then((data) => {
      dispatch(createAction(actions.SET_CLIENT_GENERAL_INFO, data));
    })
    .catch(console.error);

  await sleep(1000);

  dispatch(createAction(actions.SET_LEFT_PANEL_LOADING, false));
  dispatch(createAction(actions.SET_LEFT_DASHBOARD_SHOWN, true));
  dispatch(createAction(actions.SET_LEFT_DASHBOARD_WIDGETS_SHOWN, true));

  // Fetching extractions
  fetch(urlExtractions)
    .then((response) => {
      if (!response.ok) {
        console.log("Failed to fetch extractions");
        return;
      }
      return response.json();
    })
    .then((data) => {
      if (data && "extracted_data" in data) {
        console.log("From dispatcher, extractions:", data["extracted_data"]);
        const cleanedExtractions = data["extracted_data"].filter(
          (extraction: Object) => Object.keys(extraction).length > 0
        );
        dispatch(
          createAction(actions.SET_CLIENT_EXTRACTIONS, cleanedExtractions)
        );
      }
    })
    .catch(console.error);

  await sleep(1000);

  // Fetching client news
  fetch(urlClientNews)
    .then((response) => {
      if (!response.ok) {
        console.log("Failed to fetch client news");
        return;
      }
      return response.json();
    })
    .then((data: ClientNewsResponse[]) => {
      dispatch(createAction(actions.SET_CLIENT_NEWS, data));
      // console.log("From dispatcher, news:", data);
    })
    .catch(console.error);

  await sleep(1000);

  // Fetching sector news
  fetch(urlSectorNews)
    .then((response) => {
      if (!response.ok) {
        console.log("Failed to fetch sector news");
        return;
      }
      return response.json();
    })
    .then((data) => {
      dispatch(createAction(actions.SET_SECTOR_NEWS, data));
    })
    .catch(console.error);
}

const decoder = new TextDecoder("utf-8");

function createStreamingWritable(
  onChunk: (chunk: string) => void,
  onFinish: (text: string) => void
): WritableStream<Uint8Array> {
  let accumulatedMessage = "";

  return new WritableStream({
    write(chunk) {
      const chunkAsString = decoder.decode(chunk, { stream: true });
      accumulatedMessage += chunkAsString;
      onChunk(accumulatedMessage);
    },
    close() {
      onFinish(accumulatedMessage);
    },
  });
}

function handleIntent(
  intent: string,
  argument: string,
  dispatch: Dispatch<any>
) {
  if (intent == "client_info") {
    // setClient(argument);
    dispatch(createAction(actions.SET_CLIENT, argument));

    console.log(`INTENT: '${intent}' | ARGUMENT: '${argument}'`);
    dispatch(createAction(actions.SET_LEFT_DASHBOARD_SHOWN, true));
    dispatch(createAction(actions.SET_LEFT_DASHBOARD_WIDGETS_SHOWN, true));
    dispatch(createAction(actions.SET_INTENT_INFO, { intent, argument }));
  } else {
    console.log(`INTENT: '${intent}' | ARGUMENT: '${argument}'`);
  }
}

const SUGGESTIONS_SAMPLE = [
  "Preciso de insights sobre uma empresa",
  "Obtenha materiais e arquivos relacionados a ABC",
  "Informações sobre um cliente",
  "Me ajude a fazer XYZ",
  "Já tivemos algum contato com Empresa Teste S.A.?",
];

function getCustomerSuggestions(clientName: string): MessageSuggestion[] {
  const CUSTOMER_SUGGESTIONS_SAMPLE: MessageSuggestion[] = [
    { content: "Resuma as últimas notícias sobre {term}", available: true },
    {
      content: "Possíveis ofertas e oportunidades de negócio com {term}",
      available: true,
    },
    { content: "Arquivos e PPTs relacionados a {term}", available: false },
    { content: "Notícias do setor da empresa/cliente {term}", available: true },
    { content: "Já tivemos algum contato com {term}?", available: false },
    {
      content: "Quais são os maiores competidores do {term}?",
      available: false,
    },
  ];

  return CUSTOMER_SUGGESTIONS_SAMPLE.map(({ content, available }) => ({
    content: content.replace("{term}", clientName),
    available,
  }));
}

export {
  handleMessageRequest,
  initializeSeversideChatbot,
  getIntentFromHeaders,
  fetchClientInfo,
  createStreamingWritable,
  handleIntent,
  SUGGESTIONS_SAMPLE,
  getCustomerSuggestions,
};
