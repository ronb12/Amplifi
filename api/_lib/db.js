import { neon } from '@neondatabase/serverless';

let sqlClient;

export const getSql = () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
};

export const insertPaymentEvent = async (event) => {
  const sql = getSql();
  if (!sql) return;

  await sql`
    insert into payment_events (id, type, payload)
    values (${event.id}, ${event.type}, ${JSON.stringify(event)})
    on conflict (id) do nothing
  `;
};

export const recordCheckoutSession = async (session, status = 'created') => {
  const sql = getSql();
  if (!sql) return;

  await sql`
    insert into payments (
      stripe_session_id,
      creator_id,
      buyer_id,
      kind,
      amount_cents,
      currency,
      status,
      metadata
    )
    values (
      ${session.id},
      ${session.metadata?.creatorId || null},
      ${session.metadata?.buyerId || null},
      ${session.metadata?.kind || session.mode},
      ${session.amount_total || 0},
      ${session.currency || 'usd'},
      ${status},
      ${JSON.stringify(session.metadata || {})}
    )
    on conflict (stripe_session_id) do update set
      status = excluded.status,
      metadata = excluded.metadata,
      updated_at = now()
  `;
};

export const upsertCreatorAccount = async ({ userId, email, accountId, onboardingUrl }) => {
  const sql = getSql();
  if (!sql) return;

  await sql`
    insert into creator_accounts (user_id, email, stripe_account_id, onboarding_url)
    values (${userId}, ${email}, ${accountId}, ${onboardingUrl})
    on conflict (user_id) do update set
      email = excluded.email,
      stripe_account_id = excluded.stripe_account_id,
      onboarding_url = excluded.onboarding_url,
      updated_at = now()
  `;
};

export const createLiveStreamRecord = async ({
  id,
  creatorId,
  title,
  channelName,
  agoraUid,
  isPublic,
  allowChat
}) => {
  const sql = getSql();
  if (!sql) return;

  await sql`
    insert into live_streams (
      id,
      creator_id,
      title,
      channel_name,
      agora_uid,
      is_public,
      allow_chat,
      status
    )
    values (${id}, ${creatorId}, ${title}, ${channelName}, ${agoraUid}, ${isPublic}, ${allowChat}, 'scheduled')
    on conflict (id) do update set
      title = excluded.title,
      is_public = excluded.is_public,
      allow_chat = excluded.allow_chat,
      updated_at = now()
  `;
};
