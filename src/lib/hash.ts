import { getBytes, keccak256, toUtf8Bytes } from 'ethers'
import { normalizeHex, stripWhitespace } from './conversions'

export type HashMode = 'text' | 'hex'

export interface HashResult {
  ok: boolean
  hash?: string
  error?: string
}

export function computeKeccak(
  input: string,
  mode: HashMode,
  removeWhitespace: boolean
): HashResult {
  const trimmed = input.trim()
  if (trimmed === '') return { ok: true, hash: '' }

  try {
    if (mode === 'hex') {
      const normalized = normalizeHex(removeWhitespace ? stripWhitespace(trimmed) : trimmed)
      if (normalized === '0x') return { ok: true, hash: '' }
      const bytes = getBytes(normalized)
      return { ok: true, hash: keccak256(bytes).toLowerCase() }
    }

    const bytes = toUtf8Bytes(trimmed)
    return { ok: true, hash: keccak256(bytes).toLowerCase() }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
