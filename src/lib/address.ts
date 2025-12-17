import { getAddress, isAddress } from 'ethers'

export interface AddressResult {
  input: string
  isValid: boolean
  checksum?: string
  alreadyChecksummed?: boolean
  error?: string
}

export function analyzeAddress(value: string): AddressResult {
  const trimmed = value.trim()
  if (trimmed === '') {
    return { input: value, isValid: false, error: '주소를 입력하세요.' }
  }

  if (!isAddress(trimmed)) {
    return { input: value, isValid: false, error: '유효한 20바이트 주소가 아닙니다.' }
  }

  try {
    const checksum = getAddress(trimmed)
    return {
      input: value,
      isValid: true,
      checksum,
      alreadyChecksummed: trimmed === checksum,
    }
  } catch (err) {
    return {
      input: value,
      isValid: false,
      error: (err as Error).message,
    }
  }
}
