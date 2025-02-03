import { ActionDispatch, createContext, ReactElement, useReducer } from "react";
import { initialState, reducer, State } from "../reducer";

interface AssistantContextInterface {
  state: State;
  dispatch: ActionDispatch<[action: { type: string; payload: any }]>;
}

export const AssistantContext = createContext<AssistantContextInterface>(
  {} as AssistantContextInterface
);

const AssistantProvider = ({ children }: { children: ReactElement }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = {
    state,
    dispatch,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};

export default AssistantProvider;
