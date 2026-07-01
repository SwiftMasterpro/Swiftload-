'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type BackgroundSceneProps = {
  reducedMotion: boolean
}

function PatternPlane({ reducedMotion }: BackgroundSceneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const g = ctx.createLinearGradient(0, 0, 0, canvas.height)
    g.addColorStop(0, '#060B14')
    g.addColorStop(1, '#0E1B2E')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(0, 0)
    ctx.globalAlpha = 0.16
    ctx.strokeStyle = '#34D67A'
    ctx.lineWidth = 4

    const tile = 140
    for (let y = -tile; y < canvas.height + tile; y += tile) {
      for (let x = -tile; x < canvas.width + tile; x += tile) {
        ctx.beginPath()
        ctx.moveTo(x, y + tile)
        ctx.lineTo(x + tile * 0.5, y)
        ctx.lineTo(x + tile, y + tile)
        ctx.lineTo(x + tile * 0.5, y + tile * 2)
        ctx.closePath()
        ctx.stroke()
      }
    }

    for (let y = -tile; y < canvas.height + tile; y += tile * 1.2) {
      for (let x = -tile; x < canvas.width + tile; x += tile * 1.2) {
        ctx.beginPath()
        ctx.arc(x, y, 34, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    for (let y = -tile; y < canvas.height + tile; y += tile * 1.8) {
      for (let x = -tile; x < canvas.width + tile; x += tile * 1.8) {
        ctx.beginPath()
        ctx.moveTo(x - 16, y)
        ctx.lineTo(x + 16, y)
        ctx.moveTo(x, y - 16)
        ctx.lineTo(x, y + 16)
        ctx.stroke()
      }
    }

    ctx.restore()

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }, [])

  useFrame(({ clock }) => {
    if (!materialRef.current || reducedMotion) return
    const elapsed = clock.getElapsedTime()
    materialRef.current.uniforms.uTime.value = elapsed
  })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTexture: { value: texture },
    }),
    [texture]
  )

  return (
    <mesh position={[0, 0, -1]} rotation={[-Math.PI / 2.4, 0, 0]} scale={[viewport.width * 0.8, viewport.height * 0.8, 1]}>
      <planeGeometry args={[1, 1, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float ripple = sin(pos.x * 2.2 + uTime * 0.12) * 0.012 + cos(pos.y * 1.8 - uTime * 0.09) * 0.01;
            pos.z += ripple;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uTexture;
          varying vec2 vUv;
          void main() {
            vec4 tex = texture2D(uTexture, vUv);
            vec3 base = mix(vec3(0.02, 0.05, 0.08), vec3(0.19, 0.84, 0.48), 0.06 + tex.r * 0.1);
            gl_FragColor = vec4(base, 0.1 + tex.g * 0.05);
          }
        `}
        transparent
      />
    </mesh>
  )
}

export function AmbientBackgroundScene({ reducedMotion }: BackgroundSceneProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries.some((entry) => entry.isIntersecting))
      },
      { threshold: 0.1 }
    )

    const target = document.querySelector('main') || document.body
    observer.observe(target)

    const handleVisibility = () => setIsVisible(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div className="ambient-background__canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        frameloop={isVisible ? 'always' : 'demand'}
      >
        <color attach="background" args={['#060B14']} />
        <PatternPlane reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
