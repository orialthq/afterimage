import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/** 조명 속을 떠다니는 먼지 — 공간에 공기를 채운다 */
export function Dust({ count = 900, spread = [6, 4.2, 40], center = [0, 2, -16] as [number, number, number] }) {
  const ref = useRef<THREE.Points>(null!)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = center[0] + (Math.random() - 0.5) * spread[0]
      positions[i * 3 + 1] = Math.random() * spread[1]
      positions[i * 3 + 2] = center[2] + (Math.random() - 0.5) * spread[2]
      speeds[i] = 0.02 + Math.random() * 0.06
    }
    return { positions, speeds }
  }, [count, spread, center])

  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 32
    const g = c.getContext('2d')!
    const r = g.createRadialGradient(16, 16, 0, 16, 16, 16)
    r.addColorStop(0, 'rgba(255,240,210,1)')
    r.addColorStop(1, 'rgba(255,240,210,0)')
    g.fillStyle = r
    g.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((state, dt) => {
    const a = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + speeds[i] * dt
      if (y > spread[1]) y = 0
      a.setY(i, y)
      a.setX(i, a.getX(i) + Math.sin(t * 0.3 + i) * 0.0008)
    }
    a.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.035}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#ffe8c2"
        sizeAttenuation
      />
    </points>
  )
}

export function Effects({ bloom = 0.85, threshold = 0.55 }: { bloom?: number; threshold?: number }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={threshold} luminanceSmoothing={0.3} radius={0.75} />
      <Vignette offset={0.25} darkness={0.85} />
    </EffectComposer>
  )
}
