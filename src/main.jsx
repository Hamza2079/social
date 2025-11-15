import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Tokencontextprovider from './context/tokenContext.jsx'

createRoot(document.getElementById('root')).render(
  <Tokencontextprovider>
      <StrictMode>
    <App />
  </StrictMode>
  </Tokencontextprovider>

)
