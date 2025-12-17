import { useState } from 'react'
import CopyButton from '../../../components/CopyButton'
import ErrorBanner from '../../../components/ErrorBanner'
import InputField from '../../../components/InputField'
import ToolCard from '../../../components/ToolCard'
import { recoverFromCombined, recoverFromParts, type ParityMode } from '../../../lib/recover'
import styles from './RecoverPage.module.css'

export default function RecoverPage() {
  const [digest, setDigest] = useState('')
  const [combinedSig, setCombinedSig] = useState('')
  const [useCombined, setUseCombined] = useState(true)
  const [strip, setStrip] = useState(true)
  const [r, setR] = useState('')
  const [s, setS] = useState('')
  const [parity, setParity] = useState<ParityMode>('v')
  const [parityValue, setParityValue] = useState('')
  const [result, setResult] = useState<{ address: string; lower: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRecoverCombined = (nextDigest: string, nextSig: string) => {
    if (!nextDigest && !nextSig) {
      setResult(null)
      setError(null)
      return
    }
    const res = recoverFromCombined(nextDigest, nextSig, strip)
    if (res.ok && res.address) {
      setResult({ address: res.address, lower: res.lower ?? res.address.toLowerCase() })
      setError(null)
    } else {
      setResult(null)
      setError(res.error ?? '복구에 실패했습니다.')
    }
  }

  const handleRecoverSplit = (
    nextDigest: string,
    nextR: string,
    nextS: string,
    nextParityValue: string
  ) => {
    if (!nextDigest && !nextR && !nextS && !nextParityValue) {
      setResult(null)
      setError(null)
      return
    }
    const res = recoverFromParts(nextDigest, nextR, nextS, nextParityValue, parity, strip)
    if (res.ok && res.address) {
      setResult({ address: res.address, lower: res.lower ?? res.address.toLowerCase() })
      setError(null)
    } else {
      setResult(null)
      setError(res.error ?? '복구에 실패했습니다.')
    }
  }

  const onDigestChange = (value: string) => {
    setDigest(value)
    if (useCombined) {
      handleRecoverCombined(value, combinedSig)
    } else {
      handleRecoverSplit(value, r, s, parityValue)
    }
  }

  const onCombinedSigChange = (value: string) => {
    setCombinedSig(value)
    handleRecoverCombined(digest, value)
  }

  const onSplitChange = (field: 'r' | 's' | 'parity', value: string) => {
    if (field === 'r') setR(value)
    if (field === 's') setS(value)
    if (field === 'parity') setParityValue(value)
    handleRecoverSplit(
      digest,
      field === 'r' ? value : r,
      field === 's' ? value : s,
      field === 'parity' ? value : parityValue
    )
  }

  const toggleWhitespace = (checked: boolean) => {
    setStrip(checked)
    if (useCombined) {
      handleRecoverCombined(digest, combinedSig)
    } else {
      handleRecoverSplit(digest, r, s, parityValue)
    }
  }

  const switchMode = (useCombinedMode: boolean) => {
    setUseCombined(useCombinedMode)
    setResult(null)
    setError(null)
  }

  return (
    <div className={styles.wrapper}>
      <ToolCard
        title="Signature → Address Recovery"
        description="digest와 signature가 일치한다면 서명자 주소를 복구합니다. (digest 내용 자체는 검증하지 않음)"
      >
        <div className={styles.notice}>
          message(원문) 기반 복구가 아니라 digest(32 bytes) 기반 복구입니다. 입력 digest와
          signature가 대응할 때만 올바른 주소가 복구됩니다.
        </div>

        <div className={styles.row}>
          <InputField
            label="Digest (32 bytes hex)"
            value={digest}
            onChange={onDigestChange}
            spellCheck={false}
            placeholder="0xabc123..."
          />
          <CopyButton text={digest} label="Copy digest" />
        </div>

        <div className={styles.modeRow}>
          <label className={styles.radio}>
            <input
              type="radio"
              name="sig-mode"
              checked={useCombined}
              onChange={() => switchMode(true)}
            />
            <div>
              <p className={styles.label}>65-byte signature (r + s + v)</p>
              <p className={styles.helper}>전체 signature hex를 입력하세요.</p>
            </div>
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              name="sig-mode"
              checked={!useCombined}
              onChange={() => switchMode(false)}
            />
            <div>
              <p className={styles.label}>r / s / v (또는 yParity)</p>
              <p className={styles.helper}>고급 모드: 각 필드를 개별 입력</p>
            </div>
          </label>
        </div>

        {useCombined ? (
          <div className={styles.row}>
            <InputField
              label="Signature (65 bytes hex)"
              value={combinedSig}
              onChange={onCombinedSigChange}
              spellCheck={false}
              placeholder="0x{130 hex chars}"
            />
            <CopyButton text={combinedSig} label="Copy signature" />
          </div>
        ) : (
          <div className={styles.splitGrid}>
            <InputField
              label="r (32 bytes hex)"
              value={r}
              onChange={(v) => onSplitChange('r', v)}
              spellCheck={false}
              placeholder="0x..."
            />
            <InputField
              label="s (32 bytes hex)"
              value={s}
              onChange={(v) => onSplitChange('s', v)}
              spellCheck={false}
              placeholder="0x..."
            />
            <div className={styles.parityBox}>
              <div className={styles.parityToggle}>
                <label className={styles.radioInline}>
                  <input
                    type="radio"
                    name="parity-mode"
                    checked={parity === 'v'}
                    onChange={() => setParity('v')}
                  />
                  v (0/1 또는 27/28)
                </label>
                <label className={styles.radioInline}>
                  <input
                    type="radio"
                    name="parity-mode"
                    checked={parity === 'yParity'}
                    onChange={() => setParity('yParity')}
                  />
                  yParity (0/1)
                </label>
              </div>
              <InputField
                label={parity === 'v' ? 'v 값' : 'yParity 값'}
                value={parityValue}
                onChange={(v) => onSplitChange('parity', v)}
                spellCheck={false}
                placeholder={parity === 'v' ? '27 또는 28 (또는 0/1)' : '0 또는 1'}
              />
            </div>
          </div>
        )}

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={strip}
            onChange={(e) => toggleWhitespace(e.target.checked)}
          />
          digest / signature 입력 공백·개행 자동 제거
        </label>

        <div className={styles.outputRow}>
          <div>
            <p className={styles.label}>Recovered (checksum)</p>
            <p className={styles.code}>{result?.address ?? ''}</p>
            <p className={styles.helper}>lowercase: {result?.lower ?? ''}</p>
          </div>
          <CopyButton text={result?.address ?? ''} label="Copy address" />
        </div>

        <ErrorBanner message={error} />
      </ToolCard>
    </div>
  )
}
