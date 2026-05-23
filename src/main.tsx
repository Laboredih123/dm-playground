import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './app/App'
import { registerOfflineServiceWorker } from './services/offlineServiceWorker'
import { printConsoleWarnings } from './utils/consoleWarnings'

printConsoleWarnings()
void registerOfflineServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
