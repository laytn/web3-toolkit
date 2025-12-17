import { getAddress, recoverAddress, Signature } from 'ethers'
import { normalizeHex, stripWhitespace } from './conversions'
import { normalize0x, validateHexLength } from './hex'

export type SignatureMode = 'combined' | 'split'
export type ParityMode = 'v' | 'yParity'

export interface RecoverResult {
  ok: boolean
  address?: string
  lower?: string
  error?: string
}

export function validateDigest(digest: string, removeWhitespace: boolean): string | null {
  const normalized = normalizeHex(removeWhitespace ? stripWhitespace(digest) : digest)
  const body = normalized.slice(2)
  if (normalized === '0x') return 'digest를 입력하세요.'
  if (!/^[0-9a-fA-F]+$/.test(body)) return 'digest는 hex여야 합니다.'
  if (body.length !== 64) return 'digest는 정확히 32바이트여야 합니다.'
  return null
}

export function recoverFromCombined(
  digest: string,
  signature: string,
  removeWhitespace: boolean
): RecoverResult {
  const digestError = validateDigest(digest, removeWhitespace)
  if (digestError) return { ok: false, error: digestError }

  const sigClean = normalize0x(removeWhitespace ? stripWhitespace(signature) : signature)
  const sigError = validateHexLength(sigClean, 65)
  if (sigError) return { ok: false, error: `signature 오류: ${sigError}` }

  try {
    const addr = recoverAddress(normalizeHex(removeWhitespace ? stripWhitespace(digest) : digest), sigClean)
    const checksum = getAddress(addr)
    return { ok: true, address: checksum, lower: checksum.toLowerCase() }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export function recoverFromParts(
  digest: string,
  r: string,
  s: string,
  parityValue: string,
  parityMode: ParityMode,
  removeWhitespace: boolean
): RecoverResult {
  const digestError = validateDigest(digest, removeWhitespace)
  if (digestError) return { ok: false, error: digestError }

  const rErr = validateHexLength(r, 32)
  if (rErr) return { ok: false, error: `r 오류: ${rErr}` }
  const sErr = validateHexLength(s, 32)
  if (sErr) return { ok: false, error: `s 오류: ${sErr}` }

  const normalizedDigest = normalizeHex(removeWhitespace ? stripWhitespace(digest) : digest)
  const signature: { r: string; s: string; v: number } = {
    r: normalize0x(stripWhitespace(r)),
    s: normalize0x(stripWhitespace(s)),
    v: 27,
  }

  if (parityMode === 'v') {
    const vNum = Number(parityValue)
    if (![0, 1, 27, 28].includes(vNum) || Number.isNaN(vNum)) {
      return { ok: false, error: 'v는 0/1 또는 27/28이어야 합니다.' }
    }
    signature.v = vNum === 0 || vNum === 1 ? vNum + 27 : vNum
  } else {
    const yNum = Number(parityValue)
    if (![0, 1].includes(yNum) || Number.isNaN(yNum)) {
      return { ok: false, error: 'yParity는 0 또는 1이어야 합니다.' }
    }
    signature.v = yNum === 0 ? 27 : 28
  }

  try {
    const sigObj = Signature.from(signature)
    const addr = recoverAddress(normalizedDigest, sigObj)
    const checksum = getAddress(addr)
    return { ok: true, address: checksum, lower: checksum.toLowerCase() }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
