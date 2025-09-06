import React, { createContext, useContext, useState, ReactNode } from 'react';

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

export const LiveEventProvider: React.FC<LiveEventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<LiveEvent[]>([
    {
      id: '1',
      title: 'Advanced React Workshop',
      description: 'Join us for a 2-hour intensive workshop on advanced React patterns, hooks, and performance optimization.',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
      creatorId: '1',
      creatorName: 'CodeMaster Pro',
      creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
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
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
      creatorId: '2',
      creatorName: 'CSS Wizard',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
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
      thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
      creatorId: '3',
      creatorName: 'JS Ninja',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
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
  ]);

  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [currentEvent, setCurrentEvent] = useState<LiveEvent | null>(null);

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
