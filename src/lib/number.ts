import { normalizeHex, stripWhitespace } from './conversions'

export interface NumberConversionResult {
  ok: boolean
  decimal?: string
  hex?: string
  error?: string
}

const decimalPattern = /^\d+$/
const hexBodyPattern = /^[0-9a-fA-F]+$/

export function decimalToHex(decimal: string): NumberConversionResult {
  const trimmed = decimal.trim()
  if (trimmed === '') return { ok: true, decimal: '', hex: '' }

  if (!decimalPattern.test(trimmed)) {
    return { ok: false, error: '정수 10진수만 입력할 수 있습니다.' }
  }

  try {
    const value = BigInt(trimmed)
    return {
      ok: true,
      decimal: trimmed,
      hex: `0x${value.toString(16)}`,
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export function hexToDecimal(hexInput: string, removeWhitespace: boolean): NumberConversionResult {
  const trimmed = hexInput.trim()
  if (trimmed === '') return { ok: true, decimal: '', hex: '' }

  const cleaned = removeWhitespace ? stripWhitespace(trimmed) : trimmed
  const normalized = normalizeHex(cleaned)
  const body = normalized.slice(2)

  if (body === '') {
    return { ok: false, error: 'hex 값을 입력하세요.' }
  }

  if (!hexBodyPattern.test(body)) {
    return { ok: false, error: '유효한 16진수 형식이 아닙니다.' }
  }

  try {
    const value = BigInt(normalized)
    return {
      ok: true,
      decimal: value.toString(10),
      hex: `0x${value.toString(16)}`,
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
