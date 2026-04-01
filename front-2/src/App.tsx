import { useState, useEffect } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { FlowPanel } from './components/FlowPanel'
import './App.css'

function App() {
  const [flowPanelViewId, setFlowPanelViewId] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const handleLogout = () => {
    setFlowPanelViewId(null)
  }

  const handleToggleDark = () => setIsDark((prev) => !prev)

  return (
    <div className="app">
      <ChatInterface
        onLogout={handleLogout}
        onOpenFlowPanel={(viewId) => setFlowPanelViewId(viewId)}
        isDark={isDark}
        onToggleDark={handleToggleDark}
      />
      {flowPanelViewId && (
        <FlowPanel viewId={flowPanelViewId} onClose={() => setFlowPanelViewId(null)} />
      )}
    </div>
  )
}

export default App
