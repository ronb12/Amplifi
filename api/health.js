import { getSql } from './_lib/db.js';
import { sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  const checks = {
    vercel: Boolean(process.env.VERCEL || process.env.VERCEL_URL),
    neon: Boolean(process.env.DATABASE_URL),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    agora: Boolean(process.env.AGORA_APP_ID && process.env.AGORA_APP_CERTIFICATE)
  };

  let database = 'not_configured';
  const sql = getSql();

  if (sql) {
    try {
      await sql`select 1`;
      database = 'ok';
    } catch {
      database = 'error';
    }
  }

  sendJson(res, 200, {
    ok: Object.values(checks).every(Boolean) && database !== 'error',
    checks,
    database
  });
}
