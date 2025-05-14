import React, { useState, useRef, useEffect } from 'react';
import DashboardNav from '../components/DashboardNav';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  UserCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';
import { getAgentResponse, ChatMessage, isApiConfigured, generateChatTitle } from '../lib/agentConfig';
import ReactMarkdown from 'react-markdown';
import {
  XMarkIcon as XMarkIconMini
} from '@heroicons/react/20/solid';
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Message types
type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// Updated ChatHistoryItem interface
interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  messages: Message[];
  hasGeneratedTitle?: boolean;
  isPinned?: boolean;
}

// Define Personality structure
interface Personality {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  initialGreeting: string;
}

// Define available personalities with unique initial greetings
const availablePersonalities: Personality[] = [
  {
    id: 'aurelia-default',
    name: 'Aurelia (Default)',
    description: 'Friendly, supportive big-sister energy.',
    initialGreeting: 'Hey Julian! So excited to chat. What creative ideas are we diving into today?',
    systemPrompt: `You are Aurelia, the friendly AI assistant built into the Aurelia web app—an AI-powered talent management platform for beauty influencers.\nYou speak in a lighthearted, upbeat, and helpful tone (think supportive big-sister energy), not dry or robotic.\nYour core mission is to help beauty creators aged ~15–25 grow their brand: brainstorming content ideas, drafting outreach emails, explaining metrics, suggesting partnership pitch angles, etc.\nYou can chat about anything, but gently steer conversations back to supporting their influencer goals whenever it makes sense.\nKeep it fun, concise, and genuine—no over-the-top slang, just warm and approachable.\n\n--- Interaction Style Note ---\nAlso, try to subtly mirror my way of talking, including my tone, slang (if I use any), and emoji use, to make our conversation feel more natural and engaging. But remember to always keep your main personality as Aurelia!`
  },
  {
    id: 'professional-coach',
    name: 'Professional Coach',
    description: 'Direct, strategic, and results-oriented.',
    initialGreeting: 'Hello Julian. What are we working on today?',
    systemPrompt: `You are a professional talent coach AI for beauty influencers, integrated into the Aurelia platform.\nYour tone is direct, strategic, and focused on actionable advice to achieve measurable growth.\nProvide clear steps, data-driven insights, and concise recommendations.\nFocus on brand development, monetization strategies, and professional conduct.\nAvoid casual language; maintain a formal and authoritative tone.\n\n--- Interaction Style Note ---\nAlso, try to subtly mirror my way of talking, including my tone and sentence structure, to make our conversation feel more natural and engaging, while maintaining your core professional coaching personality.`
  },
  {
    id: 'creative-spark',
    name: 'Creative Spark',
    description: 'Imaginative, playful, and full of ideas.',
    initialGreeting: 'Woohoo, Julian! Ready to brainstorm some AMAZINGLY fun and wild ideas? What are we cooking up?',
    systemPrompt: `You are the Creative Spark AI, a brainstorming partner for beauty influencers on the Aurelia platform.\nYour personality is imaginative, playful, and bursting with unconventional ideas.\nEncourage experimentation and out-of-the-box thinking for content, branding, and collaborations.\nUse vivid language and a highly enthusiastic tone. Help users break creative blocks.\n\n--- Interaction Style Note ---\nAlso, try to subtly mirror my creative energy and way of talking, including my tone, slang (if I use any), and emoji use, to make our brainstorming even more fun and effective! Always keep your core Creative Spark personality.`
  },
  // Add 2 more distinct personalities here later if needed
];

// Define Trait structure for custom agent personalities
interface Trait {
  id: string;
  name: string;
  description?: string;
  promptContribution: string;
}

