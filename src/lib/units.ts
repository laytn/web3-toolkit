import { formatUnits, parseUnits } from 'ethers'

export type Unit = 'wei' | 'gwei' | 'ether'

export interface UnitConversionResult {
  ok: boolean
  values?: Record<Unit, string>
  error?: string
}

const decimalsByUnit: Record<Unit, number> = {
  wei: 0,
  gwei: 9,
  ether: 18,
}

const decimalPattern = /^(\d+)(\.\d+)?$/

const isHexString = (value: string) => value.startsWith('0x') || value.startsWith('0X')

export function convertUnits(
  rawValue: string,
  unit: Unit,
  treatHexAsWei: boolean
): UnitConversionResult {
  const trimmed = rawValue.trim()

  if (trimmed === '') {
    return { ok: true, values: { wei: '', gwei: '', ether: '' } }
  }

  if (trimmed.startsWith('-')) {
    return { ok: false, error: '음수 값은 허용되지 않습니다.' }
  }

  const parseHexAmount = (hexValue: string) => {
    try {
      return BigInt(hexValue)
    } catch {
      return null
    }
  }

  let weiAmount: bigint | null = null
  const lower = trimmed.toLowerCase()

  if (isHexString(lower)) {
    const bigintValue = parseHexAmount(lower)
    if (bigintValue === null) {
      return { ok: false, error: '유효한 0x 형식의 16진수 값을 입력하세요.' }
    }

    if (treatHexAsWei) {
      weiAmount = bigintValue
    } else {
      const decimalString = bigintValue.toString()
      try {
        weiAmount =
          unit === 'wei'
            ? bigintValue
            : parseUnits(decimalString, decimalsByUnit[unit])
      } catch (err) {
        return { ok: false, error: (err as Error).message }
      }
    }
  } else {
    if (!decimalPattern.test(trimmed)) {
      return { ok: false, error: '숫자 형식만 입력할 수 있습니다.' }
    }

    try {
      weiAmount = parseUnits(trimmed, decimalsByUnit[unit])
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  }

  if (weiAmount === null) {
    return { ok: false, error: '값을 해석할 수 없습니다.' }
  }

  return {
    ok: true,
    values: {
      wei: weiAmount.toString(),
      gwei: formatUnits(weiAmount, decimalsByUnit.gwei),
      ether: formatUnits(weiAmount, decimalsByUnit.ether),
    },
  }
}
