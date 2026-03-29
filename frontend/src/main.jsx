import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import AppRouter from './AppRouter.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppRouter />
        <Toaster position="top-right" richColors />
    </StrictMode>
)
