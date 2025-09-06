import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

interface MessagesContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  sendMessage: (text: string) => void;
  selectConversation: (conversationId: string) => void;
  markAsRead: (messageId: string) => void;
  loading: boolean;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
};

interface MessagesProviderProps {
  children: ReactNode;
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      senderId: 'current-user',
      timestamp: new Date(),
      read: false,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const selectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setCurrentConversation(conversation || null);
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const value: MessagesContextType = {
    conversations,
    currentConversation,
    messages,
    sendMessage,
    selectConversation,
    markAsRead,
    loading,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};
