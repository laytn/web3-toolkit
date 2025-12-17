import type { ReactNode } from 'react'
import styles from './ToolCard.module.css'

interface ToolCardProps {
  title: string
  description?: string
  children: ReactNode
  id?: string
}

export function ToolCard({ title, description, children, id }: ToolCardProps) {
  return (
    <section className={styles.card} id={id}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Web3 Toolkit</p>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

export default ToolCard
