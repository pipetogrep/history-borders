import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './TimelineRefinement.css'
import './data/bosniaDepth.ts'
import './data/ottomanAftermath.ts'
import './data/abbasidFragmentation.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
