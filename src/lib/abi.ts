import { FunctionFragment, Interface, ParamType, getAddress, isAddress } from 'ethers'
import { normalizeHex, stripWhitespace } from './conversions'
import { normalize0x, stripAllWhitespace } from './hex'

export interface EncodedResult {
  calldata: string
  selector: string
  length: number
}

export interface DecodeResult {
  ok: boolean
  values?: unknown[]
  error?: string
}

export function parseAbi(json: string): Interface {
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed)) {
    throw new Error('ABI는 배열(JSON array)이어야 합니다.')
  }
  return new Interface(parsed)
}

export function listFunctions(iface: Interface): { signature: string; fragment: FunctionFragment }[] {
  return iface.fragments
    .filter((f) => f.type === 'function')
    .map((f) => {
      const fragment = f as FunctionFragment
      return {
        signature: fragment.format('sighash'),
        fragment,
      }
    })
}

function ensureNumberString(raw: string) {
  const trimmed = raw.trim()
  if (trimmed === '') throw new Error('숫자 값을 입력하세요.')
  if (!/^-?\d+$/.test(trimmed)) throw new Error('정수 형식만 허용됩니다.')
  return trimmed
}

function ensureBool(raw: string) {
  const lower = raw.trim().toLowerCase()
  if (lower === 'true') return true
  if (lower === 'false') return false
  throw new Error('bool 값은 true/false 여야 합니다.')
}

function ensureHex(raw: string, expectedBytes?: number) {
  const cleaned = stripAllWhitespace(raw)
  const normalized = normalize0x(cleaned)
  const body = normalized.slice(2)
  if (body === '') throw new Error('hex 값을 입력하세요.')
  if (!/^[0-9a-fA-F]+$/.test(body)) throw new Error('hex 형식이 아닙니다.')
  if (expectedBytes && body.length !== expectedBytes * 2) {
    throw new Error(`길이가 ${expectedBytes}바이트가 아닙니다.`)
  }
  return `0x${body.toLowerCase()}`
}

function parseJsonValue(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch (err) {
    throw new Error(`JSON 파싱 실패: ${(err as Error).message}`)
  }
}

export function parseParam(param: ParamType, raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed === '') throw new Error(`${param.name || '값'}을 입력하세요.`)

  // Arrays
  if (param.baseType === 'array') {
    if (!param.arrayChildren) {
      throw new Error('배열 타입의 하위 타입을 해석할 수 없습니다.')
    }
    const parsed = parseJsonValue(trimmed)
    if (!Array.isArray(parsed)) {
      throw new Error('배열 타입은 JSON 배열로 입력하세요. 예: [1,2,3]')
    }
    return parsed.map((item) => parseParam(param.arrayChildren, String(item)))
  }

  // Tuples
  if (param.baseType === 'tuple') {
    const parsed = parseJsonValue(trimmed)
    const components = param.components ?? []
    if (Array.isArray(parsed)) {
      return components.map((comp, idx) => parseParam(comp, String(parsed[idx] ?? '')))
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return components.map((comp) =>
        parseParam(comp, String((parsed as Record<string, unknown>)[comp.name] ?? ''))
      )
    }
    throw new Error('tuple 타입은 JSON 배열 또는 객체로 입력하세요.')
  }

  // Scalars
  if (param.baseType === 'address') {
    if (!isAddress(trimmed)) throw new Error('유효한 주소가 아닙니다.')
    return getAddress(trimmed)
  }

  if (param.baseType === 'bool') {
    return ensureBool(trimmed)
  }

  if (param.baseType === 'bytes') {
    if (param.type === 'bytes') {
      return ensureHex(trimmed)
    }
    const match = /^bytes(\d+)$/.exec(param.type)
    if (match) {
      const size = Number(match[1])
      return ensureHex(trimmed, size)
    }
  }

  if (param.baseType === 'string') {
    return trimmed
  }

  if (param.baseType === 'int' || param.baseType === 'uint') {
    return ensureNumberString(trimmed)
  }

  // Fallback: let ethers handle
  if (param.type === 'function') {
    return ensureHex(trimmed, 24) // 4 bytes selector + address etc.
  }

  // Unknown type
  return trimmed
}

export function encodeFunction(
  iface: Interface,
  fragment: FunctionFragment,
  rawInputs: string[]
): EncodedResult {
  const parsedInputs = fragment.inputs.map((input, idx) => parseParam(input, rawInputs[idx] ?? ''))
  const calldata = iface.encodeFunctionData(fragment, parsedInputs)
  const selector = calldata.slice(0, 10)
  return {
    calldata,
    selector,
    length: (calldata.length - 2) / 2,
  }
}

export function decodeFunction(
  iface: Interface,
  fragment: FunctionFragment,
  calldata: string
): DecodeResult {
  const cleaned = normalizeHex(stripWhitespace(calldata.trim()))
  if (cleaned === '0x') return { ok: true, values: [] }
  try {
    const decoded = iface.decodeFunctionData(fragment, cleaned)
    return { ok: true, values: decoded }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
