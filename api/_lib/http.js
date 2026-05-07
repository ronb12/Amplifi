export const parseJson = async (req) => {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

export const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

export const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export const requireMethod = (req, res, method) => {
  if (req.method === method) {
    return true;
  }

  res.setHeader('Allow', method);
  sendJson(res, 405, { error: `Method ${req.method} is not allowed` });
  return false;
};

export const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`${name} is not configured`);
    error.statusCode = 503;
    throw error;
  }

  return value;
};

export const handleApiError = (res, error) => {
  const status = error.statusCode || 500;
  const message = status >= 500 ? 'Server configuration or provider request failed' : error.message;
  sendJson(res, status, {
    error: message,
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
};

export const getAppUrl = (req) => {
  if (process.env.PUBLIC_APP_URL) {
    return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const host = req.headers.host || '127.0.0.1:4173';
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${host}`;
};
