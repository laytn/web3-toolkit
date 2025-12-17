import type { InputHTMLAttributes } from 'react'
import styles from './InputField.module.css'

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  onChange: (value: string) => void
}

export function InputField({ label, value, onChange, type = 'text', ...rest }: InputFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </label>
  )
}

export default InputField
