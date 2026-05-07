import { randomUUID } from 'node:crypto';
import { createLiveStreamRecord } from './_lib/db.js';
import { handleApiError, parseJson, requireMethod, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const body = await parseJson(req);
    const title = String(body.title || '').trim();
    const creatorId = String(body.creatorId || '').trim();

    if (!title || !creatorId) {
      return sendJson(res, 400, { error: 'title and creatorId are required' });
    }

    const id = randomUUID();
    const channelName = `amplifi_${creatorId.replace(/[^a-zA-Z0-9_-]/g, '')}_${Date.now()}`;
    const agoraUid = Math.floor(Math.random() * 1_000_000_000);

    await createLiveStreamRecord({
      id,
      creatorId,
      title,
      channelName,
      agoraUid,
      isPublic: body.isPublic !== false,
      allowChat: body.allowChat !== false
    });

    sendJson(res, 200, {
      id,
      title,
      channelName,
      agoraUid,
      isPublic: body.isPublic !== false,
      allowChat: body.allowChat !== false
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
