import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './presentation/index.css'
import AppRouter from '@presentation/AppRouter.jsx'
import '@application/services/AppServices'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppRouter />
        <Toaster position="top-right" richColors />
    </StrictMode>
)
