import { MeshReflectorMaterial } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Artwork } from '../data/types'
import { Dust, Effects } from './Atmosphere'
import { Corridor } from './Corridor'
import { EYE, place } from './layout'

const DOOR_W = 2.2
const DOOR_H = 3.5
const START_Z = 15

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInCubic = (t: number) => t * t * t
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
/** 문턱 통과 지점 (스크롤 진행도) */
export const THRESHOLD = 0.62

export function PortalScene({ progress, works }: { progress: React.MutableRefObject<number>; works: Artwork[] }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, EYE, START_Z], fov: 32, near: 0.05, far: 80 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <color attach="background" args={['#000']} />
      <fog attach="fog" args={['#000', 6, 34]} />
      <ambientLight intensity={0.06} />
      <Rig progress={progress} works={works} />
      <Effects bloom={1.1} />
    </Canvas>
  )
}

function Rig({ progress, works }: { progress: React.MutableRefObject<number>; works: Artwork[] }) {
  const { camera, pointer } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const smooth = useRef(0)
  const lights = useRef(0)
  const slab = useRef<THREE.MeshBasicMaterial>(null!)
  const spill = useRef<THREE.MeshBasicMaterial>(null!)
  const doorLight = useRef<THREE.SpotLight>(null!)
  const look = useMemo(() => new THREE.Vector3(), [])
  const placements = useMemo(() => place(works), [works])

  const spillTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 256
    const g = c.getContext('2d')!
    const grd = g.createLinearGradient(0, 0, 0, 256)
    grd.addColorStop(0, 'rgba(255,226,170,0.9)')
    grd.addColorStop(0.35, 'rgba(255,226,170,0.25)')
    grd.addColorStop(1, 'rgba(255,226,170,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 256)
    // 옆으로도 부드럽게 퍼지게
    g.globalCompositeOperation = 'destination-in'
    const side = g.createLinearGradient(0, 0, 64, 0)
    side.addColorStop(0, 'rgba(0,0,0,0)')
    side.addColorStop(0.3, 'rgba(0,0,0,1)')
    side.addColorStop(0.7, 'rgba(0,0,0,1)')
    side.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = side
    g.fillRect(0, 0, 64, 256)
    return new THREE.CanvasTexture(c)
  }, [])

  const doorTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, 0, 8)
    return o
  }, [])

  useFrame((state, dt) => {
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, 4, dt)
    const p = smooth.current
    const a = clamp01(p / THRESHOLD)
    const b = clamp01((p - THRESHOLD) / (1 - THRESHOLD))

    // 빨려 들어가기: 점점 가속(ease-in) + 화각이 넓어지는 돌리 줌
    const z = p < THRESHOLD ? THREE.MathUtils.lerp(START_Z, 0.4, easeInCubic(a)) : THREE.MathUtils.lerp(0.4, -2.5, easeOut(b))
    const fov = p < THRESHOLD ? THREE.MathUtils.lerp(32, 82, easeInCubic(a)) : THREE.MathUtils.lerp(82, 58, easeOut(b))
    const breathe = Math.sin(state.clock.elapsedTime * 0.6) * 0.02
    const par = 1 - a * 0.8
    cam.position.set(pointer.x * 0.35 * par, EYE + breathe + pointer.y * 0.12 * par, z)
    cam.fov = fov
    cam.updateProjectionMatrix()
    look.set(pointer.x * 0.6 * par, 1.75, z - 10)
    cam.lookAt(look)

    // 문 안의 빛: 문턱 직전 가장 밝고, 통과하면 걷힌다
    const glow = p < THRESHOLD ? 1.4 + easeInCubic(a) * 4 : Math.max(0, 5.4 * (1 - b * 3.2))
    slab.current.color.setRGB(1.0 * glow, 0.88 * glow, 0.68 * glow)
    slab.current.opacity = clamp01(1 - b * 3)
    spill.current.opacity = 0.55 * (1 - b)
    doorLight.current.intensity = 30 * (1 - b)
    lights.current = clamp01(b * 1.25)
  })

  return (
    <group>
      {/* 바깥 공간: 검은 로비 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 10]}>
        <planeGeometry args={[30, 20]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={512}
          mixBlur={1}
          mixStrength={2.2}
          roughness={0.85}
          color="#070605"
          metalness={0.6}
          mirror={0.5}
        />
      </mesh>
      {/* 문이 뚫린 벽 */}
      <group position={[0, 0, 0]}>
        <mesh position={[-(DOOR_W / 2 + 7), 5, 0]}>
          <planeGeometry args={[14, 10]} />
          <meshStandardMaterial color="#0f0d0a" roughness={1} />
        </mesh>
        <mesh position={[DOOR_W / 2 + 7, 5, 0]}>
          <planeGeometry args={[14, 10]} />
          <meshStandardMaterial color="#0f0d0a" roughness={1} />
        </mesh>
        <mesh position={[0, DOOR_H + (10 - DOOR_H) / 2, 0]}>
          <planeGeometry args={[DOOR_W, 10 - DOOR_H]} />
          <meshStandardMaterial color="#0f0d0a" roughness={1} />
        </mesh>
        {/* 문틀 */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (DOOR_W / 2), DOOR_H / 2, -0.25]} rotation={[0, s * (Math.PI / 2), 0]}>
            <planeGeometry args={[0.5, DOOR_H]} />
            <meshStandardMaterial color="#2a241b" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 문 안을 가득 채운 빛 */}
      <mesh position={[0, DOOR_H / 2, -0.45]}>
        <planeGeometry args={[DOOR_W, DOOR_H]} />
        <meshBasicMaterial ref={slab} toneMapped={false} transparent />
      </mesh>
      {/* 바닥으로 쏟아지는 빛 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 3.2]}>
        <planeGeometry args={[DOOR_W * 2.2, 7]} />
        <meshBasicMaterial
          ref={spill}
          map={spillTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <primitive object={doorTarget} />
      <spotLight
        ref={doorLight}
        position={[0, DOOR_H - 0.2, -0.6]}
        target={doorTarget}
        angle={0.55}
        penumbra={0.8}
        distance={18}
        decay={1.2}
        color="#ffd9a0"
      />

      {/* 문 너머: 실제 기획전 복도 */}
      <group position={[0, 0, -0.5]}>
        <Corridor placements={placements} lightsRef={lights} showLabels={false} />
      </group>

      <Dust count={500} spread={[5, 4, 12]} center={[0, 2, 3]} />
      <Dust count={600} spread={[6, 4.2, 40]} center={[0, 2, -20]} />
    </group>
  )
}