// Define available traits for custom agent
const availableTraits: Trait[] = [
  { id: 'trait-witty', name: 'Witty', description: 'Adds a touch of humor.', promptContribution: "I like to add a touch of humor and wit to our chats." },
  { id: 'trait-formal', name: 'Formal', description: 'Uses professional language.', promptContribution: "I'll keep our conversation professional and formal." },
  { id: 'trait-concise', name: 'Concise', description: 'Gets straight to the point.', promptContribution: "I try to be brief and get straight to the point." },
  { id: 'trait-detailed', name: 'Detailed', description: 'Provides thorough explanations.', promptContribution: "I prefer to give thorough and detailed explanations." },
  { id: 'trait-emoji', name: 'Uses Emojis', description: 'Includes emojis to be more expressive.', promptContribution: "I like using emojis to make our chat a bit more expressive!" },
  { id: 'trait-storyteller', name: 'Storyteller', description: 'Explains concepts through stories.', promptContribution: "I often use stories and analogies to explain things." },
  { id: 'trait-action-oriented', name: 'Action-Oriented', description: 'Focuses on actionable advice.', promptContribution: "I focus on giving you actionable steps and practical advice." },
  // New traits for beauty influencers:
  { id: 'trait-trendy', name: 'Trendy', description: 'Keeps up with the latest beauty news.', promptContribution: "I'll keep you up-to-date with the latest beauty trends and viral looks." },
  { id: 'trait-honest', name: 'Honest & Real', description: 'Values authenticity and transparency.', promptContribution: "I believe in keeping it real and giving honest, authentic advice." },
  { id: 'trait-glamorous', name: 'Glamorous', description: 'Focuses on high-end, aspirational content.', promptContribution: "I love all things glam and can help you with high-end, aspirational looks and branding." },
  { id: 'trait-tutorial-focused', name: 'Tutorial Focused', description: 'Excels at step-by-step explanations.', promptContribution: "I'm great at breaking down makeup and beauty techniques into easy-to-follow tutorials." },
  { id: 'trait-body-positive', name: 'Body Positive', description: 'Promotes self-love and acceptance.', promptContribution: "I'm all about self-love and promoting body positivity in the beauty space." },
  { id: 'trait-eco-conscious', name: 'Eco-Conscious', description: 'Highlights sustainable and ethical beauty.', promptContribution: "I can help you find and talk about sustainable and ethically-minded beauty choices." },
  { id: 'trait-skincare-geek', name: 'Skincare Geek', description: 'Loves discussing skincare ingredients and routines.', promptContribution: "I'm a total skincare geek and love diving deep into ingredients and routines." },
  { id: 'trait-makeup-artist', name: 'Makeup Artist', description: 'Provides expert makeup advice and tips.', promptContribution: "Think of me as your personal makeup artist, ready to help with any look!" },
  // New trait for mirroring user style:
  { id: 'trait-adaptive-style', name: 'Adaptive', description: 'Tries to match your communication style.', promptContribution: "I'll try to match your communication style (like tone, slang, and emojis) to make our chat flow better."}
];

// TRACK (the pill background) - Copied from MediaKitEditor.tsx
const TRACK_CLASSES = cn(
  "relative inline-flex h-6 w-11 rounded-full p-1 transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", // Standard focus
  "disabled:cursor-not-allowed disabled:opacity-50", // Standard disabled
  "data-[state=unchecked]:bg-gray-200", // OFF state from Agent.tsx (was input in ShadCN)
  "data-[state=checked]:bg-rose" // ON state from Agent.tsx (was primary in ShadCN)
);

// THUMB (the little circle) - Copied and adapted from MediaKitEditor.tsx
const THUMB_CLASSES = cn(
  "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform", // Base from Agent.tsx attempt
  "data-[state=unchecked]:translate-x-0", // OFF state
  "data-[state=checked]:translate-x-5" // ON state (was translate-x-5 in ShadCN)
);

