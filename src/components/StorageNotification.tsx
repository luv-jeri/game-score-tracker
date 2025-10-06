'use client'

import { useState, useEffect } from 'react'

type StorageNotificationProps = {
  show: boolean
  message: string
  type: 'warning' | 'error' | 'info'
  onClose: () => void
}

export default function StorageNotification({ show, message, type, onClose }: StorageNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Auto-hide after 10 seconds (longer for important messages)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, 10000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, onClose])

  if (!show && !isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800'
      case 'error':
        return 'bg-red-100 border-red-400 text-red-800'
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-800'
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={`max-w-md p-4 rounded-lg border-2 shadow-lg ${getTypeStyles()}`}>
        <div className="flex items-start space-x-3">
          <span className="text-xl">{getIcon()}</span>
          <div className="flex-1">
            <p className="font-semibold text-sm">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="text-lg hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
