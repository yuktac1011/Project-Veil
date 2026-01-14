import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AnonAadhaarProvider } from '@anon-aadhaar/react'
import App from './App.tsx'
import './index.css'

// Use the App ID you registered or a random number for testing
const app_id = process.env.VITE_APP_ID || "12345678"; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* _useTestAadhaar={true} allows you to use sample QR codes for dev */}
    <AnonAadhaarProvider _useTestAadhaar={true} _appName={app_id}>
      <App />
    </AnonAadhaarProvider>
  </StrictMode>,
)