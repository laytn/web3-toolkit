import { Link } from 'react-router-dom'
import ToolCard from '../../components/ToolCard'
import { toolsByFamily } from '../../registry'
import styles from './EvmLanding.module.css'

export default function EvmLanding() {
  const tools = toolsByFamily('evm')

  return (
    <div className={styles.wrapper}>
      <header className={styles.hero}>
        <p className={styles.badge}>EVM Family</p>
        <h1>EVM Developer Toolkit</h1>
        <p className={styles.subtitle}>
          Ethereum 및 EVM 호환 체인을 위한 단위 변환, 해시, 서명 복구, ABI 인코딩/디코딩 도구.
        </p>
      </header>
      <div className={styles.grid}>
        {tools.map((tool) => (
          <ToolCard key={tool.id} title={tool.title} description={tool.description}>
            <Link to={tool.path} className={styles.cardLink}>
              Open {tool.title}
            </Link>
          </ToolCard>
        ))}
      </div>
    </div>
  )
}
