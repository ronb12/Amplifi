import React, { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadState, saveState, storageKeys } from '../services/storage';
import type { Video } from './VideoContext';

export type AdType = 'pre-roll' | 'mid-roll' | 'post-roll' | 'banner' | 'overlay' | 'sponsored-card';
export type AdStatus = 'draft' | 'review' | 'active' | 'paused' | 'rejected';
export type AdEventType = 'impression' | 'click' | 'watch-through';

export interface Ad {
  id: string;
  type: AdType;
  title: string;
  description: string;
  advertiser: string;
  duration: number;
  videoUrl: string;
  thumbnail: string;
  clickUrl: string;
  targetAudience: string[];
  targetCategories: string[];
  excludedKeywords: string[];
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  watchThroughs: number;
  ctr: number;
  cpm: number;
  cpc: number;
  status: AdStatus;
  isActive: boolean;
  startDate: string;
  endDate: string;
  skipAfter?: number;
  reviewNote?: string;
  stripeSessionId?: string;
}

export interface AdBreak {
  id: string;
  videoId: string;
  timestamp: number;
  ads: Ad[];
  duration: number;
}

export interface AdEvent {
  id: string;
  adId: string;
  videoId: string;
  creatorId: string;
  type: AdEventType;
  revenue: number;
  creatorShare: number;
  platformShare: number;
  createdAt: string;
}

export interface CreatorAdLedger {
  creatorId: string;
  grossRevenue: number;
  creatorRevenue: number;
  platformRevenue: number;
  pendingRevenue: number;
  payableRevenue: number;
  impressions: number;
  clicks: number;
  watchThroughs: number;
}

export interface AdMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalWatchThroughs: number;
  totalRevenue: number;
  creatorPayouts: number;
  platformRevenue: number;
  averageCtr: number;
  averageCpm: number;
}

interface AdContextType {
  ads: Ad[];
  adBreaks: AdBreak[];
  adEvents: AdEvent[];
  currentAd: Ad | null;
  isAdPlaying: boolean;
  adMetrics: AdMetrics;
  selectAdForVideo: (type: AdType, video: Video) => Ad | null;
  showAd: (type: AdType, video?: Video) => Ad | null;
  hideAd: () => void;
  createAd: (adData: Omit<Ad, 'id' | 'impressions' | 'clicks' | 'watchThroughs' | 'ctr' | 'spent' | 'status' | 'isActive'>) => Ad;
  fundCampaign: (adId: string, amount: number, stripeSessionId?: string) => void;
  approveAd: (adId: string) => void;
  rejectAd: (adId: string, reviewNote: string) => void;
  updateAd: (adId: string, updates: Partial<Ad>) => void;
  deleteAd: (adId: string) => void;
  scheduleAdBreak: (videoId: string, timestamp: number, ads: Ad[]) => AdBreak;
  getAdBreakForVideo: (videoId: string) => AdBreak[];
  recordImpression: (adId: string, video?: Video) => boolean;
  recordClick: (adId: string, video?: Video) => boolean;
  recordWatchThrough: (adId: string, video?: Video) => boolean;
  calculateRevenue: (adId: string) => number;
  getCreatorLedger: (creatorId: string) => CreatorAdLedger;
  isBrandSafeVideo: (video: Video) => boolean;
}

const CREATOR_SHARE_RATE = 0.9;
export const PLATFORM_SHARE_RATE = 0.1;
export const SELF_SERVE_CPM = 10;
export const PREMIUM_PRE_ROLL_CPM = 18;
export const MIN_BRAND_CAMPAIGN_BUDGET = 100;
export const CREATOR_BOOST_DAILY_PRICE = 25;
export const DIRECT_SPONSORSHIP_PLATFORM_RATE = 0.15;
const blockedContentKeywords = ['scam', 'hate', 'weapon', 'adult', 'violence', 'illegal', 'gambling'];

const today = new Date();
const nextYear = new Date(today);
nextYear.setFullYear(today.getFullYear() + 1);

const defaultAds: Ad[] = [
  {
    id: 'ad_devtools_1',
    type: 'pre-roll',
    title: 'Ship faster with DevCloud',
    description: 'Deploy React apps, databases, and previews from one workspace.',
    advertiser: 'DevCloud',
    duration: 15,
    videoUrl: '',
    thumbnail: '/amplifi-logo.svg',
    clickUrl: 'https://example.com/devcloud',
    targetAudience: ['tech', 'developers', 'all-users'],
    targetCategories: ['react', 'javascript', 'css', 'web'],
    excludedKeywords: ['beginner scam', 'adult'],
    budget: 1200,
    spent: 0,
    impressions: 18000,
    clicks: 540,
    watchThroughs: 9200,
    ctr: 3,
    cpm: PREMIUM_PRE_ROLL_CPM,
    cpc: 1.25,
    status: 'active',
    isActive: true,
    startDate: today.toISOString().slice(0, 10),
    endDate: nextYear.toISOString().slice(0, 10),
    skipAfter: 5
  },
  {
    id: 'ad_design_1',
    type: 'banner',
    title: 'Design systems made simple',
    description: 'A sponsored toolkit for creators teaching UI and CSS.',
    advertiser: 'PixelForge',
    duration: 0,
    videoUrl: '',
    thumbnail: '/amplifi-logo.svg',
    clickUrl: 'https://example.com/pixelforge',
    targetAudience: ['designers', 'all-users'],
    targetCategories: ['css', 'design', 'react'],
    excludedKeywords: ['adult', 'gambling'],
    budget: 700,
    spent: 0,
    impressions: 24000,
    clicks: 690,
    watchThroughs: 0,
    ctr: 2.88,
    cpm: SELF_SERVE_CPM,
    cpc: 0.9,
    status: 'active',
    isActive: true,
    startDate: today.toISOString().slice(0, 10),
    endDate: nextYear.toISOString().slice(0, 10)
  }
];

