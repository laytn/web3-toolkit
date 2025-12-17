import { useState } from 'react'
import styles from './CopyButton.module.css'

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  return (
    <button className={styles.button} type="button" onClick={handleCopy}>
      {copied ? 'Copied!' : label}
    </button>
  )
}

export default CopyButton
