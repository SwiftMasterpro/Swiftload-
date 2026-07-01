'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const AmbientBackgroundScene = dynamic(() => import('./AmbientBackgroundScene').then((mod) => mod.AmbientBackgroundScene), {
  ssr: false,
  loading: () => null,
})

export function AmbientBackground() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateReducedMotion = () => setReducedMotion(media.matches)
    updateReducedMotion()
    media.addEventListener('change', updateReducedMotion)

    const width = window.innerWidth
    const cores = navigator.hardwareConcurrency || 4
    setUseFallback(width < 768 || cores <= 4)

    return () => media.removeEventListener('change', updateReducedMotion)
  }, [])

  if (reducedMotion || useFallback) {
    return (
      <div
        aria-hidden="true"
        className="ambient-background__fallback"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: "linear-gradient(135deg, #060B14 0%, #0E1B2E 100%), radial-gradient(circle at 20% 20%, rgba(52,214,122,0.18), transparent 32%), repeating-linear-gradient(135deg, rgba(52,214,122,0.07) 0 11px, transparent 11px 22px), repeating-linear-gradient(45deg, rgba(159,239,192,0.05) 0 8px, transparent 8px 16px)",
          backgroundBlendMode: 'screen, normal, normal, normal',
          opacity: 0.8,
        }}
      />
    )
  }

  return <AmbientBackgroundScene reducedMotion={reducedMotion} />
}
