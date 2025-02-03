import {createContext, ReactElement} from 'react'

export const ChatContext = createContext({})

const ChatProvider = ({children} : {children: ReactElement}) => {
    return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>
}

export default ChatProvider