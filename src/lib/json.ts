export interface JsonParseResult<T> {
  ok: boolean
  data?: T
  error?: string
}

export function parseJson<T = unknown>(raw: string, label = 'JSON'): JsonParseResult<T> {
  try {
    const data = JSON.parse(raw) as T
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: `${label} 파싱 실패: ${(err as Error).message}` }
  }
}
