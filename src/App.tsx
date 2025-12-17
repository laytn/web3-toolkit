import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import EvmLanding from './features/evm/EvmLanding'
import { tools } from './registry'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/evm" element={<EvmLanding />} />
          {tools.map((tool) => (
            <Route key={tool.path} path={tool.path} element={tool.element} />
          ))}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>
          Built with React, Vite, and ethers. Hash routing keeps GitHub Pages refresh-safe.
        </p>
      </footer>
    </div>
  )
}

export default App
