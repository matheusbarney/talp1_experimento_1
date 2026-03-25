import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.tsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastContainer
      aria-label="Notifications"
      position="top-right"
      autoClose={2800}
      hideProgressBar={false}
      closeOnClick
    />
  </StrictMode>,
)
