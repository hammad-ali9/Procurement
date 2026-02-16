import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ProcurementProvider } from './context/ProcurementProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProcurementProvider>
      <App />
    </ProcurementProvider>
  </StrictMode>,
)
