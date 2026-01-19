import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Tokencontextprovider from './context/tokenContext.jsx'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import ThemeContextProvider from './context/ThemeContext.jsx'

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
    <ThemeContextProvider>
    <Tokencontextprovider>
  <QueryClientProvider client={queryClient}>
    <StrictMode>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid rgba(56, 189, 248, 0.3)',
        },
        success: {
          iconTheme: {
            primary: '#0ea5e9',
            secondary: '#e2e8f0',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#e2e8f0',
          },
        },
      }}
    />
    <ReactQueryDevtools initialIsOpen={false} />
  </StrictMode>
  </QueryClientProvider>

  
  </Tokencontextprovider>
  </ThemeContextProvider>

)
