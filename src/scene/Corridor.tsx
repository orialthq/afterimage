import { Html, MeshReflectorMaterial, SpotLight } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { artistById } from '../data/catalog'
import { artCanvas, vesselProfile } from '../lib/artgen'
import { CEIL, WALL_X, corridorLength, type Placement } from './layout'

interface Props {
  placements: Placement[]
  hovered?: string | null
  selected?: string | null
  adopted?: Record<string, unknown>
  interactive?: boolean
  onHover?: (id: string | null) => void
  onSelect?: (id: string) => void
  /** 0..1 — 입장 전에는 조명이 꺼져 있다가 하나씩 켜짐 */
  lightsRef?: React.MutableRefObject<number>
  showLabels?: boolean
}

const wallMat = new THREE.MeshStandardMaterial({ color: '#2a241c', roughness: 0.96, metalness: 0 })
const frameMat = new THREE.MeshStandardMaterial({ color: '#0f0d0b', roughness: 0.6, metalness: 0.2 })
const plinthMat = new THREE.MeshStandardMaterial({ color: '#2a251e', roughness: 0.9 })

export function Corridor({
  placements,
  hovered,
  selected,
  adopted = {},
  interactive,
  onHover,
  onSelect,
  lightsRef,
  showLabels = true,
}: Props) {
  const len = corridorLength(placements.length)
  const midZ = -len / 2 + 2

  return (
    <group>
      {/* floor — dark polished concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]}>
        <planeGeometry args={[WALL_X * 2, len + 6]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={512}
          mixBlur={1}
          mixStrength={1.6}
          roughness={0.9}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0b0a09"
          metalness={0.6}
          mirror={0.4}
        />
      </mesh>
      {/* walls */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * WALL_X, CEIL / 2, midZ]} rotation={[0, -s * (Math.PI / 2), 0]} material={wallMat}>
          <planeGeometry args={[len + 6, CEIL]} />
        </mesh>
      ))}
      {/* ceiling + track rail */}
      <mesh position={[0, CEIL, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WALL_X * 2, len + 6]} />
        <meshStandardMaterial color="#050504" roughness={1} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, CEIL - 0.02, midZ]}>
          <boxGeometry args={[0.04, 0.03, len]} />
          <meshStandardMaterial color="#000" emissive="#3a3226" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* end wall */}
      <mesh position={[0, CEIL / 2, -len + 2]}>
        <planeGeometry args={[WALL_X * 2, CEIL]} />
        <meshStandardMaterial color="#17140f" roughness={1} />
      </mesh>

      {placements.map((p, i) => (
        <Piece
          key={p.work.id}
          p={p}
          index={i}
          hot={hovered === p.work.id || selected === p.work.id}
          dimmed={!!selected && selected !== p.work.id}
          adopted={!!adopted[p.work.id]}
          interactive={interactive}
          onHover={onHover}
          onSelect={onSelect}
          lightsRef={lightsRef}
          showLabel={showLabels}
          selectedSelf={selected === p.work.id}
        />
      ))}
    </group>
  )
}

