import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Ad {
  id: string;
  type: 'pre-roll' | 'mid-roll' | 'post-roll' | 'banner' | 'overlay';
  title: string;
  description: string;
  advertiser: string;
  duration: number; // in seconds
  videoUrl: string;
  thumbnail: string;
  clickUrl: string;
  targetAudience: string[];
  budget: number;
  impressions: number;
  clicks: number;
  ctr: number; // click-through rate
  cpm: number; // cost per mille (1000 impressions)
  isActive: boolean;
  startDate: string;
  endDate: string;
  skipAfter?: number; // seconds after which ad can be skipped
}

export interface AdBreak {
  id: string;
  videoId: string;
  timestamp: number; // seconds into video
  ads: Ad[];
  duration: number;
}

export interface AdMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
  averageCtr: number;
  averageCpm: number;
}

interface AdContextType {
  ads: Ad[];
  adBreaks: AdBreak[];
  currentAd: Ad | null;
  isAdPlaying: boolean;
  adMetrics: AdMetrics;
  showAd: (type: Ad['type'], videoId?: string) => void;
  hideAd: () => void;
  createAd: (adData: Omit<Ad, 'id' | 'impressions' | 'clicks' | 'ctr'>) => Ad;
  updateAd: (adId: string, updates: Partial<Ad>) => void;
  deleteAd: (adId: string) => void;
  scheduleAdBreak: (videoId: string, timestamp: number, ads: Ad[]) => AdBreak;
  getAdBreakForVideo: (videoId: string) => AdBreak[];
  recordImpression: (adId: string) => void;
  recordClick: (adId: string) => void;
  calculateRevenue: (adId: string) => number;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const useAd = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAd must be used within AdProvider');
  }
  return context;
};

interface AdProviderProps {
  children: ReactNode;
}

export const AdProvider: React.FC<AdProviderProps> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([
    {
      id: '1',
      type: 'pre-roll',
      title: 'Try Our New Product',
      description: 'Discover amazing features that will change your life',
      advertiser: 'TechCorp Inc.',
      duration: 15,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      clickUrl: 'https://example.com/product',
      targetAudience: ['tech', 'young-adults'],
      budget: 1000,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpm: 2.50,
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      skipAfter: 5
    },
    {
      id: '2',
      type: 'mid-roll',
      title: 'Special Offer - 50% Off',
      description: 'Limited time offer on premium subscriptions',
      advertiser: 'Premium Services',
      duration: 20,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      clickUrl: 'https://example.com/offer',
      targetAudience: ['premium', 'all-users'],
      budget: 2000,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpm: 3.00,
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    {
      id: '3',
      type: 'banner',
      title: 'Subscribe to Our Newsletter',
      description: 'Get the latest updates and exclusive content',
      advertiser: 'Amplifi Platform',
      duration: 0,
      videoUrl: '',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      clickUrl: 'https://example.com/newsletter',
      targetAudience: ['all-users'],
      budget: 500,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpm: 1.50,
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  ]);

  const [adBreaks, setAdBreaks] = useState<AdBreak[]>([
    {
      id: '1',
      videoId: '1',
      timestamp: 300, // 5 minutes into video
      ads: [ads[1]], // mid-roll ad
      duration: 20
    }
  ]);

  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  const [adMetrics, setAdMetrics] = useState<AdMetrics>({
    totalImpressions: 0,
    totalClicks: 0,
    totalRevenue: 0,
    averageCtr: 0,
    averageCpm: 0
  });

  const showAd = (type: Ad['type'], videoId?: string) => {
    const availableAds = ads.filter(ad => 
      ad.type === type && 
      ad.isActive && 
      new Date() >= new Date(ad.startDate) && 
      new Date() <= new Date(ad.endDate)
    );

    if (availableAds.length > 0) {
      const randomAd = availableAds[Math.floor(Math.random() * availableAds.length)];
      setCurrentAd(randomAd);
      setIsAdPlaying(true);
      
      // Auto-hide ad after duration
      if (type !== 'banner' && type !== 'overlay') {
        setTimeout(() => {
          hideAd();
        }, randomAd.duration * 1000);
      }
    }
  };

  const hideAd = () => {
    setIsAdPlaying(false);
    setCurrentAd(null);
  };

  const createAd = (adData: Omit<Ad, 'id' | 'impressions' | 'clicks' | 'ctr'>) => {
    const newAd: Ad = {
      ...adData,
      id: `ad_${Date.now()}`,
      impressions: 0,
      clicks: 0,
      ctr: 0
    };

    setAds(prev => [...prev, newAd]);
    return newAd;
  };

  const updateAd = (adId: string, updates: Partial<Ad>) => {
    setAds(prev => prev.map(ad => 
      ad.id === adId ? { ...ad, ...updates } : ad
    ));
  };

  const deleteAd = (adId: string) => {
    setAds(prev => prev.filter(ad => ad.id !== adId));
  };

  const scheduleAdBreak = (videoId: string, timestamp: number, ads: Ad[]) => {
    const adBreak: AdBreak = {
      id: `break_${Date.now()}`,
      videoId,
      timestamp,
      ads,
      duration: ads.reduce((total, ad) => total + ad.duration, 0)
    };

    setAdBreaks(prev => [...prev, adBreak]);
    return adBreak;
  };

  const getAdBreakForVideo = (videoId: string) => {
    return adBreaks.filter(adBreak => adBreak.videoId === videoId);
  };

  const recordImpression = (adId: string) => {
    setAds(prev => prev.map(ad => {
      if (ad.id === adId) {
        const newImpressions = ad.impressions + 1;
        const newCtr = ad.clicks / newImpressions * 100;
        return {
          ...ad,
          impressions: newImpressions,
          ctr: newCtr
        };
      }
      return ad;
    }));

    setAdMetrics(prev => ({
      ...prev,
      totalImpressions: prev.totalImpressions + 1
    }));
  };

  const recordClick = (adId: string) => {
    setAds(prev => prev.map(ad => {
      if (ad.id === adId) {
        const newClicks = ad.clicks + 1;
        const newCtr = newClicks / ad.impressions * 100;
        return {
          ...ad,
          clicks: newClicks,
          ctr: newCtr
        };
      }
      return ad;
    }));

    setAdMetrics(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1
    }));
  };

  const calculateRevenue = (adId: string) => {
    const ad = ads.find(a => a.id === adId);
    if (ad) {
      return (ad.impressions / 1000) * ad.cpm;
    }
    return 0;
  };

  const value: AdContextType = {
    ads,
    adBreaks,
    currentAd,
    isAdPlaying,
    adMetrics,
    showAd,
    hideAd,
    createAd,
    updateAd,
    deleteAd,
    scheduleAdBreak,
    getAdBreakForVideo,
    recordImpression,
    recordClick,
    calculateRevenue
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
};
