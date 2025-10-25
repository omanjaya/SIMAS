"use client"

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface LiveTimerProps {
  checkInTime: string
}

export function LiveTimer({ checkInTime }: LiveTimerProps) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const start = new Date(checkInTime).getTime()
      const diff = now - start

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setElapsed(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, 
'0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [checkInTime])

  return (
    <div className="flex items-center gap-2 text-lg font-mono font-bold text-primary">
      <Clock className="h-5 w-5 animate-pulse" />
      {elapsed || '00:00:00'}
    </div>
  )
}