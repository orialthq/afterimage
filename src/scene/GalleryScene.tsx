import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Dust, Effects } from './Atmosphere'
import { Corridor } from './Corridor'
import { EYE, type Placement } from './layout'

interface Props {
  placements: Placement[]
  walk: React.MutableRefObject<number>
  selected: string | null
  hovered: string | null
  adopted: Record<string, unknown>
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  onMiss: () => void
}

export function GalleryScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, EYE, 7], fov: 70, near: 0.05, far: 80 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
      onPointerMissed={props.onMiss}
    >
      <color attach="background" args={['#000']} />
      <fog attach="fog" args={['#000', 5, 30]} />
      <ambientLight intensity={0.07} />
      <Rig {...props} />
      <Corridor
        placements={props.placements}
        hovered={props.hovered}
        selected={props.selected}
        adopted={props.adopted}
        interactive
        onHover={props.onHover}
        onSelect={props.onSelect}
      />
      <Dust count={800} spread={[6, 4.2, 50]} center={[0, 2, -22]} />
      <Effects bloom={0.7} threshold={0.82} />
    </Canvas>
  )
}

function Rig({ placements, walk, selected }: Props) {
  const { camera, pointer } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const look = useRef(new THREE.Vector3(0, 1.7, -10))
  const wantPos = useMemo(() => new THREE.Vector3(), [])
  const wantLook = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const sel = selected ? placements.find((p) => p.work.id === selected) : undefined
    if (sel) {
      wantPos.set(...sel.view)
      wantLook.set(...sel.look)
      cam.fov = THREE.MathUtils.damp(cam.fov, 48, 3, dt)
    } else {
      const z = walk.current
      wantPos.set(pointer.x * 0.25, EYE + pointer.y * 0.08, z)
      wantLook.set(pointer.x * 1.6, 1.68 + pointer.y * 0.3, z - 8)
      cam.fov = THREE.MathUtils.damp(cam.fov, 60, 2.5, dt)
    }
    const k = sel ? 2.6 : 3.2
    cam.position.x = THREE.MathUtils.damp(cam.position.x, wantPos.x, k, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, wantPos.y, k, dt)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, wantPos.z, k, dt)
    look.current.lerp(wantLook, 1 - Math.exp(-k * dt))
    cam.lookAt(look.current)
    cam.updateProjectionMatrix()
  })
  return null
}
