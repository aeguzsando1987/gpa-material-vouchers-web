/**
 * Extrae un mensaje de error legible (string) de un error de Axios/FastAPI.
 *
 * FastAPI devuelve `detail` de varias formas:
 *  - string  → errores de negocio (400) o HTTPException
 *  - array   → errores de validación (422) de Pydantic: [{ loc, msg, ... }]
 *  - object  → algún caso con { msg }
 *
 * Pasar el array/objeto crudo a toast.error() rompe React
 * ("Objects are not valid as a React child"), por eso aquí siempre devolvemos texto.
 */
interface ApiErrorLike {
  response?: { data?: { detail?: unknown } };
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as ApiErrorLike;
  const detail = err?.response?.data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const messages = detail.map((item) => {
      const e = item as { loc?: unknown[]; msg?: string };
      const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : undefined;
      const msg = e.msg ?? 'Error de validación';
      return field ? `${String(field)}: ${msg}` : msg;
    });
    if (messages.length > 0) return messages.join('\n');
  }

  if (detail && typeof detail === 'object') {
    const e = detail as { msg?: string };
    if (typeof e.msg === 'string') return e.msg;
  }

  if (typeof err?.message === 'string') return err.message;
  return fallback;
}
