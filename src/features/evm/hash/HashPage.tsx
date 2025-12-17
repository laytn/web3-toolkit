import { useState } from 'react'
import CopyButton from '../../../components/CopyButton'
import ErrorBanner from '../../../components/ErrorBanner'
import InputField from '../../../components/InputField'
import ToolCard from '../../../components/ToolCard'
import { computeKeccak, type HashMode } from '../../../lib/hash'
import styles from './HashPage.module.css'

export default function HashPage() {
  const [mode, setMode] = useState<HashMode>('text')
  const [value, setValue] = useState('')
  const [hash, setHash] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [strip, setStrip] = useState(true)

  const handleModeChange = (next: HashMode) => {
    setMode(next)
    if (value) {
      handleHash(value, next, strip)
    }
  }

  const handleHash = (input: string, currentMode = mode, removeWhitespace = strip) => {
    setValue(input)
    const result = computeKeccak(input, currentMode, removeWhitespace)
    if (result.ok && result.hash !== undefined) {
      setHash(result.hash)
      setError(null)
    } else {
      setHash('')
      setError(result.error ?? '해시를 계산할 수 없습니다.')
    }
  }

  const handleWhitespaceToggle = (checked: boolean) => {
    setStrip(checked)
    if (value && mode === 'hex') {
      handleHash(value, mode, checked)
    }
  }

  return (
    <div className={styles.wrapper}>
      <ToolCard
        title="Keccak256 Hash Tool"
        description="입력 해석 방식을 선택하고 keccak256 해시를 계산하세요."
      >
        <div className={styles.modeRow}>
          <label className={styles.radio}>
            <input
              type="radio"
              name="hash-mode"
              value="text"
              checked={mode === 'text'}
              onChange={() => handleModeChange('text')}
            />
            <div>
              <p className={styles.label}>Text → bytes → keccak256</p>
              <p className={styles.helper}>UTF-8로 인코딩한 후 해시합니다.</p>
            </div>
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              name="hash-mode"
              value="hex"
              checked={mode === 'hex'}
              onChange={() => handleModeChange('hex')}
            />
            <div>
              <p className={styles.label}>Hex bytes → keccak256</p>
              <p className={styles.helper}>0x 유무 허용, 공백 제거 옵션 제공.</p>
            </div>
          </label>
        </div>

        <div className={styles.inputRow}>
          <InputField
            label={mode === 'text' ? 'Input (Text)' : 'Input (Hex bytes)'}
            value={value}
            onChange={(v) => handleHash(v)}
            spellCheck={false}
            placeholder={mode === 'text' ? 'Hello, keccak!' : '0x1234abcd...'}
          />
          <CopyButton text={value} label="Copy input" />
        </div>

        {mode === 'hex' && (
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={strip}
              onChange={(e) => handleWhitespaceToggle(e.target.checked)}
            />
            공백/개행 자동 제거 후 해시
          </label>
        )}

        <div className={styles.outputRow}>
          <div>
            <p className={styles.label}>keccak256</p>
            <p className={styles.code}>{hash}</p>
          </div>
          <CopyButton text={hash} label="Copy hash" />
        </div>

        <ErrorBanner message={error} />
      </ToolCard>
    </div>
  )
}
