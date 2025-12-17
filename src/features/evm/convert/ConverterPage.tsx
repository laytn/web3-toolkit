import { useState } from 'react'
import CopyButton from '../../../components/CopyButton'
import ErrorBanner from '../../../components/ErrorBanner'
import TextareaField from '../../../components/TextareaField'
import ToolCard from '../../../components/ToolCard'
import {
  hexByteLength,
  hexToText,
  normalizeHex,
  stripWhitespace,
  textToHex,
} from '../../../lib/conversions'
import { decimalToHex, hexToDecimal } from '../../../lib/number'
import styles from './ConverterPage.module.css'

export default function ConverterPage() {
  const [textValue, setTextValue] = useState('')
  const [hexValue, setHexValue] = useState('')
  const [byteLength, setByteLength] = useState(0)
  const [strip, setStrip] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decimalValue, setDecimalValue] = useState('')
  const [hexNumberValue, setHexNumberValue] = useState('')
  const [numberError, setNumberError] = useState<string | null>(null)
  const [lastNumberEdited, setLastNumberEdited] = useState<'decimal' | 'hex'>('decimal')

  const updateFromText = (value: string) => {
    setTextValue(value)
    const result = textToHex(value)
    setHexValue(result.hex)
    setByteLength(result.byteLength)
    setError(null)
  }

  const updateFromHex = (value: string) => {
    const cleaned = strip ? stripWhitespace(value) : value
    const normalized = normalizeHex(cleaned)
    setHexValue(normalized)

    try {
      const result = hexToText(cleaned)
      setTextValue(result.text ?? '')
      setByteLength(result.byteLength)
      setError(null)
    } catch (err) {
      setTextValue('')
      try {
        setByteLength(hexByteLength(cleaned))
      } catch {
        setByteLength(0)
      }
      setError((err as Error).message)
    }
  }

  const updateFromDecimal = (value: string) => {
    setLastNumberEdited('decimal')
    const result = decimalToHex(value)
    if (result.ok && result.hex !== undefined) {
      setDecimalValue(value)
      setHexNumberValue(result.hex)
      setNumberError(null)
    } else {
      setDecimalValue(value)
      setNumberError(result.error ?? '변환할 수 없습니다.')
    }
  }

  const updateFromHexNumber = (value: string) => {
    setLastNumberEdited('hex')
    const result = hexToDecimal(value, strip)
    if (result.ok && result.decimal !== undefined && result.hex !== undefined) {
      setHexNumberValue(result.hex)
      setDecimalValue(result.decimal)
      setNumberError(null)
    } else {
      setHexNumberValue(strip ? stripWhitespace(value) : value)
      setNumberError(result.error ?? '변환할 수 없습니다.')
    }
  }

  const handleWhitespaceToggle = (checked: boolean) => {
    setStrip(checked)
    if (hexValue) {
      updateFromHex(hexValue)
    }
    if (lastNumberEdited === 'hex' && hexNumberValue) {
      updateFromHexNumber(hexNumberValue)
    }
  }

  return (
    <div className={styles.wrapper}>
      <ToolCard
        title="Hex / Bytes / Text Converter"
        description="텍스트를 UTF-8 hex로, hex를 텍스트로 변환하고 바이트 길이를 표시합니다."
      >
        <div className={styles.row}>
          <TextareaField
            label="Text (UTF-8)"
            value={textValue}
            onChange={updateFromText}
            placeholder="hello world"
          />
          <CopyButton text={textValue} label="Copy text" />
        </div>

        <div className={styles.row}>
          <TextareaField
            label="Hex (0x...)"
            value={hexValue}
            onChange={updateFromHex}
            spellCheck={false}
            placeholder="0x68656c6c6f"
          />
          <CopyButton text={hexValue} label="Copy hex" />
        </div>

        <div className={styles.meta}>
          <div className={styles.badge}>Bytes: {byteLength}</div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={strip}
              onChange={(e) => handleWhitespaceToggle(e.target.checked)}
            />
            공백/개행 자동 제거
          </label>
        </div>

        <ErrorBanner message={error} />
      </ToolCard>

      <ToolCard
        title="Decimal / Hex Converter"
        description="BigInt 기반으로 10진수와 16진수를 상호 변환합니다. 부동소수점/음수 금지."
      >
        <div className={styles.numberRow}>
          <div className={styles.row}>
            <TextareaField
              label="Decimal (정수)"
              value={decimalValue}
              onChange={updateFromDecimal}
              placeholder="123456789"
              spellCheck={false}
              rows={3}
            />
            <CopyButton text={decimalValue} label="Copy decimal" />
          </div>

          <div className={styles.row}>
            <TextareaField
              label="Hex (0x...)"
              value={hexNumberValue}
              onChange={updateFromHexNumber}
              placeholder="0x1bc16d674ec80000"
              spellCheck={false}
              rows={3}
            />
            <CopyButton text={hexNumberValue} label="Copy hex" />
          </div>
        </div>

        <div className={styles.meta}>
          <div className={styles.badge}>Hex 입력 공백 제거: {strip ? 'ON' : 'OFF'}</div>
          <p className={styles.helper}>어느 쪽을 수정해도 반대쪽 값이 즉시 동기화됩니다.</p>
        </div>

        <ErrorBanner message={numberError} />
      </ToolCard>
    </div>
  )
}