const AdContext = createContext<AdContextType | undefined>(undefined);

export const useAd = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAd must be used within AdProvider');
  }
  return context;
};

const money = (value: number) => Math.round(value * 100) / 100;

const campaignText = (ad: Pick<Ad, 'title' | 'description' | 'targetAudience' | 'targetCategories'>) =>
  `${ad.title} ${ad.description} ${ad.targetAudience.join(' ')} ${ad.targetCategories.join(' ')}`.toLowerCase();

const videoText = (video: Video) => `${video.title} ${video.description} ${video.channelName}`.toLowerCase();

const isCampaignSafe = (ad: Pick<Ad, 'title' | 'description' | 'targetAudience' | 'targetCategories' | 'excludedKeywords'>) => {
  const text = campaignText(ad);
  return !blockedContentKeywords.some(keyword => text.includes(keyword));
};

const hasTargetMatch = (ad: Ad, video: Video) => {
  const text = videoText(video);
  return ad.targetCategories.length === 0 || ad.targetCategories.some(category => text.includes(category.toLowerCase()));
};

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>(() => loadState(storageKeys.ads, defaultAds));
  const [adEvents, setAdEvents] = useState<AdEvent[]>(() => loadState(storageKeys.adEvents, []));
  const [adBreaks, setAdBreaks] = useState<AdBreak[]>([]);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const fraudWindow = useRef<Map<string, number>>(new Map());

  useEffect(() => saveState(storageKeys.ads, ads), [ads]);
  useEffect(() => saveState(storageKeys.adEvents, adEvents), [adEvents]);

  const isBrandSafeVideo = (video: Video) => !blockedContentKeywords.some(keyword => videoText(video).includes(keyword));

  const recordEvent = (adId: string, type: AdEventType, video?: Video) => {
    const ad = ads.find(item => item.id === adId);
    if (!ad || !video || !isBrandSafeVideo(video)) return false;

    const now = Date.now();
    const windowMs = type === 'impression' ? 10_000 : type === 'click' ? 3_000 : 30_000;
    const fraudKey = `${type}:${adId}:${video.id}:${video.channelId}`;
    const previous = fraudWindow.current.get(fraudKey) ?? 0;
    if (now - previous < windowMs) return false;
    fraudWindow.current.set(fraudKey, now);

    const gross = type === 'impression' ? ad.cpm / 1000 : type === 'click' ? ad.cpc : ad.cpm / 1000 * 0.35;
    const revenue = money(gross);
    const creatorShare = money(revenue * CREATOR_SHARE_RATE);
    const platformShare = money(revenue - creatorShare);
    const event: AdEvent = {
      id: `ad_event_${now}_${Math.random().toString(36).slice(2, 8)}`,
      adId,
      videoId: video.id,
      creatorId: video.channelId,
      type,
      revenue,
      creatorShare,
      platformShare,
      createdAt: new Date(now).toISOString()
    };

    setAdEvents(prev => [event, ...prev].slice(0, 2000));
    setAds(prev => prev.map(item => {
      if (item.id !== adId) return item;
      const impressions = item.impressions + (type === 'impression' ? 1 : 0);
      const clicks = item.clicks + (type === 'click' ? 1 : 0);
      const watchThroughs = item.watchThroughs + (type === 'watch-through' ? 1 : 0);
      return {
        ...item,
        impressions,
        clicks,
        watchThroughs,
        spent: money(item.spent + revenue),
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0
      };
    }));
    return true;
  };

  const selectAdForVideo = (type: AdType, video: Video) => {
    if (!isBrandSafeVideo(video)) return null;
    const now = new Date();
    const eligible = ads.filter(ad =>
      ad.type === type &&
      ad.status === 'active' &&
      ad.isActive &&
      ad.spent < ad.budget &&
      now >= new Date(ad.startDate) &&
      now <= new Date(ad.endDate) &&
      hasTargetMatch(ad, video) &&
      !ad.excludedKeywords.some(keyword => videoText(video).includes(keyword.toLowerCase()))
    );
    return eligible.sort((a, b) => (b.budget - b.spent) - (a.budget - a.spent))[0] ?? null;
  };

  const showAd = (type: AdType, video?: Video) => {
    const selectedAd = video ? selectAdForVideo(type, video) : ads.find(ad => ad.type === type && ad.status === 'active') ?? null;
    if (!selectedAd) return null;
    setCurrentAd(selectedAd);
    setIsAdPlaying(true);
    if (video) recordEvent(selectedAd.id, 'impression', video);
    if (type !== 'banner' && type !== 'overlay' && type !== 'sponsored-card') {
      window.setTimeout(() => setIsAdPlaying(false), selectedAd.duration * 1000);
    }
    return selectedAd;
  };

  const createAd: AdContextType['createAd'] = (adData) => {
    const safe = isCampaignSafe(adData);
    const newAd: Ad = {
      ...adData,
      id: `ad_${Date.now()}`,
      spent: 0,
      impressions: 0,
      clicks: 0,
      watchThroughs: 0,
      ctr: 0,
      status: safe ? 'review' : 'rejected',
      isActive: false,
      reviewNote: safe ? 'Ready for brand-safety review.' : 'Rejected by automated brand-safety screening.'
    };
    setAds(prev => [newAd, ...prev]);
    return newAd;
  };

  const fundCampaign = (adId: string, amount: number, stripeSessionId?: string) => {
    setAds(prev => prev.map(ad => ad.id === adId ? {
      ...ad,
      budget: money(ad.budget + Math.max(0, amount)),
      stripeSessionId: stripeSessionId ?? ad.stripeSessionId
    } : ad));
  };

  const approveAd = (adId: string) => {
    setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, status: 'active', isActive: true, reviewNote: 'Approved for serving.' } : ad));
  };

  const rejectAd = (adId: string, reviewNote: string) => {
    setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, status: 'rejected', isActive: false, reviewNote } : ad));
  };

  const getCreatorLedger = (creatorId: string): CreatorAdLedger => {
    const events = adEvents.filter(event => event.creatorId === creatorId);
    const grossRevenue = money(events.reduce((sum, event) => sum + event.revenue, 0));
    const creatorRevenue = money(events.reduce((sum, event) => sum + event.creatorShare, 0));
    return {
      creatorId,
      grossRevenue,
      creatorRevenue,
      platformRevenue: money(events.reduce((sum, event) => sum + event.platformShare, 0)),
      pendingRevenue: money(creatorRevenue * 0.35),
      payableRevenue: money(creatorRevenue * 0.65),
      impressions: events.filter(event => event.type === 'impression').length,
      clicks: events.filter(event => event.type === 'click').length,
      watchThroughs: events.filter(event => event.type === 'watch-through').length
    };
  };

  const adMetrics = useMemo<AdMetrics>(() => {
    const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalWatchThroughs = ads.reduce((sum, ad) => sum + ad.watchThroughs, 0);
    const totalRevenue = money(adEvents.reduce((sum, event) => sum + event.revenue, 0));
    return {
      totalImpressions,
      totalClicks,
      totalWatchThroughs,
      totalRevenue,
      creatorPayouts: money(adEvents.reduce((sum, event) => sum + event.creatorShare, 0)),
      platformRevenue: money(adEvents.reduce((sum, event) => sum + event.platformShare, 0)),
      averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      averageCpm: ads.length > 0 ? ads.reduce((sum, ad) => sum + ad.cpm, 0) / ads.length : 0
    };
  }, [adEvents, ads]);

  const value: AdContextType = {
    ads,
    adBreaks,
    adEvents,
    currentAd,
    isAdPlaying,
    adMetrics,
    selectAdForVideo,
    showAd,
    hideAd: () => {
      setIsAdPlaying(false);
      setCurrentAd(null);
    },
    createAd,
    fundCampaign,
    approveAd,
    rejectAd,
    updateAd: (adId, updates) => setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, ...updates } : ad)),
    deleteAd: (adId) => setAds(prev => prev.filter(ad => ad.id !== adId)),
    scheduleAdBreak: (videoId, timestamp, scheduledAds) => {
      const adBreak = {
        id: `break_${Date.now()}`,
        videoId,
        timestamp,
        ads: scheduledAds,
        duration: scheduledAds.reduce((total, ad) => total + ad.duration, 0)
      };
      setAdBreaks(prev => [...prev, adBreak]);
      return adBreak;
    },
    getAdBreakForVideo: (videoId) => adBreaks.filter(adBreak => adBreak.videoId === videoId),
    recordImpression: (adId, video) => recordEvent(adId, 'impression', video),
    recordClick: (adId, video) => recordEvent(adId, 'click', video),
    recordWatchThrough: (adId, video) => recordEvent(adId, 'watch-through', video),
    calculateRevenue: (adId) => money(adEvents.filter(event => event.adId === adId).reduce((sum, event) => sum + event.revenue, 0)),
    getCreatorLedger,
    isBrandSafeVideo
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
};
