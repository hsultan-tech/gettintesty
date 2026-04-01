import { authService } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export interface StreamMetadata {
  agent_used?: string;
  image_base64?: string;
}

function _authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function _handleUnauth(): never {
  authService.logout();
  throw new ApiError('Session expired. Please login again.', 401);
}

export const chatApi = {
  async *streamMessage(
    message: string,
    history: { role: string; content: string }[] = []
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: _authHeaders(),
      body: JSON.stringify({ message, history }),
    });
    if (response.status === 401) _handleUnauth();
    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(`Chat request failed: ${response.status} — ${text}`, response.status);
    }
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  },

  async generateTitle(message: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/title`, {
        method: 'POST',
        headers: _authHeaders(),
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('failed');
      const data = await response.json();
      return (data.title as string) || _fallbackTitle(message);
    } catch {
      return _fallbackTitle(message);
    }
  },

  async healthCheck(): Promise<{ status: string; available_agents: string[] }> {
    const response = await fetch(`${API_BASE_URL}/health`, { headers: _authHeaders() });
    if (response.status === 401) _handleUnauth();
    if (!response.ok) throw new ApiError('Health check failed', response.status);
    return response.json();
  },
};

function _fallbackTitle(message: string): string {
  const words = message.trim().split(/\s+/);
  return words.slice(0, 5).join(' ') + (words.length > 5 ? '…' : '');
}

/** Strip \n[__META__]{...} from end of accumulated stream and return both parts. */
export function parseStreamMeta(raw: string): { clean: string; meta: StreamMetadata } {
  const marker = '\n[__META__]';
  const idx = raw.lastIndexOf(marker);
  if (idx === -1) return { clean: raw, meta: {} };
  try {
    const meta: StreamMetadata = JSON.parse(raw.slice(idx + marker.length));
    return { clean: raw.slice(0, idx), meta };
  } catch {
    return { clean: raw, meta: {} };
  }
}

/** Extract [TITLE:...] and [FLOWTIA:...] tags from LLM text.
 *  Tolerates leading whitespace, newlines, or other chars before the tags. */
export function parseLlmTags(text: string): {
  titleTag: string | null;
  flowtiaViewId: string | null;
  clean: string;
} {
  let clean = text;
  let titleTag: string | null = null;
  let flowtiaViewId: string | null = null;

  const titleMatch = clean.match(/\[TITLE:(.*?)\]/);
  if (titleMatch) {
    titleTag = titleMatch[1].trim();
    clean = clean.replace(titleMatch[0], '').replace(/^\s*\n?/, '');
  }
  const flowtiaMatch = clean.match(/\[FLOWTIA:(.*?)\]/);
  if (flowtiaMatch) {
    const val = flowtiaMatch[1].trim();
    flowtiaViewId = val === 'none' ? null : val;
    clean = clean.replace(flowtiaMatch[0], '').replace(/^\s*\n?/, '');
  }
  return { titleTag, flowtiaViewId, clean };
}