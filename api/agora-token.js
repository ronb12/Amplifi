import { createRequire } from 'node:module';
import { handleApiError, parseJson, requireEnv, requireMethod, sendJson } from './_lib/http.js';

const require = createRequire(import.meta.url);
const { RtcRole, RtcTokenBuilder } = require('agora-token');

const getRole = (role) => (role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER);

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const appId = requireEnv('AGORA_APP_ID');
    const appCertificate = requireEnv('AGORA_APP_CERTIFICATE');
    const body = await parseJson(req);
    const channelName = String(body.channelName || '');
    const uid = Number(body.uid || Math.floor(Math.random() * 1_000_000_000));

    if (!channelName) {
      return sendJson(res, 400, { error: 'channelName is required' });
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = Number(body.expiresIn || 3600);
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      getRole(body.role),
      now + expiresIn,
      now + expiresIn
    );

    sendJson(res, 200, {
      appId,
      channelName,
      uid,
      token,
      expiresAt: new Date((now + expiresIn) * 1000).toISOString()
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
