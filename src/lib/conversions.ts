import { dataLength, getBytes, hexlify, toUtf8Bytes, toUtf8String } from 'ethers'

export interface HexConversionResult {
  hex: string
  text?: string
  byteLength: number
}

export const normalizeHex = (value: string) => {
  if (value.trim() === '') return ''
  return value.startsWith('0x') || value.startsWith('0X') ? value : `0x${value}`
}

export const stripWhitespace = (value: string) => value.replace(/\s+/g, '')

export function textToHex(text: string): HexConversionResult {
  const bytes = toUtf8Bytes(text)
  const hex = hexlify(bytes)

  return {
    hex,
    text,
    byteLength: bytes.length,
  }
}

export function hexToText(hexValue: string): HexConversionResult {
  const normalized = normalizeHex(stripWhitespace(hexValue))

  if (normalized === '0x') {
    return {
      hex: '0x',
      text: '',
      byteLength: 0,
    }
  }

  try {
    const bytes = getBytes(normalized)
    return {
      hex: normalized,
      text: toUtf8String(bytes),
      byteLength: dataLength(normalized),
    }
  } catch (err) {
    throw new Error('유효한 0x 형식의 hex 값을 입력하세요.')
  }
}

export function hexByteLength(hexValue: string): number {
  const normalized = normalizeHex(stripWhitespace(hexValue))
  if (normalized === '0x') return 0

  try {
    return dataLength(normalized)
  } catch (err) {
    throw new Error('바이트 길이를 계산할 수 없습니다. hex 형식을 확인하세요.')
  }
}
