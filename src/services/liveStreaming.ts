import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng';

export interface LiveStreamSession {
  id: string;
  title: string;
  channelName: string;
  agoraUid: number;
  isPublic: boolean;
  allowChat: boolean;
}

export interface AgoraTokenResponse {
  appId: string;
  channelName: string;
  uid: number;
  token: string;
  expiresAt: string;
}

export interface PublishedStream {
  session: LiveStreamSession;
  client: IAgoraRTCClient | null;
  tracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null;
  localStream?: MediaStream;
}

const apiEnabled = import.meta.env.VITE_ENABLE_API === 'true';

const postJson = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json() as Promise<T>;
};

export const startProductionStream = async ({
  title,
  creatorId,
  isPublic,
  allowChat,
  previewElement
}: {
  title: string;
  creatorId: string;
  isPublic: boolean;
  allowChat: boolean;
  previewElement: HTMLElement | HTMLVideoElement | null;
}): Promise<PublishedStream> => {
  if (!apiEnabled) {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    if (previewElement instanceof HTMLVideoElement) {
      previewElement.srcObject = localStream;
    }

    return {
      session: {
        id: `demo_stream_${Date.now()}`,
        title,
        channelName: 'demo-local-preview',
        agoraUid: 0,
        isPublic,
        allowChat
      },
      client: null,
      tracks: null,
      localStream
    };
  }

  const session = await postJson<LiveStreamSession>('/api/live-streams', {
    title,
    creatorId,
    isPublic,
    allowChat
  });
  const token = await postJson<AgoraTokenResponse>('/api/agora-token', {
    channelName: session.channelName,
    uid: session.agoraUid,
    role: 'publisher'
  });
  const AgoraRTC = await import('agora-rtc-sdk-ng');
  const client = AgoraRTC.default.createClient({ mode: 'live', codec: 'vp8' });
  await client.setClientRole('host');
  await client.join(token.appId, token.channelName, token.token, token.uid);
  const tracks = await AgoraRTC.default.createMicrophoneAndCameraTracks();

  if (previewElement) {
    tracks[1].play(previewElement);
  }

  await client.publish(tracks);

  return {
    session,
    client,
    tracks
  };
};

export const stopPublishedStream = async (published: PublishedStream | null) => {
  if (!published) return;

  published.localStream?.getTracks().forEach(track => track.stop());
  published.tracks?.forEach(track => {
    track.stop();
    track.close();
  });
  await published.client?.leave();
};
