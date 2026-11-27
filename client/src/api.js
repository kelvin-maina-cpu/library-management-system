const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

const TOKEN_KEY = 'northstar-token';
const USER_KEY = 'northstar-user';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Store the JWT and user returned by /auth/login or /auth/register. */
export function setSession({ access_token, user }) {
  try {
    if (access_token) localStorage.setItem(TOKEN_KEY, access_token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage may be unavailable (private mode); the session stays in memory only.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

async function apiRequest(path, { method = 'GET', body, signal, auth = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError(
      'Could not reach the library server. Check that the API is running.',
      0,
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (Array.isArray(payload?.message)) message = payload.message.join('. ');
      else if (payload?.message) message = payload.message;
    } catch {
      // Response had no JSON body; keep the status-based message.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return null;
  return response.json();
}

/**
 * Fetch JSON from the NestJS API. Pass an AbortSignal to cancel stale requests.
 */
export function apiGet(path, { signal, auth } = {}) {
  return apiRequest(path, { signal, auth });
}

/** Send a JSON body to the NestJS API. */
export function apiPost(path, body, { signal, auth } = {}) {
  return apiRequest(path, { method: 'POST', body, signal, auth });
}

/** Build the /books query string, omitting empty filters. */
export function booksQuery({ search = '', genreId = '' } = {}) {
  const params = new URLSearchParams();
  const trimmed = search.trim();
  if (trimmed) params.set('search', trimmed);
  if (genreId) params.set('genreId', String(genreId));
  // The catalog page shows the whole collection, so ask for a full page.
  params.set('limit', '100');
  return params.toString();
}
