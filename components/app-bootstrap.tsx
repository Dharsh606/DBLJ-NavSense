'use client'

import { useEffect } from 'react'
import { storageService } from '@/lib/storage-service'

export default function AppBootstrap() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => null)
    }
    storageService.set('lastLaunchAt', new Date().toISOString())
  }, [])

  return null
}

