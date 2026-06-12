import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, message: string, duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: Toast = { id, type, message, duration }
    
    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => {
    showToast('success', message, duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast('error', message, duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast('warning', message, duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast('info', message, duration)
  }, [showToast])

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <AlertCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      case 'info':
        return <Info size={20} />
    }
  }

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 text-green-900'
      case 'error':
        return 'bg-white border-l-4 border-red-500 text-red-900'
      case 'warning':
        return 'bg-white border-l-4 border-amber-500 text-amber-900'
      case 'info':
        return 'bg-white border-l-4 border-blue-500 text-blue-900'
    }
  }

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-amber-500'
      case 'info':
        return 'text-blue-500'
    }
  }

  const value = {
    showToast,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`${getToastStyles(toast.type)} shadow-lg rounded-lg p-4 pointer-events-auto transform transition-all duration-300 ease-in-out`}
            style={{
              animation: 'slideInRight 0.3s ease-out',
              opacity: 1,
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`${getIconColor(toast.type)} flex-shrink-0 mt-0.5`}>
                {getToastIcon(toast.type)}
              </div>
              <p className="body-md flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-ink-mute hover:text-ink transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
