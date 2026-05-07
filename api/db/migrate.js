import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getSql } from '../_lib/db.js';
import { handleApiError, requireEnv, requireMethod, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const expectedSecret = requireEnv('ADMIN_MIGRATION_SECRET');
    const providedSecret = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!providedSecret || providedSecret !== expectedSecret) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }

    const sql = getSql();
    if (!sql) {
      return sendJson(res, 503, { error: 'DATABASE_URL is not configured' });
    }

    const migration = await readFile(join(process.cwd(), 'migrations/001_production_core.sql'), 'utf8');
    await sql.query(migration);

    sendJson(res, 200, { success: true });
  } catch (error) {
    handleApiError(res, error);
  }
}
