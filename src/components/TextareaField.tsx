import type { TextareaHTMLAttributes } from 'react'
import styles from './TextareaField.module.css'

interface TextareaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string
  onChange: (value: string) => void
}

export function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
  ...rest
}: TextareaFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <textarea
        className={styles.textarea}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </label>
  )
}

export default TextareaField
