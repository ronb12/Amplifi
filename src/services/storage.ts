export const storageKeys = {
  authUser: 'amplifi:v1:auth-user',
  authToken: 'amplifi:v1:auth-token',
  videos: 'amplifi:v1:videos',
  channels: 'amplifi:v1:channels',
  playlists: 'amplifi:v1:playlists',
  videoInteractions: 'amplifi:v1:video-interactions',
  ads: 'amplifi:v1:ads',
  adEvents: 'amplifi:v1:ad-events',
  adLedger: 'amplifi:v1:ad-ledger',
  comments: 'amplifi:v1:comments',
  communityPosts: 'amplifi:v1:community-posts',
  reports: 'amplifi:v1:reports'
} as const;

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const loadState = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`Unable to load ${key} from localStorage`, error);
    return fallback;
  }
};

export const saveState = <T,>(key: string, value: T) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to save ${key} to localStorage`, error);
  }
};

export const removeState = (key: string) => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
};
