import { useEffect, useMemo, useState } from 'react'
import CopyButton from '../../../components/CopyButton'
import ErrorBanner from '../../../components/ErrorBanner'
import TextareaField from '../../../components/TextareaField'
import ToolCard from '../../../components/ToolCard'
import {
  decodeFunction,
  encodeFunction,
  listFunctions,
  parseAbi,
  type EncodedResult,
} from '../../../lib/abi'
import { toDisplayValue } from '../../../lib/format'
import styles from './AbiPage.module.css'

type Tab = 'encode' | 'decode'

export default function AbiPage() {
  const [tab, setTab] = useState<Tab>('encode')
  const [abiText, setAbiText] = useState(
    '[{"type":"function","name":"transfer","inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}]}]'
  )
  const [abiError, setAbiError] = useState<string | null>(null)
  const [iface, setIface] = useState<ReturnType<typeof parseAbi> | null>(null)
  const [functions, setFunctions] = useState<ReturnType<typeof listFunctions>>([])
  const [selectedSig, setSelectedSig] = useState<string>('')

  const [encodeInputs, setEncodeInputs] = useState<string[]>([])
  const [encoded, setEncoded] = useState<EncodedResult | null>(null)
  const [encodeError, setEncodeError] = useState<string | null>(null)

  const [calldata, setCalldata] = useState('')
  const [decoded, setDecoded] = useState<unknown[] | null>(null)
  const [decodeError, setDecodeError] = useState<string | null>(null)

  const selectedFunction = useMemo(
    () => functions.find((f) => f.signature === selectedSig),
    [functions, selectedSig]
  )

  const handleAbiChange = (value: string) => {
    setAbiText(value)
    try {
      const nextIface = parseAbi(value)
      const fnList = listFunctions(nextIface)
      if (!fnList.length) {
        setAbiError('function 타입이 포함된 ABI가 없습니다.')
        setIface(null)
        setFunctions([])
        setSelectedSig('')
        return
      }
      setIface(nextIface)
      setFunctions(fnList)
      setSelectedSig(fnList[0].signature)
      setAbiError(null)
    } catch (err) {
      setIface(null)
      setFunctions([])
      setSelectedSig('')
      setAbiError((err as Error).message)
    }
  }

  useEffect(() => {
    handleAbiChange(abiText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedFunction) return
    setEncodeInputs(selectedFunction.fragment.inputs.map(() => ''))
    setEncoded(null)
    setDecoded(null)
    setEncodeError(null)
    setDecodeError(null)
    setCalldata('')
  }, [selectedFunction?.signature])

  const tryEncode = (inputs: string[]) => {
    if (!iface || !selectedFunction) return
    if (inputs.some((v) => v.trim() === '')) {
      setEncoded(null)
      setEncodeError(null)
      return
    }
    try {
      const res = encodeFunction(iface, selectedFunction.fragment, inputs)
      setEncoded(res)
      setEncodeError(null)
    } catch (err) {
      setEncoded(null)
      setEncodeError((err as Error).message)
    }
  }

  const tryDecode = (data: string) => {
    if (!iface || !selectedFunction) return
    if (data.trim() === '') {
      setDecoded(null)
      setDecodeError(null)
      return
    }
    const res = decodeFunction(iface, selectedFunction.fragment, data)
    if (res.ok && res.values) {
      const formatted = selectedFunction.fragment.inputs.map((input, idx) =>
        toDisplayValue(res.values?.[idx], input)
      )
      setDecoded(formatted)
      setDecodeError(null)
    } else {
      setDecoded(null)
      setDecodeError(res.error ?? '디코드에 실패했습니다.')
    }
  }

  const handleInputChange = (index: number, value: string) => {
    const next = [...encodeInputs]
    next[index] = value
    setEncodeInputs(next)
    tryEncode(next)
  }

  const decodeJson = decoded ? JSON.stringify(decoded, null, 2) : ''

  return (
    <div className={styles.wrapper}>
      <ToolCard
        title="ABI Encode / Decode"
        description="ABI JSON을 입력하고 함수별 calldata 인코딩/디코딩을 수행합니다."
      >
        <TextareaField
          label="ABI JSON (array only)"
          value={abiText}
          onChange={handleAbiChange}
          rows={6}
          spellCheck={false}
        />
        <ErrorBanner message={abiError} />

        {functions.length > 0 && (
          <>
            <div className={styles.row}>
              <label className={styles.selectLabel}>
                함수 선택
                <select
                  className={styles.select}
                  value={selectedSig}
                  onChange={(e) => setSelectedSig(e.target.value)}
                >
                  {functions.map((fn) => (
                    <option key={fn.signature} value={fn.signature}>
                      {fn.signature}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.tabs}>
                <button
                  type="button"
                  className={tab === 'encode' ? styles.activeTab : styles.tab}
                  onClick={() => setTab('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={tab === 'decode' ? styles.activeTab : styles.tab}
                  onClick={() => setTab('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            {tab === 'encode' && selectedFunction && (
              <div className={styles.section}>
                <div className={styles.inputsGrid}>
                  {selectedFunction.fragment.inputs.map((input, idx) => (
                    <TextareaField
                      key={input.name || idx}
                      label={`${input.name || `arg${idx}`} (${input.type})`}
                      value={encodeInputs[idx] ?? ''}
                      onChange={(v) => handleInputChange(idx, v)}
                      rows={3}
                      spellCheck={false}
                      placeholder={
                        input.type.includes('[]')
                          ? '배열/tuple은 JSON으로 입력 (예: [1,2,3])'
                          : input.baseType === 'bytes'
                            ? '0x... hex 입력'
                            : ''
                      }
                    />
                  ))}
                </div>
                <p className={styles.helper}>
                  안내: 배열/tuple은 JSON 형태로 입력하세요. bytes 계열은 0x hex로 입력합니다.
                </p>
                <ErrorBanner message={encodeError} />
                <div className={styles.outputRow}>
                  <div>
                    <p className={styles.label}>Calldata</p>
                    <p className={styles.code}>{encoded?.calldata ?? ''}</p>
                    <div className={styles.meta}>
                      <span>Selector: {encoded?.selector ?? ''}</span>
                      <span>Bytes: {encoded?.length ?? 0}</span>
                    </div>
                  </div>
                  <CopyButton text={encoded?.calldata ?? ''} label="Copy calldata" />
                </div>
              </div>
            )}

            {tab === 'decode' && selectedFunction && (
              <div className={styles.section}>
                <TextareaField
                  label="Calldata (0x...)"
                  value={calldata}
                  onChange={(v) => {
                    setCalldata(v)
                    tryDecode(v)
                  }}
                  rows={4}
                  spellCheck={false}
                  placeholder="0xa9059cbb..."
                />
                <ErrorBanner message={decodeError} />
                <div className={styles.outputRow}>
                  <div>
                    <p className={styles.label}>Decoded params</p>
                    <pre className={styles.pre}>{decodeJson}</pre>
                  </div>
                  <CopyButton text={decodeJson} label="Copy JSON" />
                </div>
              </div>
            )}
          </>
        )}
      </ToolCard>
    </div>
  )
}
