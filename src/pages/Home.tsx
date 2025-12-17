import { Link } from 'react-router-dom'
import ToolCard from '../components/ToolCard'
import { families } from '../registry'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.hero}>
        <p className={styles.badge}>Chain Families</p>
        <h1>Web3 Developer Toolkit</h1>
        <p className={styles.subtitle}>
          체인별로 도구를 모았습니다. 카테고리를 선택해 세부 툴을 탐색하세요.
        </p>
      </header>
      <div className={styles.grid}>
        {families.map((family) => (
          <ToolCard
            key={family.id}
            title={family.title}
            description={family.description}
          >
            <Link to={family.basePath} className={styles.cardLink}>
              Open {family.title} tools
            </Link>
          </ToolCard>
        ))}
      </div>
    </div>
  )
}
