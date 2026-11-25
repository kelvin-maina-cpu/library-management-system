const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Fetch JSON from the NestJS API. Pass an AbortSignal to cancel stale requests.
 */
export async function apiGet(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
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
      const body = await response.json();
      if (Array.isArray(body?.message)) message = body.message.join('. ');
      else if (body?.message) message = body.message;
    } catch {
      // Response had no JSON body; keep the status-based message.
    }
    throw new ApiError(message, response.status);
  }

  return response.json();
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
