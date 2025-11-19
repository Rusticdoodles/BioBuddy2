'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check } from 'lucide-react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const LaunchBanner = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  // Set your launch end date: December 8th, 2025 at midnight UTC
  const endDate = new Date('2025-12-08T00:00:00Z').getTime()
  const discountCode = 'LAUNCH'

  useEffect(() => {
    // Check if user dismissed the banner
    const dismissed = localStorage.getItem('launchBannerDismissed')
    if (dismissed) {
      setIsVisible(false)
      return
    }

    // Countdown timer
    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = endDate - now

      if (distance < 0) {
        setIsExpired(true)
        setIsVisible(false)
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }

    // Initial update
    updateTimer()

    // Update every second
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('launchBannerDismissed', 'true')
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(discountCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      console.error('Failed to copy:', err)
    }
  }

  // Don't render if dismissed or expired
  if (!isVisible || isExpired) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white py-3 px-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left relative">
        {/* Message */}
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🚀</span>
          <span className="font-medium">
            Launch Special: <span className="font-bold">$10 off</span> lifetime access!
          </span>
        </div>

        {/* Discount Code */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors font-medium"
          aria-label={`Copy discount code ${discountCode}`}
          tabIndex={0}
        >
          <span className="font-mono font-bold">{discountCode}</span>
          {copied ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Copy className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {/* Countdown */}
        <div className="flex items-center gap-1 text-sm">
          <span>Ends in:</span>
          <div className="flex gap-1 font-mono font-bold">
            <span className="bg-white/20 px-2 py-0.5 rounded" aria-label={`${timeLeft.days} days`}>
              {timeLeft.days}d
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded" aria-label={`${timeLeft.hours} hours`}>
              {timeLeft.hours}h
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded" aria-label={`${timeLeft.minutes} minutes`}>
              {timeLeft.minutes}m
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded" aria-label={`${timeLeft.seconds} seconds`}>
              {timeLeft.seconds}s
            </span>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors sm:relative sm:right-auto sm:top-auto sm:translate-y-0"
          aria-label="Dismiss banner"
          tabIndex={0}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

