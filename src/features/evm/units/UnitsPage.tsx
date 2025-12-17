import { useMemo, useState } from 'react'
import CopyButton from '../../../components/CopyButton'
import ErrorBanner from '../../../components/ErrorBanner'
import InputField from '../../../components/InputField'
import ToolCard from '../../../components/ToolCard'
import { convertUnits, type Unit } from '../../../lib/units'
import styles from './UnitsPage.module.css'

const emptyValues: Record<Unit, string> = { wei: '', gwei: '', ether: '' }

export default function UnitsPage() {
  const [values, setValues] = useState<Record<Unit, string>>(emptyValues)
  const [hexAsWei, setHexAsWei] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUnit, setLastUnit] = useState<Unit>('ether')

  const handleUpdate = (value: string, unit: Unit, useHexAsWei = hexAsWei) => {
    setLastUnit(unit)
    const result = convertUnits(value, unit, useHexAsWei)

    if (result.ok && result.values) {
      setValues(result.values)
      setError(null)
    } else {
      setValues((prev) => ({ ...prev, [unit]: value }))
      setError(result.error ?? '값을 변환할 수 없습니다.')
    }
  }

  const handleToggleHex = (checked: boolean) => {
    setHexAsWei(checked)
    if (values[lastUnit]) {
      const result = convertUnits(values[lastUnit], lastUnit, checked)
      if (result.ok && result.values) {
        setValues(result.values)
        setError(null)
      } else if (result.error) {
        setError(result.error)
      }
    }
  }

  const infoText = useMemo(
    () =>
      hexAsWei
        ? '0x 입력 시 정수 wei로 직접 해석합니다.'
        : '0x 입력 시 선택한 단위의 숫자로 해석합니다.',
    [hexAsWei]
  )

  return (
    <div className={styles.wrapper}>
      <ToolCard
        title="ETH Unit Calculator"
        description="wei / gwei / ether 값을 BigInt 기반으로 정확히 변환합니다."
      >
        <div className={styles.row}>
          <InputField
            label="Wei"
            inputMode="decimal"
            spellCheck={false}
            value={values.wei}
            onChange={(v) => handleUpdate(v, 'wei')}
            placeholder="정수 또는 0x..."
          />
          <CopyButton text={values.wei} />
        </div>

        <div className={styles.row}>
          <InputField
            label="Gwei"
            inputMode="decimal"
            spellCheck={false}
            value={values.gwei}
            onChange={(v) => handleUpdate(v, 'gwei')}
            placeholder="예: 0.1 또는 0x..."
          />
          <CopyButton text={values.gwei} />
        </div>

        <div className={styles.row}>
          <InputField
            label="Ether"
            inputMode="decimal"
            spellCheck={false}
            value={values.ether}
            onChange={(v) => handleUpdate(v, 'ether')}
            placeholder="예: 1.25 또는 0x..."
          />
          <CopyButton text={values.ether} />
        </div>

        <div className={styles.options}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={hexAsWei}
              onChange={(e) => handleToggleHex(e.target.checked)}
            />
            <span>0x 입력을 정수 wei로 해석</span>
          </label>
          <p className={styles.helper}>{infoText}</p>
        </div>

        <ErrorBanner message={error} />
      </ToolCard>
    </div>
  )
}