function Piece({
  p,
  index,
  hot,
  dimmed,
  adopted,
  interactive,
  onHover,
  onSelect,
  lightsRef,
  showLabel,
  selectedSelf,
}: {
  p: Placement
  index: number
  hot: boolean
  dimmed: boolean
  adopted: boolean
  interactive?: boolean
  onHover?: (id: string | null) => void
  onSelect?: (id: string) => void
  lightsRef?: React.MutableRefObject<number>
  showLabel: boolean
  selectedSelf?: boolean
}) {
  const light = useRef<THREE.SpotLight>(null!)
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(...p.pos)
    return o
  }, [p])

  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(artCanvas(p.work, 1024))
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
  }, [p.work])

  useFrame((_, dt) => {
    if (!light.current) return
    // 입장 연출: lightsRef 진행도에 맞춰 앞에서부터 차례로 점등
    const on = lightsRef ? THREE.MathUtils.clamp(lightsRef.current * (8 + 2) - index, 0, 1) : 1
    const want = (selectedSelf ? 55 : hot ? 115 : dimmed ? 22 : 80) * on
    light.current.intensity = THREE.MathUtils.damp(light.current.intensity, want, 6, dt)
  })

  const handlers = interactive
    ? {
        onPointerOver: (e: { stopPropagation: () => void }) => {
          e.stopPropagation()
          onHover?.(p.work.id)
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          onHover?.(null)
          document.body.style.cursor = ''
        },
        onClick: (e: { stopPropagation: () => void }) => {
          e.stopPropagation()
          onSelect?.(p.work.id)
        },
      }
    : {}

  const [x, y, z] = p.pos
  const rotY = -p.side * (Math.PI / 2)
  const artist = artistById(p.work.artistId)

  return (
    <group>
      <primitive object={target} />
      <SpotLight
        ref={light}
        position={[p.side * (WALL_X - 1.6), CEIL - 0.05, z + 0.6]}
        target={target}
        angle={p.work.kind === 'vessel' ? 0.42 : 0.5}
        penumbra={0.65}
        distance={8}
        decay={1.4}
        intensity={0}
        color="#ffe2b0"
        attenuation={4.2}
        anglePower={5}
        opacity={0.22}
        radiusTop={0.04}
        radiusBottom={1.4}
      />

      {p.work.kind === 'vessel' ? (
        <group position={[x, 0, z]}>
          <mesh position={[0, y / 2, 0]} material={plinthMat}>
            <boxGeometry args={[0.7, y, 0.7]} />
          </mesh>
          <Vessel seed={p.work.seed} palette={p.work.palette} y={y} {...handlers} />
        </group>
      ) : (
        <group position={[x, y, z]} rotation={[0, rotY, 0]} {...handlers}>
          <mesh material={frameMat} position={[0, 0, -0.02]}>
            <boxGeometry args={[p.w + 0.1, p.h + 0.1, 0.05]} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[p.w, p.h]} />
            <meshStandardMaterial map={tex} roughness={0.85} metalness={0} />
          </mesh>
        </group>
      )}

      {showLabel && !dimmed && !(hot && selectedSelf) && (
        <Html
          transform
          position={
            p.work.kind === 'vessel'
              ? [p.side * (WALL_X - 0.02), 1.5, z - 0.95 * p.side]
              : [p.side * (WALL_X - 0.02), 1.2, z + (p.w / 2 + 0.62) * p.side]
          }
          rotation={[0, rotY, 0]}
          distanceFactor={2}
          zIndexRange={[10, 0]}
          pointerEvents="none"
        >
          <div className="w-[190px] select-none text-left" style={{ color: '#a59d8f' }}>
            <div className="flex items-center gap-2 text-[13px]" style={{ color: '#d4cdbf' }}>
              {adopted && <span className="reddot" />}
              {artist.name}
            </div>
            <div className="mt-1 text-[12px] leading-snug">〈{p.work.title}〉, {p.work.year}</div>
            <div className="text-[11px] leading-snug opacity-70">{p.work.medium}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function Vessel({ seed, palette, y, ...handlers }: { seed: number; palette: string[]; y: number } & Record<string, unknown>) {
  const geo = useMemo(() => {
    const pts = vesselProfile(seed).map(([px, py]) => new THREE.Vector2(px * 0.9, py * 0.9))
    const g = new THREE.LatheGeometry(pts, 96)
    g.computeVertexNormals()
    return g
  }, [seed])
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12
  })
  return (
    <mesh ref={ref} geometry={geo} position={[0, y, 0]} {...handlers}>
      <meshStandardMaterial color={palette[1]} roughness={0.78} metalness={0.05} side={THREE.DoubleSide} />
    </mesh>
  )
}
