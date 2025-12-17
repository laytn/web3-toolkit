import { useState } from 'react'
import CopyButton from '../../../components/CopyButton'
import ErrorBanner from '../../../components/ErrorBanner'
import InputField from '../../../components/InputField'
import TextareaField from '../../../components/TextareaField'
import ToolCard from '../../../components/ToolCard'
import { computeEip191Hash, verifyEip191Signature, type Eip191Mode } from './lib/eip191'
import {
  buildTypedData,
  computeTypedHash,
  verifyTypedSignature,
  type TypedDataInput,
} from './lib/typed'
import styles from './SignPage.module.css'

type Tab = 'eip191' | 'eip712'

export default function SignPage() {
  const [tab, setTab] = useState<Tab>('eip191')

  // EIP-191 state
  const [mode, setMode] = useState<Eip191Mode>('text')
  const [stripHex, setStripHex] = useState(true)
  const [message, setMessage] = useState('')
  const [digest191, setDigest191] = useState('')
  const [bytes191, setBytes191] = useState(0)
  const [hash191Error, setHash191Error] = useState<string | null>(null)
  const [sig191, setSig191] = useState('')
  const [expected191, setExpected191] = useState('')
  const [verify191, setVerify191] = useState<{ address?: string; matches?: boolean } | null>(null)
  const [verify191Error, setVerify191Error] = useState<string | null>(null)

  // EIP-712 state
  const [domain, setDomain] = useState('{"name":"MyDApp","version":"1","chainId":1}')
  const [types, setTypes] = useState(
    '{"Mail":[{"name":"from","type":"address"},{"name":"contents","type":"string"}]}'
  )
  const [message712, setMessage712] = useState('{"from":"0x0000000000000000000000000000000000000000","contents":"hi"}')
  const [primaryType, setPrimaryType] = useState('')
  const [typedDigest, setTypedDigest] = useState('')
  const [typedPrimary, setTypedPrimary] = useState('')
  const [typedError, setTypedError] = useState<string | null>(null)
  const [typedData, setTypedData] = useState<TypedDataInput | null>(null)
  const [sig712, setSig712] = useState('')
  const [expected712, setExpected712] = useState('')
  const [verify712, setVerify712] = useState<{ address?: string; matches?: boolean } | null>(null)
  const [verify712Error, setVerify712Error] = useState<string | null>(null)

  const handleHash191 = (value: string, nextMode = mode, nextStrip = stripHex) => {
    setMessage(value)
    if (value.trim() === '') {
      setDigest191('')
      setBytes191(0)
      setHash191Error(null)
      setVerify191(null)
      setVerify191Error(null)
      return
    }
    const res = computeEip191Hash(value, nextMode, nextStrip)
    if (res.ok) {
      setDigest191(res.digest ?? '')
      setBytes191(res.bytesLength ?? 0)
      setHash191Error(null)
      if (sig191.trim()) {
        handleVerify191(sig191, value, nextMode, nextStrip, expected191)
      }
    } else {
      setDigest191('')
      setBytes191(0)
      setHash191Error(res.error ?? '해시 생성에 실패했습니다.')
    }
  }

  const handleVerify191 = (
    signature: string,
    currentMessage = message,
    currentMode = mode,
    currentStrip = stripHex,
    expected = expected191
  ) => {
    setSig191(signature)
    if (signature.trim() === '' || currentMessage.trim() === '') {
      setVerify191(null)
      setVerify191Error(null)
      return
    }
    const res = verifyEip191Signature(currentMessage, currentMode, currentStrip, signature, expected)
    if (res.ok) {
      setVerify191({ address: res.address, matches: res.matches })
      setVerify191Error(null)
    } else {
      setVerify191(null)
      setVerify191Error(res.error ?? '서명 검증에 실패했습니다.')
    }
  }

  const handleTypedChange = (
    nextDomain = domain,
    nextTypes = types,
    nextMessage = message712,
    nextPrimary = primaryType
  ) => {
    setDomain(nextDomain)
    setTypes(nextTypes)
    setMessage712(nextMessage)
    setPrimaryType(nextPrimary)

    if ([nextDomain, nextTypes, nextMessage].every((v) => v.trim() === '')) {
      setTypedData(null)
      setTypedDigest('')
      setTypedPrimary('')
      setTypedError(null)
      setVerify712(null)
      setVerify712Error(null)
      return
    }

    const built = buildTypedData(nextDomain, nextTypes, nextMessage, nextPrimary)
    if (!built.ok || !built.data) {
      setTypedData(null)
      setTypedDigest('')
      setTypedPrimary('')
      setTypedError(built.error ?? 'Typed data를 파싱할 수 없습니다.')
      return
    }

    const hashRes = computeTypedHash(built.data)
    if (hashRes.ok) {
      setTypedData(built.data)
      setTypedDigest(hashRes.digest ?? '')
      setTypedPrimary(hashRes.primaryType ?? built.data.primaryType)
      setTypedError(null)
      if (sig712.trim()) {
        handleVerify712(sig712, built.data, expected712)
      }
    } else {
      setTypedData(null)
      setTypedDigest('')
      setTypedPrimary('')
      setTypedError(hashRes.error ?? 'Typed data 해시 생성 실패')
    }
  }

  const handleVerify712 = (
    signature: string,
    data: TypedDataInput | null = typedData,
    expected = expected712
  ) => {
    setSig712(signature)
    if (!data || signature.trim() === '') {
      setVerify712(null)
      setVerify712Error(null)
      return
    }
    const res = verifyTypedSignature(data, signature, expected)
    if (res.ok) {
      setVerify712({ address: res.address, matches: res.matches })
      setVerify712Error(null)
    } else {
      setVerify712(null)
      setVerify712Error(res.error ?? '서명 검증에 실패했습니다.')
    }
  }

  return (
    <div className={styles.wrapper}>
      <ToolCard
        title="EIP-191 / EIP-712 Hashing & Verify"
        description="personal_sign 및 typed data 해시 생성, 선택적으로 서명 검증까지 수행합니다."
      >
        <div className={styles.tabs}>
          <button
            type="button"
            className={tab === 'eip191' ? styles.activeTab : styles.tab}
            onClick={() => setTab('eip191')}
          >
            EIP-191 (personal_sign)
          </button>
          <button
            type="button"
            className={tab === 'eip712' ? styles.activeTab : styles.tab}
            onClick={() => setTab('eip712')}
          >
            EIP-712 (typed data)
          </button>
        </div>

        {tab === 'eip191' && (
          <div className={styles.section}>
            <div className={styles.modeRow}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="eip191-mode"
                  checked={mode === 'text'}
                  onChange={() => {
                    setMode('text')
                    handleHash191(message, 'text', stripHex)
                  }}
                />
                <span>Text (UTF-8)</span>
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="eip191-mode"
                  checked={mode === 'hex'}
                  onChange={() => {
                    setMode('hex')
                    handleHash191(message, 'hex', stripHex)
                  }}
                />
                <span>Hex Bytes (0x...)</span>
              </label>
            </div>

            <TextareaField
              label="Message"
              value={message}
              onChange={(v) => handleHash191(v)}
              rows={4}
              spellCheck={false}
              placeholder={mode === 'text' ? 'hello' : '0x68656c6c6f'}
            />

            {mode === 'hex' && (
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={stripHex}
                  onChange={(e) => {
                    setStripHex(e.target.checked)
                    handleHash191(message, mode, e.target.checked)
                  }}
                />
                공백/개행 자동 제거
              </label>
            )}

            <p className={styles.helper}>
              이 해시는 personal_sign / eth_signMessage 계열(prefix 포함) digest입니다.
            </p>
            <ErrorBanner message={hash191Error} />

            <div className={styles.outputRow}>
              <div>
                <p className={styles.label}>EIP-191 digest</p>
                <p className={styles.code}>{digest191}</p>
                <div className={styles.meta}>
                  <span>Message bytes: {bytes191}</span>
                </div>
              </div>
              <CopyButton text={digest191} label="Copy digest" />
            </div>

            <div className={styles.verifyGrid}>
              <InputField
                label="Signature (65-byte hex)"
                value={sig191}
                onChange={(v) => handleVerify191(v)}
                spellCheck={false}
                placeholder="0x..."
              />
              <InputField
                label="Expected address (optional)"
                value={expected191}
                onChange={(v) => {
                  setExpected191(v)
                  if (sig191.trim()) handleVerify191(sig191, message, mode, stripHex, v)
                }}
                spellCheck={false}
                placeholder="0x..."
              />
            </div>
            <p className={styles.helper}>
              서명 검증은 digest가 아니라 원본 message/bytes + signature 기반으로 수행됩니다.
            </p>
            <ErrorBanner message={verify191Error} />
            {verify191?.address && (
              <div className={styles.result}>
                <div>
                  <p className={styles.label}>Recovered</p>
                  <p className={styles.code}>{verify191.address}</p>
                  {expected191.trim() && (
                    <p className={styles.helper}>
                      {verify191.matches ? 'expected와 일치합니다.' : 'expected와 불일치합니다.'}
                    </p>
                  )}
                </div>
                <CopyButton text={verify191.address} label="Copy address" />
              </div>
            )}
          </div>
        )}

        {tab === 'eip712' && (
          <div className={styles.section}>
            <TextareaField
              label="Domain (JSON object)"
              value={domain}
              onChange={(v) => handleTypedChange(v, types, message712, primaryType)}
              rows={3}
              spellCheck={false}
            />
            <TextareaField
              label='Types (예: { "Mail":[...], "Person":[...], "EIP712Domain":[...] })'
              value={types}
              onChange={(v) => handleTypedChange(domain, v, message712, primaryType)}
              rows={4}
              spellCheck={false}
            />
            <TextareaField
              label="Message (JSON object)"
              value={message712}
              onChange={(v) => handleTypedChange(domain, types, v, primaryType)}
              rows={4}
              spellCheck={false}
            />
            <InputField
              label="PrimaryType (optional, 미입력 시 types의 첫 번째 키를 사용)"
              value={primaryType}
              onChange={(v) => handleTypedChange(domain, types, message712, v)}
              spellCheck={false}
              placeholder="예: Mail"
            />
            <p className={styles.helper}>
              types에는 예시처럼 {"{ \"Mail\": [...], \"Person\": [...], \"EIP712Domain\": [...] }"} 형태로
              정의를 JSON으로 입력하세요. domain/message는 객체(JSON)입니다.
            </p>
            <ErrorBanner message={typedError} />

            <div className={styles.outputRow}>
              <div>
                <p className={styles.label}>EIP-712 digest</p>
                <p className={styles.code}>{typedDigest}</p>
                {typedPrimary && (
                  <p className={styles.helper}>primaryType: {typedPrimary}</p>
                )}
              </div>
              <CopyButton text={typedDigest} label="Copy digest" />
            </div>

            <div className={styles.verifyGrid}>
              <InputField
                label="Signature (65-byte hex)"
                value={sig712}
                onChange={(v) => handleVerify712(v)}
                spellCheck={false}
                placeholder="0x..."
              />
              <InputField
                label="Expected address (optional)"
                value={expected712}
                onChange={(v) => {
                  setExpected712(v)
                  if (sig712.trim()) handleVerify712(sig712, typedData, v)
                }}
                spellCheck={false}
                placeholder="0x..."
              />
            </div>
            <p className={styles.helper}>
              서명 검증은 typed data 원본 + signature 기반입니다. digest만으로는 검증할 수 없습니다.
            </p>
            <ErrorBanner message={verify712Error} />
            {verify712?.address && (
              <div className={styles.result}>
                <div>
                  <p className={styles.label}>Recovered</p>
                  <p className={styles.code}>{verify712.address}</p>
                  {expected712.trim() && (
                    <p className={styles.helper}>
                      {verify712.matches ? 'expected와 일치합니다.' : 'expected와 불일치합니다.'}
                    </p>
                  )}
                </div>
                <CopyButton text={verify712.address} label="Copy address" />
              </div>
            )}
          </div>
        )}
      </ToolCard>
    </div>
  )
}
