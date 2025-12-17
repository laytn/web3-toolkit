import { getBytes, hashMessage, hexlify, toUtf8Bytes, verifyMessage } from 'ethers'
import { normalizeHex } from '../../../../lib/conversions'
import { normalize0x, stripAllWhitespace, validateHexLength } from '../../../../lib/hex'

export type Eip191Mode = 'text' | 'hex'

export interface Eip191HashResult {
  ok: boolean
  digest?: string
  bytesLength?: number
  error?: string
  messageBytes?: string
}

export interface Eip191VerifyResult {
  ok: boolean
  address?: string
  matches?: boolean
  error?: string
}

export function computeEip191Hash(
  message: string,
  mode: Eip191Mode,
  removeWhitespace: boolean
): Eip191HashResult {
  const trimmed = message.trim()
  if (trimmed === '') return { ok: true, digest: '', bytesLength: 0, messageBytes: '' }

  try {
    if (mode === 'hex') {
      const normalized = normalize0x(removeWhitespace ? stripAllWhitespace(trimmed) : trimmed)
      if (normalized === '0x') return { ok: true, digest: '', bytesLength: 0, messageBytes: '' }
      const bytes = getBytes(normalized)
      return {
        ok: true,
        digest: hashMessage(bytes),
        bytesLength: bytes.length,
        messageBytes: normalizeHex(normalized),
      }
    }

    const bytes = toUtf8Bytes(trimmed)
    return {
      ok: true,
      digest: hashMessage(bytes),
      bytesLength: bytes.length,
      messageBytes: hexlify(bytes),
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export function verifyEip191Signature(
  message: string,
  mode: Eip191Mode,
  removeWhitespace: boolean,
  signature: string,
  expectedAddress?: string
): Eip191VerifyResult {
  const sigError = validateHexLength(signature, 65)
  if (sigError) return { ok: false, error: `signature 오류: ${sigError}` }

  const normalizedSig = normalize0x(stripAllWhitespace(signature))

  try {
    let recovered: string
    if (mode === 'hex') {
      const normalized = normalize0x(removeWhitespace ? stripAllWhitespace(message) : message)
      recovered = verifyMessage(getBytes(normalized), normalizedSig)
    } else {
      recovered = verifyMessage(message, normalizedSig)
    }
    const matches = expectedAddress
      ? recovered.toLowerCase() === expectedAddress.trim().toLowerCase()
      : undefined

    return {
      ok: true,
      address: recovered,
      matches,
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
