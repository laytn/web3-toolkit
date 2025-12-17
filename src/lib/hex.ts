export function normalize0x(value: string): string {
  if (value.trim() === '') return ''
  return value.startsWith('0x') || value.startsWith('0X') ? value : `0x${value}`
}

export function stripAllWhitespace(value: string): string {
  return value.replace(/\s+/g, '')
}

export function validateHexLength(hex: string, expectedBytes: number): string | null {
  const normalized = normalize0x(stripAllWhitespace(hex.trim()))
  if (normalized === '0x') return '값을 입력하세요.'
  const body = normalized.slice(2)
  if (!/^[0-9a-fA-F]+$/.test(body)) return 'hex 형식이 아닙니다.'
  if (body.length !== expectedBytes * 2) {
    return `길이가 ${expectedBytes}바이트가 아닙니다. (${expectedBytes * 2} hex 문자 필요)`
  }
  return null
}
