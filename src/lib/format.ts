import { ParamType, getAddress, hexlify, isAddress } from 'ethers'

export function toDisplayValue(value: unknown, param: ParamType): unknown {
  if (param.baseType === 'array') {
    const child = param.arrayChildren
    if (Array.isArray(value)) {
      return value.map((v) => toDisplayValue(v, child))
    }
    return value
  }

  if (param.baseType === 'tuple') {
    const comps = param.components ?? []
    if (Array.isArray(value)) {
      return comps.map((c, idx) => toDisplayValue((value as unknown[])[idx], c))
    }
    if (typeof value === 'object' && value !== null) {
      const out: Record<string, unknown> = {}
      comps.forEach((c) => {
        out[c.name || '_'] = toDisplayValue(
          (value as Record<string, unknown>)[c.name],
          c
        )
      })
      return out
    }
    return value
  }

  if (param.baseType === 'address' && typeof value === 'string' && isAddress(value)) {
    return getAddress(value)
  }

  if ((param.baseType === 'int' || param.baseType === 'uint') && value != null) {
    try {
      // BigInt or BigNumber-like
      // @ts-expect-error
      if (typeof value === 'bigint') return value.toString()
      if (typeof value === 'object' && 'toString' in (value as object)) {
        return (value as { toString: () => string }).toString()
      }
      return String(value)
    } catch {
      return String(value)
    }
  }

  if (param.baseType === 'bytes') {
    try {
      return hexlify(value as any)
    } catch {
      return String(value)
    }
  }

  return value
}
