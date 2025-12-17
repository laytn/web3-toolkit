import { Link, NavLink } from 'react-router-dom'
import { families } from '../registry'
import styles from './NavBar.module.css'

export function NavBar() {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>W3</span>
          <span className={styles.brandText}>web3-toolkit</span>
        </Link>
        <nav className={styles.familyNav}>
          {families.map((family) => (
            <NavLink
              key={family.id}
              to={family.basePath}
              className={({ isActive }) =>
                isActive ? styles.activeFamily : styles.familyLink
              }
            >
              {family.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default NavBar
