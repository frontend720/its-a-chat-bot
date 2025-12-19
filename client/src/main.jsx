import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { VeniceProvider } from './VeniceContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <VeniceProvider>
    <App />
  </VeniceProvider>,
)
