import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { aplicarPreferencias, preferenciasGuardadas } from './utils/preferencias'

// Antes de desenhar a tela, já aplica o tema e a letra da última visita (evita "piscar")
aplicarPreferencias(preferenciasGuardadas())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
