/** Extrae mensaje legible de respuestas de error típicas de Nest (JSON). */
export function messageFromApiError(err: unknown): string | null {
  if (!err || typeof err !== 'object') {
    return null;
  }
  const e = err as {
    error?: { message?: string | string[]; error?: string };
    message?: string;
  };
  const raw = e.error?.message;
  if (Array.isArray(raw)) {
    return raw.join(' ');
  }
  if (typeof raw === 'string' && raw.length > 0) {
    return raw;
  }
  if (typeof e.message === 'string' && e.message.length > 0) {
    return e.message;
  }
  return null;
}
