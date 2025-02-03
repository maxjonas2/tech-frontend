'use client'

import AssistantContainer from "./assistant-components/assistant-container"
import AssistantProvider from "./providers"

const AssistantPage = () => {
  return (
    <AssistantProvider>
      <AssistantContainer />
    </AssistantProvider>
  )
}

export default AssistantPage