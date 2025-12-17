import styles from './ErrorBanner.module.css'

interface ErrorBannerProps {
  message?: string | null
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null

  return (
    <div className={styles.banner} role="alert">
      {message}
    </div>
  )
}

export default ErrorBanner
