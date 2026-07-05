import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initPWA } from './pwa'
import App from './App.tsx'

initPWA()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)