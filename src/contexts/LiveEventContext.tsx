import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loadState, saveState, storageKeys } from '../services/storage';

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  startTime: string;
  endTime: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  isLive: boolean;
  isSoldOut: boolean;
  category: 'workshop' | 'concert' | 'gaming' | 'education' | 'business' | 'entertainment';
  benefits: string[];
  tags: string[];
}

export interface EventTicket {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  purchaseDate: string;
  price: number;
  status: 'active' | 'used' | 'refunded';
}

interface LiveEventContextType {
  events: LiveEvent[];
  tickets: EventTicket[];
  currentEvent: LiveEvent | null;
  setCurrentEvent: (event: LiveEvent | null) => void;
  createEvent: (eventData: Omit<LiveEvent, 'id' | 'currentAttendees' | 'isLive' | 'isSoldOut'>) => LiveEvent;
  purchaseTicket: (eventId: string, userId: string, userData: { name: string; email: string }) => Promise<EventTicket | null>;
  getEventById: (id: string) => LiveEvent | undefined;
  getUserTickets: (userId: string) => EventTicket[];
  updateEventStatus: (eventId: string, updates: Partial<LiveEvent>) => void;
}

const LiveEventContext = createContext<LiveEventContextType | undefined>(undefined);

export const useLiveEvent = () => {
  const context = useContext(LiveEventContext);
  if (context === undefined) {
    throw new Error('useLiveEvent must be used within LiveEventProvider');
  }
  return context;
};

interface LiveEventProviderProps {
  children: ReactNode;
}

const defaultEvents: LiveEvent[] = [
  {
    id: '1',
    title: 'Advanced React Workshop',
    description: 'Join us for a 2-hour intensive workshop on advanced React patterns, hooks, and performance optimization.',
    thumbnail: '/amplifi-logo.svg',
    creatorId: '1',
    creatorName: 'CodeMaster Pro',
    creatorAvatar: '/amplifi-logo.svg',
    startTime: '2024-02-15T18:00:00Z',
    endTime: '2024-02-15T20:00:00Z',
    price: 29.99,
    maxAttendees: 100,
    currentAttendees: 67,
    isLive: false,
    isSoldOut: false,
    category: 'workshop',
    benefits: [
      'Live Q&A with instructor',
      'Access to workshop materials',
      'Certificate of completion',
      'Recording available for 30 days'
    ],
    tags: ['React', 'JavaScript', 'Web Development', 'Workshop']
  },
  {
    id: '2',
    title: 'Gaming Tournament Finals',
    description: 'Watch the final round of our monthly gaming tournament with commentary and prizes.',
    thumbnail: '/amplifi-logo.svg',
    creatorId: '2',
    creatorName: 'CSS Wizard',
    creatorAvatar: '/amplifi-logo.svg',
    startTime: '2024-02-10T20:00:00Z',
    endTime: '2024-02-10T22:00:00Z',
    price: 9.99,
    maxAttendees: 500,
    currentAttendees: 423,
    isLive: false,
    isSoldOut: false,
    category: 'gaming',
    benefits: [
      'Exclusive tournament access',
      'Chat with other viewers',
      'Chance to win prizes',
      'Behind-the-scenes content'
    ],
    tags: ['Gaming', 'Tournament', 'Esports', 'Competition']
  },
  {
    id: '3',
    title: 'Business Strategy Masterclass',
    description: 'Learn business strategy from successful entrepreneurs and business leaders.',
    thumbnail: '/amplifi-logo.svg',
    creatorId: '3',
    creatorName: 'JS Ninja',
    creatorAvatar: '/amplifi-logo.svg',
    startTime: '2024-02-20T19:00:00Z',
    endTime: '2024-02-20T21:00:00Z',
    price: 49.99,
    maxAttendees: 50,
    currentAttendees: 50,
    isLive: false,
    isSoldOut: true,
    category: 'business',
    benefits: [
      'Interactive Q&A session',
      'Business plan templates',
      'Networking opportunities',
      'Follow-up consultation'
    ],
    tags: ['Business', 'Strategy', 'Entrepreneurship', 'Leadership']
  }
];

export const LiveEventProvider: React.FC<LiveEventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<LiveEvent[]>(() => loadState('amplifi:v1:live-events', defaultEvents));

  const [tickets, setTickets] = useState<EventTicket[]>(() => loadState('amplifi:v1:event-tickets', []));
  const [currentEvent, setCurrentEvent] = useState<LiveEvent | null>(null);

  useEffect(() => saveState('amplifi:v1:live-events', events), [events]);
  useEffect(() => saveState('amplifi:v1:event-tickets', tickets), [tickets]);

  const createEvent = (eventData: Omit<LiveEvent, 'id' | 'currentAttendees' | 'isLive' | 'isSoldOut'>) => {
    const newEvent: LiveEvent = {
      ...eventData,
      id: `event_${Date.now()}`,
      currentAttendees: 0,
      isLive: false,
      isSoldOut: false
    };

    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const purchaseTicket = async (eventId: string, userId: string, userData: { name: string; email: string }): Promise<EventTicket | null> => {
    const event = events.find(e => e.id === eventId);
    if (!event || event.isSoldOut || event.currentAttendees >= event.maxAttendees) {
      return null;
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const ticket: EventTicket = {
      id: `ticket_${Date.now()}`,
      eventId,
      userId,
      userName: userData.name,
      userEmail: userData.email,
      purchaseDate: new Date().toISOString(),
      price: event.price,
      status: 'active'
    };

    setTickets(prev => [...prev, ticket]);
    
    // Update event attendee count
    setEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { 
            ...e, 
            currentAttendees: e.currentAttendees + 1,
            isSoldOut: e.currentAttendees + 1 >= e.maxAttendees
          }
        : e
    ));

    return ticket;
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  const getUserTickets = (userId: string) => {
    return tickets.filter(ticket => ticket.userId === userId);
  };

  const updateEventStatus = (eventId: string, updates: Partial<LiveEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  const value: LiveEventContextType = {
    events,
    tickets,
    currentEvent,
    setCurrentEvent,
    createEvent,
    purchaseTicket,
    getEventById,
    getUserTickets,
    updateEventStatus
  };

  return (
    <LiveEventContext.Provider value={value}>
      {children}
    </LiveEventContext.Provider>
  );
};