export default function Agent() {
  // State for messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-asst-' + Date.now(),
      role: 'assistant',
      content: availablePersonalities[0].initialGreeting,
      timestamp: new Date()
    }
  ]);
  
  // State for user input
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // State for chat history - now includes messages array
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() => {
    const storedHistory = localStorage.getItem('aureliaAgentChatHistory');
    if (storedHistory) {
      try {
        const parsedHistory: ChatHistoryItem[] = JSON.parse(storedHistory);
        return parsedHistory.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })),
          hasGeneratedTitle: chat.hasGeneratedTitle === undefined ? true : chat.hasGeneratedTitle,
          isPinned: chat.isPinned || false
        }));
      } catch (e) {
        console.error("Failed to parse chat history from localStorage", e);
        return []; // Fallback to empty if parsing fails
      }
    }
    // Default initial history if nothing in localStorage (or for the very first run)
    return [
      {
        title: 'Rate Negotiation Tips',
        id: 'chat-1',
        preview: 'How to negotiate higher rates with brands...',
        messages: [
          { id: 'ch1-1', role: 'assistant', content: 'Hi Julian! What would you like to discuss today?', timestamp: new Date(Date.now() - 100000) },
          { id: 'ch1-2', role: 'user', content: 'I need help with rate negotiation.', timestamp: new Date(Date.now() - 90000) },
          { id: 'ch1-3', role: 'assistant', content: 'Okay, I can help with that! First, always research the brand and their typical rates.', timestamp: new Date(Date.now() - 80000) }
        ],
        hasGeneratedTitle: true,
        isPinned: false
      }
    ]; 
  });
  
  // State for current chat ID (to identify which history item is loaded)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // State for mobile view
  const [showSidebar, setShowSidebar] = useState(true);
  
  // State for API configuration status
  const [apiConfigured, setApiConfigured] = useState<boolean>(isApiConfigured());
  
  // State for active menu
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
  
  // Ref for message container to auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Glow animation for the agent name
  const glowIntensity = useMotionValue(0);
  const textShadow = useTransform(
    glowIntensity,
    [0, 0.5, 1],
    [
      '0 0 0px rgba(126, 105, 171, 0)',
      '0 0 15px rgba(126, 105, 171, 0.4)',
      '0 0 25px rgba(126, 105, 171, 0.7)'
    ]
  );
  
  // Ref for the menu to handle click outside
  const menuRef = useRef<HTMLDivElement>(null);
  
  // State for settings modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<string>(() => {
    return localStorage.getItem('aureliaAgentPersonalityId') || availablePersonalities[0].id;
  });
  const [temperature, setTemperature] = useState<number>(() => {
    const storedTemp = localStorage.getItem('aureliaAgentTemperature');
    return storedTemp ? parseFloat(storedTemp) : 0.7; // Default temperature
  });
  const [customInstructions, setCustomInstructions] = useState<string>(() => {
    return localStorage.getItem('aureliaAgentCustomInstructions') || ''; // Default to empty string
  });
  
  // State for Response Length
  type ResponseLength = 'concise' | 'balanced' | 'detailed';
  const [responseLength, setResponseLength] = useState<ResponseLength>(() => {
    return (localStorage.getItem('aureliaAgentResponseLength') as ResponseLength) || 'balanced';
  });

  // State for Emoji Usage
  type EmojiUsage = 'none' | 'subtle' | 'expressive';
  const [emojiUsage, setEmojiUsage] = useState<EmojiUsage>(() => {
    return (localStorage.getItem('aureliaAgentEmojiUsage') as EmojiUsage) || 'subtle';
  });
  
  // State for Smart Title Toggle
  const [enableSmartTitles, setEnableSmartTitles] = useState<boolean>(() => {
    const stored = localStorage.getItem('aureliaAgentEnableSmartTitles');
    return stored ? JSON.parse(stored) : true; // Default to true
  });
  
  // Custom Agent Configuration State
  const [isUsingCustomAgent, setIsUsingCustomAgent] = useState<boolean>(() => {
    return JSON.parse(localStorage.getItem('aureliaIsUsingCustomAgent') || 'false');
  });
  const [customAgentName, setCustomAgentName] = useState<string>(() => {
    return localStorage.getItem('aureliaCustomAgentName') || 'My Custom Agent';
  });
  const [customAgentInitialGreeting, setCustomAgentInitialGreeting] = useState<string>(() => {
    return localStorage.getItem('aureliaCustomAgentInitialGreeting') || 'Hello! How can I assist you today?';
  });
  const [customAgentSystemPrompt, setCustomAgentSystemPrompt] = useState<string>(() => {
    return localStorage.getItem('aureliaCustomAgentSystemPrompt') || 'You are a helpful AI assistant.';
  });
  const [selectedTraitIds, setSelectedTraitIds] = useState<string[]>(() => {
    const storedTraits = localStorage.getItem('aureliaAgentSelectedTraitIds');
    return storedTraits ? JSON.parse(storedTraits) : [];
  });
  const [isClearHistoryConfirmVisible, setIsClearHistoryConfirmVisible] = useState<boolean>(false);
  
  // Helper to get the current personality object
  const getCurrentPersonality = () => {
    return availablePersonalities.find(p => p.id === selectedPersonalityId) || availablePersonalities[0];
  };
  
  // Effect to save chatHistory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aureliaAgentChatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Check API configuration on component mount
  useEffect(() => {
    setApiConfigured(isApiConfigured());
  }, []);
  
  // Effect to potentially update initial greeting if personality changes AND it's a fresh chat
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant' && !currentChatId) {
      const greeting = isUsingCustomAgent ? customAgentInitialGreeting : getCurrentPersonality().initialGreeting;
      if (messages[0].content !== greeting) {
        setMessages([
          {
            id: 'init-asst-' + Date.now(),
            role: 'assistant',
            content: greeting,
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [selectedPersonalityId, isUsingCustomAgent, customAgentInitialGreeting, messages, currentChatId]);
  
  // Effect to load messages when currentChatId changes or set initial greeting
  useEffect(() => {
    if (currentChatId) {
      const selectedChat = chatHistory.find(chat => chat.id === currentChatId);
      if (selectedChat) {
        setMessages(selectedChat.messages);
      } else {
        // Chat not found, reset to a new chat state with current personality greeting
        setCurrentChatId(null); // This will trigger the else block below in the next render cycle if not already null
        setMessages([
          {
            id: 'error-chat-asst-' + Date.now(),
            role: 'assistant',
            content: getCurrentPersonality().initialGreeting, // Use current personality's greeting
            timestamp: new Date()
          }
        ]);
      }
    } else {
      // No currentChatId (new chat or initial load)
      // Ensure the initial message reflects the current personality if messages state is empty or doesn't match
      const currentPersonality = getCurrentPersonality();
      const greeting = isUsingCustomAgent ? customAgentInitialGreeting : currentPersonality.initialGreeting;
      if (messages.length === 0 || 
         (messages.length === 1 && messages[0].role === 'assistant' && messages[0].content !== greeting && !messages[0].id.startsWith('error-chat')) ||
         (messages.length > 1 && currentChatId === null) 
      ) {
        setMessages([
          {
            id: 'init-asst-' + Date.now(),
            role: 'assistant',
            content: greeting,
            timestamp: new Date()
          }
        ]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [currentChatId, chatHistory, isUsingCustomAgent, customAgentInitialGreeting]);

  // Click outside to close menu effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuChatId(null);
      }
    };
    if (openMenuChatId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuChatId]);
  
  // Effect to save selectedPersonalityId to localStorage
  useEffect(() => {
    localStorage.setItem('aureliaAgentPersonalityId', selectedPersonalityId);
  }, [selectedPersonalityId]);

  // Effect to save temperature to localStorage
  useEffect(() => {
    localStorage.setItem('aureliaAgentTemperature', temperature.toString());
  }, [temperature]);
  
  // Effect to save customInstructions to localStorage
  useEffect(() => {
    localStorage.setItem('aureliaAgentCustomInstructions', customInstructions);
  }, [customInstructions]);
  
  // Effect to save responseLength to localStorage
  useEffect(() => {
    localStorage.setItem('aureliaAgentResponseLength', responseLength);
  }, [responseLength]);

  // Effect to save emojiUsage to localStorage
  useEffect(() => {
    localStorage.setItem('aureliaAgentEmojiUsage', emojiUsage);
  }, [emojiUsage]);
  
  // Effect to save enableSmartTitles to localStorage
  useEffect(() => {
    localStorage.setItem('aureliaAgentEnableSmartTitles', JSON.stringify(enableSmartTitles));
  }, [enableSmartTitles]);
  
  // useEffects for Custom Agent state persistence
  useEffect(() => {
    localStorage.setItem('aureliaIsUsingCustomAgent', JSON.stringify(isUsingCustomAgent));
  }, [isUsingCustomAgent]);
  useEffect(() => {
    localStorage.setItem('aureliaCustomAgentName', customAgentName);
  }, [customAgentName]);
  useEffect(() => {
    localStorage.setItem('aureliaCustomAgentInitialGreeting', customAgentInitialGreeting);
  }, [customAgentInitialGreeting]);
  useEffect(() => {
    localStorage.setItem('aureliaCustomAgentSystemPrompt', customAgentSystemPrompt);
  }, [customAgentSystemPrompt]);
  useEffect(() => {
    localStorage.setItem('aureliaAgentSelectedTraitIds', JSON.stringify(selectedTraitIds));
  }, [selectedTraitIds]);
  
  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const currentMessageContent: string = input;
    const timestamp = new Date();
    const userMessageForUI: Message = { id: Date.now().toString() + '-user', role: 'user', content: currentMessageContent, timestamp };
    
    const isNewChatSession = currentChatId === null;
    let activeChatIdForThisSend = currentChatId;
    let tempMessages = [...messages];

    if (isNewChatSession) {
      let titleForNewChat: string;
      let shouldSetGeneratedTitleFlag = false; // Determines if hasGeneratedTitle should be true from the start

      if (enableSmartTitles) {
        // Temporary title that will be replaced by AI summary
        titleForNewChat = currentMessageContent.substring(0, 35) + (currentMessageContent.length > 35 ? '...' : '');
        // If title is very short, add a generic prefix to make it look like a placeholder
        if (titleForNewChat.length < 10) titleForNewChat = "New: " + titleForNewChat;
        shouldSetGeneratedTitleFlag = false; // AI will generate the title
      } else {
        // Generic title if smart titles are off
        titleForNewChat = "Chat - " + timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        shouldSetGeneratedTitleFlag = true; // This title is final, no AI summary needed
      }

      activeChatIdForThisSend = Date.now().toString() + '-chat';
      const initialAssistantMessageForNewChat: Message = { 
        id: 'init-asst-' + activeChatIdForThisSend, 
        role: 'assistant', 
        content: getCurrentPersonality().initialGreeting, 
        timestamp: new Date(timestamp.getTime() -1)
      };
      const newChatEntry: ChatHistoryItem = {
        id: activeChatIdForThisSend,
        title: titleForNewChat,
        preview: `User: ${currentMessageContent.substring(0, 40)}...`,
        messages: [initialAssistantMessageForNewChat, userMessageForUI],
        hasGeneratedTitle: shouldSetGeneratedTitleFlag,
        isPinned: false
      };
      setChatHistory(prev => [newChatEntry, ...prev]);
      setCurrentChatId(activeChatIdForThisSend);
      tempMessages = newChatEntry.messages;
      setMessages(tempMessages);
    } else {
      tempMessages = [...messages, userMessageForUI];
      setMessages(tempMessages);
    }
    
    setInput('');
    setIsTyping(true);
    
    try {
      const historyForApi = tempMessages.filter(m => m.id !== userMessageForUI.id).map(m => ({id: m.id, role: m.role, content: m.content} as ChatMessage));
      const systemPromptForCall = getCurrentSystemPrompt();
      const response = await getAgentResponse(historyForApi, currentMessageContent, systemPromptForCall, temperature);
      const assistantMessage: Message = { id: Date.now().toString() + '-asst', role: 'assistant', content: response, timestamp: new Date() };
      const updatedMessages = [...tempMessages, assistantMessage];
      setMessages(updatedMessages);

      setChatHistory(prevHistory => 
        prevHistory.map(chat => {
          if (chat.id === activeChatIdForThisSend) {
            // Smart title generation only if enabled AND not already generated (or explicitly set as final)
            if (enableSmartTitles && !chat.hasGeneratedTitle && updatedMessages.length >= 3) {
              generateChatTitle(updatedMessages.slice(0, 3))
                .then(newTitle => {
                  setChatHistory(prev => prev.map(c => c.id === activeChatIdForThisSend ? { ...c, title: newTitle, hasGeneratedTitle: true } : c));
                });
              // Return with current (possibly temp) title, the .then will update it again
              return { ...chat, messages: updatedMessages, preview: `Assistant: ${response.substring(0,50)}...` };
            } 
            // If smart titles are disabled, hasGeneratedTitle was already set correctly when newChatEntry was created.
            // So, no specific 'else if' needed here to lock in a title if smart titles are off.
            return { ...chat, messages: updatedMessages, preview: `Assistant: ${response.substring(0,50)}...` };
          }
          return chat;
        })
      );
    } catch (error) { 
      console.error('Error getting agent response:', error);
      const errorMessage: Message = { id: Date.now().toString() + '-err', role: 'assistant', content: 'Sorry, I encountered an error processing your request.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally { 
      setIsTyping(false); 
    }
  };
  
  // Function to delete a chat from history
  const handleDeleteChat = (chatIdToDelete: string) => {
    setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatIdToDelete));
    
    // If the deleted chat was the currently active one, reset the main chat view
    if (currentChatId === chatIdToDelete) {
      setCurrentChatId(null);
      // The useEffect for currentChatId will handle setting the initial message for a new session
      setMessages([
        {
          id: 'new-chat-asst-' + Date.now(), 
          role: 'assistant',
          content: getCurrentPersonality().initialGreeting,
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Function to create a new chat
  const handleNewChat = () => {
    setCurrentChatId(null); // This will trigger the useEffect to set personality-specific initial messages
    setMessages([
      {
        id: 'new-chat-asst-' + Date.now(),
        role: 'assistant',
        content: getCurrentPersonality().initialGreeting,
        timestamp: new Date()
      }
    ]);
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Message variants for animation
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  const toggleChatMenu = (chatId: string) => {
    setOpenMenuChatId(prev => (prev === chatId ? null : chatId));
  };
  
  const handleTogglePinChat = (chatIdToToggle: string) => {
    setChatHistory(prevHistory =>
      prevHistory.map(chat =>
        chat.id === chatIdToToggle ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
    setOpenMenuChatId(null); // Close menu after action
  };
  
  // Prepare sorted chat history for rendering
  const sortedChatHistory = [...chatHistory].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // For items with same pinned status, you might want to sort by recency (e.g., based on last message timestamp or ID)
    // For now, keep original order among pinned/unpinned groups if no other sort criteria is added.
    return 0; 
  });
  
  // Updated to include response length and emoji usage instructions
  const getCurrentSystemPrompt = () => {
    if (isUsingCustomAgent) {
      // If using custom agent, construct prompt from selected traits
      const customAgentPromptBase = "I'm your AI assistant, and here's how I'll approach our conversations:";
      if (selectedTraitIds.length > 0) {
        let traitBasedPrompt = customAgentPromptBase;
        selectedTraitIds.forEach(traitId => {
          const trait = availableTraits.find(t => t.id === traitId);
          if (trait) {
            traitBasedPrompt += `\n- ${trait.promptContribution}`;
          }
        });
        return traitBasedPrompt;
      }
      // Fallback if no traits are selected but custom agent is on
      return customAgentSystemPrompt; // Default: "You are a helpful AI assistant."
    }

    // Original logic for preset personalities
    const personality = getCurrentPersonality();
    let finalPrompt = personality.systemPrompt;

    // Add response length instruction
    switch (responseLength) {
      case 'concise':
        finalPrompt += "\n\n--- Response Style Guide ---\nKeep your responses concise and to the point.";
        break;
      case 'detailed':
        finalPrompt += "\n\n--- Response Style Guide ---\nProvide detailed and comprehensive explanations.";
        break;
      // 'balanced' needs no extra instruction, assumed by personality prompt
    }

    // Add emoji usage instruction
    switch (emojiUsage) {
      case 'none':
        finalPrompt += "\nDo not use any emojis in your responses.";
        break;
      case 'expressive':
        finalPrompt += "\nFeel free to use emojis to make your responses more expressive and engaging.";
        break;
      // 'subtle' needs no extra instruction, or could have a mild one like "Use emojis sparingly"
    }

    if (customInstructions.trim() !== '') {
      finalPrompt += `\n\n--- User's Custom Instructions ---\n${customInstructions.trim()}`;
    }
    return finalPrompt;
  };
  
  const handleClearAllHistory = () => {
    // Instead of window.confirm, show the custom confirmation dialog
    setIsClearHistoryConfirmVisible(true);
  };

  const executeClearAllHistory = () => {
    setChatHistory([]);
    setCurrentChatId(null); 
    setMessages([
      {
        id: 'cleared-asst-' + Date.now(),
        role: 'assistant',
        content: getActiveInitialGreeting(), // Use active greeting
        timestamp: new Date()
      }
    ]);
    setIsClearHistoryConfirmVisible(false); // Close confirmation dialog
    setIsSettingsModalOpen(false); // Close settings modal
  };
  
  const getActiveInitialGreeting = () => {
    return isUsingCustomAgent ? customAgentInitialGreeting : getCurrentPersonality().initialGreeting;
  };
  
  const getActiveAgentName = () => {
    if (isUsingCustomAgent) {
      return customAgentName;
    }
    return getCurrentPersonality().name; // Use preset personality name if not custom
  };
  
  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav />
      <main className="relative h-[calc(100vh-4rem)] pt-4 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {/* Title Section - Mobile Only */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <h1 className="text-2xl font-display font-medium text-charcoal">Your Agent</h1>
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 bg-white rounded-lg shadow-sm border border-blush/20"
            >
              {showSidebar ? <XMarkIcon className="h-5 w-5 text-taupe" /> : <ArchiveBoxIcon className="h-5 w-5 text-taupe" />}
            </button>
          </div>
          
          <div className="flex flex-1 h-full overflow-hidden gap-4">
            {/* Sidebar - Chat History */}
            {(showSidebar || window.innerWidth >= 768) && (
              <motion.div 
                className="w-full md:w-64 lg:w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-blush/20 flex flex-col overflow-hidden md:relative absolute z-10 inset-0 md:inset-auto"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 border-b border-blush/10 flex items-center justify-between">
                  <h2 className="font-medium text-charcoal">Chat History</h2>
                  <button 
                    onClick={handleNewChat}
                    className="p-2 text-taupe hover:text-rose rounded-lg hover:bg-rose/5 transition-colors"
                  >
                    <span className="sr-only">New Chat</span>
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-2">
                  {sortedChatHistory.length > 0 ? (
                    <div className="space-y-2">
                      {sortedChatHistory.map((chat) => (
                        <div key={chat.id} className="relative">
                          <button
                            className={`w-full text-left p-3 rounded-lg transition-colors flex justify-between items-center ${
                              currentChatId === chat.id 
                                ? 'bg-rose/10 text-rose' 
                                : 'hover:bg-blush/10 text-taupe'
                            }`}
                            onClick={() => setCurrentChatId(chat.id)}
                          >
                            <div className="flex-1 min-w-0 pr-8">
                              <div className="flex items-center">
                                {chat.isPinned && <BookmarkIcon className="h-4 w-4 text-rose mr-2 flex-shrink-0" />}
                                <span className="font-medium truncate">{chat.title}</span>
                              </div>
                              <div className="text-xs truncate opacity-80 pl-6">{chat.preview}</div>
                            </div>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleChatMenu(chat.id); }}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 text-taupe/70 hover:text-rose rounded-md hover:bg-rose/10 z-10"
                            aria-label="Chat options"
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>

                          {openMenuChatId === chat.id && (
                            <div 
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 mr-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 focus:outline-none py-1"
                              role="menu"
                            >
                              <button
                                onClick={() => handleTogglePinChat(chat.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                role="menuitem"
                              >
                                <BookmarkIcon className={`h-4 w-4 mr-2 ${chat.isPinned ? 'text-rose' : 'text-gray-400'}`} />
                                {chat.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                              </button>
                              <button
                                onClick={() => { handleDeleteChat(chat.id); setOpenMenuChatId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                role="menuitem"
                              >
                                <TrashIcon className="h-4 w-4 mr-2 text-gray-400" />
                                Delete Chat
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-taupe">
                      <p>No chat history yet</p>
                    </div>
                  )}
                </div>
                
                {/* Sidebar Footer */}
                <div className="p-3 border-t border-blush/10">
                  <button 
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 p-2 text-sm text-taupe hover:text-rose rounded-lg hover:bg-rose/5 transition-colors"
                  >
                    <Cog6ToothIcon className="h-4 w-4" /> 
                    <span>Settings</span>
                  </button>
                </div>
                
                {/* Mobile Close Button */}
                <div className="md:hidden absolute top-4 right-4">
                  <button 
                    onClick={() => setShowSidebar(false)}
                    className="p-2 text-taupe hover:text-rose rounded-lg hover:bg-rose/5 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-blush/20 overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-blush/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-rose/10 rounded-full p-2">
                    <SparklesIcon className="h-5 w-5 text-rose" />
                  </div>
                  <motion.h2 
                    className="font-display font-medium text-lg text-charcoal"
                    style={{ textShadow }}
                  >
                    <motion.span
                      onMouseEnter={() => {
                        animate(glowIntensity, 1, { duration: 0.5 });
                      }}
                      onMouseLeave={() => {
                        animate(glowIntensity, 0, { duration: 0.5 });
                      }}
                    >
                      {getActiveAgentName()}
                    </motion.span>
                  </motion.h2>
                </div>
                
                {/* API Status Indicator */}
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${apiConfigured ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs text-taupe">{apiConfigured ? 'Connected' : 'Demo Mode'}</span>
                </div>
              </div>
              
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                          ? 'bg-rose text-white rounded-tr-none'
                          : 'bg-cream text-charcoal rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {msg.role === 'assistant' && (
                          <div className="flex-shrink-0 mt-1">
                            <SparklesSolidIcon className="h-5 w-5 text-rose" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-taupe'}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                        {msg.role === 'user' && (
                          <div className="flex-shrink-0 mt-1">
                            <UserCircleIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="bg-cream text-charcoal rounded-2xl rounded-tl-none p-4">
                      <div className="flex items-center gap-2">
                        <SparklesSolidIcon className="h-5 w-5 text-rose" />
                        <div className="flex space-x-1">
                          <motion.div 
                            className="w-2 h-2 bg-rose/60 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div 
                            className="w-2 h-2 bg-rose/60 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div 
                            className="w-2 h-2 bg-rose/60 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t border-blush/10">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask anything about influencer marketing..."
                    className="w-full p-4 pr-14 border border-blush/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/40 bg-cream/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      !input.trim() || isTyping
                        ? 'text-taupe/50 cursor-not-allowed'
                        : 'text-rose hover:bg-rose/10'
                    }`}
                  >
                    <PaperAirplaneIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-taupe/70 text-center">
                  {!apiConfigured ? (
                    <span>Running in demo mode. Add your API key in the .env.local file to enable full functionality.</span>
                  ) : (
                    <span>Powered by AI. Here to help with your influencer career questions.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col"
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
                <h2 className="text-xl font-display font-medium text-charcoal">Agent Settings</h2>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <XMarkIconMini className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 flex-grow">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-charcoal mb-3">Personality</h3>
                  <div className="space-y-3">
                    {availablePersonalities.map(personality => (
                      <label 
                        key={personality.id} 
                        htmlFor={`personality-${personality.id}`} 
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                          ${selectedPersonalityId === personality.id ? 'border-rose ring-2 ring-rose bg-rose/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <input 
                          type="radio" 
                          id={`personality-${personality.id}`} 
                          name="personality"
                          value={personality.id}
                          checked={selectedPersonalityId === personality.id}
                          onChange={() => setSelectedPersonalityId(personality.id)}
                          className="sr-only"
                        />
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 
                          ${selectedPersonalityId === personality.id ? 'border-rose bg-rose' : 'border-gray-300'}`}>
                          {selectedPersonalityId === personality.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <div>
                          <span className="font-medium text-charcoal">{personality.name}</span>
                          <p className="text-sm text-taupe">{personality.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="temperature-slider" className="block text-lg font-medium text-charcoal mb-2">
                    Creativity (Temperature): <span className="text-rose font-semibold">{temperature.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    id="temperature-slider"
                    min="0.1"
                    max="1.2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose"
                  />
                  <div className="flex justify-between text-xs text-taupe mt-1">
                    <span>More Focused</span>
                    <span>More Creative</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="custom-instructions" className="block text-lg font-medium text-charcoal mb-2">
                    Custom Instructions
                  </label>
                  <textarea
                    id="custom-instructions"
                    rows={3}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Always address me by my channel name. My main platform is TikTok."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/40 text-sm"
                  />
                  <p className="text-xs text-taupe mt-1">These instructions will be appended to the selected personality's system prompt.</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-charcoal mb-3">Response Length</h3>
                  <div className="flex space-x-2">
                    {(['concise', 'balanced', 'detailed'] as ResponseLength[]).map(length => (
                      <button 
                        key={length} 
                        onClick={() => setResponseLength(length)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 
                          ${responseLength === length ? 'bg-rose text-white' : 'bg-gray-100 hover:bg-gray-200 text-charcoal'}`}
                      >
                        {length.charAt(0).toUpperCase() + length.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-charcoal mb-3">Emoji Usage</h3>
                  <div className="flex space-x-2">
                    {(['none', 'subtle', 'expressive'] as EmojiUsage[]).map(usage => (
                      <button 
                        key={usage} 
                        onClick={() => setEmojiUsage(usage)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 
                          ${emojiUsage === usage ? 'bg-rose text-white' : 'bg-gray-100 hover:bg-gray-200 text-charcoal'}`}
                      >
                        {usage.charAt(0).toUpperCase() + usage.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-charcoal">Enable Smart Titles</h3>
                    <Switch
                      checked={enableSmartTitles}
                      onCheckedChange={setEnableSmartTitles}
                      className={TRACK_CLASSES}
                      aria-label="Enable smart titles"
                    />
                  </div>
                  <p className="text-xs text-taupe mt-1">Automatically generate concise titles for new chats based on the conversation. If disabled, titles will be based on the first user message.</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-charcoal">Use Custom Agent Configuration</h3>
                    <Switch
                      checked={isUsingCustomAgent}
                      onCheckedChange={setIsUsingCustomAgent}
                      className={TRACK_CLASSES}
                      aria-label="Use custom agent configuration"
                    />
                  </div>
                </div>

                {/* Custom Agent Configuration Fields - Conditionally show */}
                {isUsingCustomAgent && (
                  <div className="mb-6 p-4 border border-rose/30 rounded-lg bg-rose/5">
                    <h3 className="text-lg font-semibold text-rose mb-4">Customize Your Agent</h3>
                    <div className="mb-4">
                      <label htmlFor="custom-agent-name" className="block text-sm font-medium text-charcoal mb-1">Agent Name</label>
                      <input type="text" id="custom-agent-name" value={customAgentName} onChange={(e) => setCustomAgentName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/40" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="custom-agent-greeting" className="block text-sm font-medium text-charcoal mb-1">Initial Greeting</label>
                      <textarea id="custom-agent-greeting" rows={2} value={customAgentInitialGreeting} onChange={(e) => setCustomAgentInitialGreeting(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/40" />
                    </div>
                    
                    {/* Trait Selection UI */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-charcoal mb-2">Personality Traits</label>
                      <div className="flex flex-wrap gap-2">
                        {availableTraits.map(trait => (
                          <button
                            key={trait.id}
                            onClick={() => {
                              setSelectedTraitIds(prev => 
                                prev.includes(trait.id) 
                                  ? prev.filter(id => id !== trait.id) 
                                  : [...prev, trait.id]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                              ${selectedTraitIds.includes(trait.id)
                                ? 'bg-rose text-white border-rose' 
                                : 'bg-white text-charcoal border-gray-300 hover:border-gray-400'
                              }`}
                            title={trait.description}
                          >
                            {trait.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display generated prompt from traits (optional) */}
                    {selectedTraitIds.length > 0 && (
                        <div className="mt-4 p-3 bg-cream rounded-md border border-blush/30">
                            <p className="text-xs text-taupe font-medium mb-1">Your Agent's Vibe (Preview):</p>
                            <p className="text-xs text-charcoal whitespace-pre-wrap">
                                {(() => {
                                    const customAgentPromptBase = "I'm your AI assistant, and here's how I'll approach our conversations:";
                                    let traitBasedPrompt = customAgentPromptBase;
                                    selectedTraitIds.forEach(traitId => {
                                        const trait = availableTraits.find(t => t.id === traitId);
                                        if (trait) {
                                            traitBasedPrompt += `\n- ${trait.promptContribution}`;
                                        }
                                    });
                                    return traitBasedPrompt;
                                })()}
                            </p>
                        </div>
                    )}
                  </div>
                )}

                {/* Clear History Section - Now triggers custom confirm dialog */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleClearAllHistory} // This now opens the custom confirm dialog
                    className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-colors text-sm font-medium"
                  >
                    Clear All Chat History
                  </button>
                </div>
              </div>

              {/* On-Screen Clear History Confirmation Dialog */} 
              {isClearHistoryConfirmVisible && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 p-6 rounded-xl">
                  <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 text-center max-w-sm">
                    <h3 className="text-lg font-medium text-charcoal mb-2">Delete All Chats?</h3>
                    <p className="text-sm text-taupe mb-6">
                      Are you sure you want to permanently delete all your chat history? This action cannot be undone.
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => setIsClearHistoryConfirmVisible(false)}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-charcoal hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={executeClearAllHistory}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Yes, Delete All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl z-10">
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 bg-rose text-white rounded-lg hover:bg-rose/90 transition-colors text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
} 