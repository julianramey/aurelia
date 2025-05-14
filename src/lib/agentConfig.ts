/**
 * Checks if the OpenAI API key is configured in the environment variables.
 * @returns {boolean} True if the API key is set, false otherwise.
 */
export const isApiConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return !!apiKey && apiKey !== 'your_openai_api_key_here'; // Also check it's not the placeholder
};

import OpenAI from 'openai';

// Define ChatMessage type here or import if it's in a shared types file
export interface ChatMessage {
  id: string; // Or number, depending on your Agent.tsx implementation
  role: 'user' | 'assistant' | 'system';
  content: string | { type: string, text: string }; // Allow for simple string or structured content
}

let openai: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side browser usage
      });
    } else {
      console.error("OpenAI API key is missing or is still the placeholder. Please set VITE_OPENAI_API_KEY in your .env file.");
    }
  }
  return openai;
};

/**
 * Gets a response from the AI agent using the OpenAI API.
 * 
 * @param {ChatMessage[]} history - The conversation history.
 * @param {string} userMessageContent - The content of the current user's message.
 * @param {string} activeSystemPrompt - The system prompt to use.
 * @param {number} currentTemperature - The temperature setting for the API call.
 * @returns {Promise<string>} A promise that resolves with the agent's response.
 */
export const getAgentResponse = async (history: ChatMessage[], userMessageContent: string, activeSystemPrompt: string, currentTemperature: number): Promise<string> => {
  if (!isApiConfigured()) {
    return "OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.";
  }
  const client = getOpenAIClient();
  if (!client) {
    return "Failed to initialize OpenAI client. Check API key.";
  }

  try {
    console.log("Sending to OpenAI - History:", history, "User Message:", userMessageContent);

    const processedHistory = history.map(msg => {
      let messageContent: string;
      if (typeof msg.content === 'string') {
        messageContent = msg.content;
      } else if (msg.content && typeof msg.content === 'object' && 'text' in msg.content) {
        messageContent = msg.content.text;
      } else {
        messageContent = JSON.stringify(msg.content);
      }
      return {
        role: msg.role,
        content: messageContent
      };
    });

    const apiMessages = [
      { role: "system" as const, content: activeSystemPrompt },
      ...processedHistory,
      { role: "user" as const, content: userMessageContent }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: apiMessages,
      temperature: currentTemperature
    });

    const response = completion.choices[0]?.message?.content?.trim() || "No response from AI.";
    console.log("Received response from OpenAI:", response);
    return response;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    if (error instanceof OpenAI.APIError) {
      return `OpenAI API Error: ${error.status} ${error.name} ${error.message}`;
    }
    return "An error occurred while fetching the AI response.";
  }
};

/**
 * Generates a concise title for a chat conversation using the OpenAI API.
 * 
 * @param {ChatMessage[]} conversationMessages - An array of messages from the conversation to summarize.
 * @returns {Promise<string>} A promise that resolves with the generated title.
 */
export const generateChatTitle = async (conversationMessages: ChatMessage[]): Promise<string> => {
  if (!isApiConfigured()) {
    return "Chat Title (API not configured)";
  }
  const client = getOpenAIClient();
  if (!client) {
    return "Chat Title (Client init failed)";
  }

  if (!conversationMessages || conversationMessages.length === 0) {
    return "New Chat"; // Default if no messages provided
  }

  // Prepare messages for the title generation prompt
  const messagesForTitlePrompt = conversationMessages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : msg.content.text // Assuming ChatMessage content structure
  }));

  const titlePrompt = "Summarize the following conversation into a very short title (max 5-7 words). Do not use quotes around the title. For example: \"Brand Collaboration Ideas\" or \"Negotiating Rates\". Conversation to summarize:";

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // Using a cheaper/faster model for titles might be sufficient
      messages: [
        { role: "system", content: "You are a helpful assistant that creates concise chat titles." },
        { role: "user", content: `${titlePrompt}\n\n${messagesForTitlePrompt.map(m => `${m.role}: ${m.content}`).join('\n')}` }
      ],
      temperature: 0.3,
      max_tokens: 20 // Limit tokens for a short title
    });
    let title = completion.choices[0]?.message?.content?.trim() || "Chat Summary";
    // Remove quotes if AI adds them
    title = title.replace(/^["'“‘]|["'”’]$/g, '');
    return title;
  } catch (error) {
    console.error("Error generating chat title:", error);
    // Fallback title in case of error
    const firstUserMessage = conversationMessages.find(msg => msg.role === 'user');
    return firstUserMessage ? (firstUserMessage.content as string).substring(0, 30) + '...' : "Chat";
  }
};

// You might want to add other configuration or helper functions here,
// for example, to initialize the OpenAI client with the API key. 