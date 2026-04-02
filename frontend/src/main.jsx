import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './presentation/index.css'
import AppRouter from '@presentation/AppRouter.jsx'
import { NotificationProvider } from '@application/services/NotificationContext'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <NotificationProvider>
            <AppRouter />
            <Toaster position="top-right" richColors />
        </NotificationProvider>
    </StrictMode>
)
