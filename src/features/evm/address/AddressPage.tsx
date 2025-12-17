import { useState } from 'react'
import CopyButton from '../../../components/CopyButton'
import ErrorBanner from '../../../components/ErrorBanner'
import InputField from '../../../components/InputField'
import ToolCard from '../../../components/ToolCard'
import { analyzeAddress, type AddressResult } from '../../../lib/address'
import styles from './AddressPage.module.css'

export default function AddressPage() {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<AddressResult | null>(null)

  const handleChange = (next: string) => {
    setValue(next)
    if (next.trim() === '') {
      setResult(null)
      return
    }
    setResult(analyzeAddress(next))
  }

  return (
    <div className={styles.wrapper}>
      <ToolCard
        title="EVM Address Tools"
        description="EIP-55 체크섬 생성 및 주소 유효성 검사"
      >
        <div className={styles.row}>
          <InputField
            label="Address"
            value={value}
            onChange={handleChange}
            spellCheck={false}
            placeholder="0x..."
          />
        </div>

        {result?.isValid && result.checksum ? (
          <div className={styles.result}>
            <p className={styles.status}>유효한 주소입니다.</p>
            <div className={styles.checksumRow}>
              <div>
                <p className={styles.label}>EIP-55 Checksum</p>
                <p className={styles.code}>{result.checksum}</p>
              </div>
              <CopyButton text={result.checksum} />
            </div>
            {result.alreadyChecksummed ? (
              <p className={styles.helper}>입력된 주소가 이미 체크섬 형태입니다.</p>
            ) : (
              <p className={styles.helper}>위 체크섬 주소를 사용하는 것을 추천합니다.</p>
            )}
          </div>
        ) : (
          <ErrorBanner message={result?.error} />
        )}
      </ToolCard>
    </div>
  )
}
