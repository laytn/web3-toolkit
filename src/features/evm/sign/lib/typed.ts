import {
  TypedDataEncoder,
  type TypedDataDomain,
  type TypedDataField,
  verifyTypedData,
} from 'ethers'
import { normalize0x, stripAllWhitespace, validateHexLength } from '../../../../lib/hex'
import { parseJson } from '../../../../lib/json'

export interface TypedDataInput {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  message: Record<string, unknown>
  primaryType: string
}

export interface TypedHashResult {
  ok: boolean
  digest?: string
  primaryType?: string
  error?: string
}

export interface TypedVerifyResult {
  ok: boolean
  address?: string
  matches?: boolean
  error?: string
}

export function buildTypedData(
  domainRaw: string,
  typesRaw: string,
  messageRaw: string,
  primaryTypeInput?: string
): { ok: boolean; data?: TypedDataInput; error?: string } {
  const domainParsed = parseJson<TypedDataDomain>(domainRaw || '{}', 'Domain')
  if (!domainParsed.ok) return { ok: false, error: domainParsed.error }

  const typesParsed = parseJson<Record<string, TypedDataField[]>>(typesRaw || '{}', 'Types')
  if (!typesParsed.ok) return { ok: false, error: typesParsed.error }

  const messageParsed = parseJson<Record<string, unknown>>(messageRaw || '{}', 'Message')
  if (!messageParsed.ok) return { ok: false, error: messageParsed.error }

  const types = typesParsed.data ?? {}
  const inferred = Object.keys(types).find((k) => k !== 'EIP712Domain')
  const primaryType = primaryTypeInput?.trim() || inferred

  if (!primaryType) {
    return { ok: false, error: 'primaryType을 입력하거나 types에 최소 1개 타입을 정의하세요.' }
  }

  if (!types[primaryType]) {
    return { ok: false, error: `primaryType "${primaryType}"이 types에 없습니다.` }
  }

  const orderedTypes: Record<string, TypedDataField[]> = {
    [primaryType]: types[primaryType],
    ...Object.fromEntries(Object.entries(types).filter(([k]) => k !== primaryType)),
  }

  return {
    ok: true,
    data: {
      domain: domainParsed.data ?? {},
      types: orderedTypes,
      message: messageParsed.data ?? {},
      primaryType,
    },
  }
}

export function computeTypedHash(input: TypedDataInput): TypedHashResult {
  try {
    const digest = TypedDataEncoder.hash(input.domain, input.types, input.message)
    return { ok: true, digest, primaryType: input.primaryType }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export function verifyTypedSignature(
  input: TypedDataInput,
  signature: string,
  expectedAddress?: string
): TypedVerifyResult {
  const sigError = validateHexLength(signature, 65)
  if (sigError) return { ok: false, error: `signature 오류: ${sigError}` }

  const normalizedSig = normalize0x(stripAllWhitespace(signature))

  try {
    const recovered = verifyTypedData(
      input.domain,
      input.types,
      input.message,
      normalizedSig
    )
    const matches = expectedAddress
      ? recovered.toLowerCase() === expectedAddress.trim().toLowerCase()
      : undefined
    return { ok: true, address: recovered, matches }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
