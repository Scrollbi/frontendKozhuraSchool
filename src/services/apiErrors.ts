import axios from 'axios'

/** Текст ошибки из ответа FastAPI / Axios. */
export function getApiErrorMessage(err: unknown, fallback = 'Произошла ошибка. Попробуйте позже.'): string {
  if (!axios.isAxiosError(err)) return err instanceof Error ? err.message : fallback
  const data = err.response?.data
  if (data == null) return err.message || fallback
  if (typeof data === 'string') return data
  if (typeof data === 'object' && 'detail' in data) {
    const d = (data as { detail: unknown }).detail
    if (typeof d === 'string') return d
    if (Array.isArray(d)) {
      const parts = d.map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) return String((item as { msg: string }).msg)
        return String(item)
      })
      return parts.join(' ')
    }
  }
  return fallback
}
