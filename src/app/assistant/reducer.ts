import { NewsItem } from "./assistant-components/client-news";
import { ClientNewsResponse, MessageSuggestion } from "./utilities";

// Define the shape of your state
export interface State {
  isSecondTabOpen: boolean;
  isRightPanelOpen: boolean;
  isAwaitingResponse: boolean;
  streamingMessage: string;
  leftDashboardShown: boolean;
  jsonInfo: Object | null;
  isRightPanelLoading: boolean;
  isLeftPanelLoading: boolean;
  client: string;
  summarizedInfo: string;
  leftDashboardWidgetsShown: boolean;
  intentInfo: {
    intent: string;
    argument: string;
  } | null;
  ipAddress: string;
  portNumber: string;
  chatSuggestions: MessageSuggestion[];
  clientGeneralInfo: string;
  clientNews: ClientNewsResponse;
  sectorNews: NewsItem[] | any;
  clientExtractions: any;
}

// Define action types
export const actions = {
  SET_MESSAGES: "SET_MESSAGES",
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_RIGHT_PANEL_OPEN: "SET_RIGHT_PANEL_OPEN",
  SET_AWAITING_RESPONSE: "SET_AWAITING_RESPONSE",
  SET_STREAMING_MESSAGE: "SET_STREAMING_MESSAGE",
  SET_LEFT_DASHBOARD_SHOWN: "SET_LEFT_DASHBOARD_SHOWN",
  SET_RIGHT_PANEL_LOADING: "SET_RIGHT_PANEL_LOADING",
  SET_CLIENT: "SET_CLIENT",
  SET_LEFT_DASHBOARD_WIDGETS_SHOWN: "SET_LEFT_DASHBOARD_WIDGETS_SHOWN",
  SET_INTENT_INFO: "SET_INTENT_INFO",
  SET_CLIENT_NEWS: "SET_CLIENT_NEWS",
  SET_SECTOR_NEWS: "SET_SECTOR_NEWS",
  SET_SUMMARIZED_INFO: "SET_SUMMARIZED_INFO",
  SET_LEFT_PANEL_LOADING: "SET_LEFT_PANEL_LOADING",
  SET_SECOND_TAB_OPEN: "SET_SECOND_TAB_OPEN",
  SET_IP_ADDRESS: "SET_IP_ADDRESS",
  SET_PORT_NUMBER: "SET_PORT_NUMBER",
  SET_CHAT_SUGGESTIONS: "SET_CHAT_SUGGESTIONS",
  SET_CLIENT_EXTRACTIONS: "SET_CLIENT_EXTRACTIONS",
  SET_CLIENT_GENERAL_INFO: "SET_CLIENT_GENERAL_INFO",
};

// Generic action creator
export function createAction<T>(type: string, payload: T) {
  return { type, payload };
}

// Reducer function
export function reducer(
  state: State,
  action: { type: string; payload: any }
): State {
  switch (action.type) {
    case actions.SET_RIGHT_PANEL_OPEN:
      return { ...state, isRightPanelOpen: action.payload };
    case actions.SET_AWAITING_RESPONSE:
      return { ...state, isAwaitingResponse: action.payload };
    case actions.SET_STREAMING_MESSAGE:
      return { ...state, streamingMessage: action.payload };
    case actions.SET_LEFT_DASHBOARD_SHOWN:
      return { ...state, leftDashboardShown: action.payload };
    case actions.SET_RIGHT_PANEL_LOADING:
      return { ...state, isRightPanelLoading: action.payload };
    case actions.SET_CLIENT:
      return { ...state, client: action.payload };
    case actions.SET_LEFT_DASHBOARD_WIDGETS_SHOWN:
      return { ...state, leftDashboardWidgetsShown: action.payload };
    case actions.SET_INTENT_INFO:
      return { ...state, intentInfo: action.payload };
    case actions.SET_CLIENT_NEWS:
      return { ...state, clientNews: action.payload };
    case actions.SET_SECTOR_NEWS:
      return { ...state, sectorNews: action.payload };
    case actions.SET_SUMMARIZED_INFO:
      return { ...state, summarizedInfo: action.payload };
    case actions.SET_LEFT_PANEL_LOADING:
      return { ...state, isLeftPanelLoading: action.payload };
    case actions.SET_SECOND_TAB_OPEN:
      return { ...state, isSecondTabOpen: action.payload };
    case actions.SET_IP_ADDRESS:
      return { ...state, ipAddress: action.payload };
    case actions.SET_PORT_NUMBER:
      return { ...state, portNumber: action.payload };
    case actions.SET_CHAT_SUGGESTIONS:
      return { ...state, chatSuggestions: action.payload };
    case actions.SET_CLIENT_EXTRACTIONS:
      return { ...state, clientExtractions: action.payload };
    case actions.SET_CLIENT_GENERAL_INFO:
      return { ...state, clientGeneralInfo: action.payload };
    default:
      return state;
  }
}

export const initialState: State = {
  isSecondTabOpen: false,
  isRightPanelOpen: true,
  isAwaitingResponse: false,
  isLeftPanelLoading: false,
  streamingMessage: "",
  leftDashboardShown: false,
  jsonInfo: null,
  isRightPanelLoading: false,
  client: "",
  summarizedInfo: "",
  leftDashboardWidgetsShown: false,
  intentInfo: null,
  clientNews: [],
  sectorNews: [],
  ipAddress: "http://localhost",
  portNumber: "4000",
  chatSuggestions: [],
  clientExtractions: [],
  clientGeneralInfo: "",
};
