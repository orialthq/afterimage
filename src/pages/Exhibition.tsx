import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArtworkPanel } from '../components/ArtworkPanel'
import { Wordmark } from '../components/Chrome'
import { CollectorModal } from '../components/CollectorCard'
import { Docent } from '../components/Docent'
import { WorkCaption } from '../components/WorkCaption'
import { artistById, artworks, exhibitionBySlug, worksOf } from '../data/catalog'
import { actions, useStore } from '../lib/store'
import { GalleryScene } from '../scene/GalleryScene'
import { FIRST_Z, SPACING, place } from '../scene/layout'

const canWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const STOP_OFFSET = 2.4

export default function Exhibition() {
  const { slug = 'vol-01' } = useParams()
  const navigate = useNavigate()
  const ex = exhibitionBySlug(slug)
  const works = useMemo(() => (ex ? worksOf(ex) : []), [ex])
  const placements = useMemo(() => place(works), [works])
  const store = useStore()
  const [params, setParams] = useSearchParams()
  const selected = params.get('w')

  const [mode, setMode] = useState<'3d' | 'list'>(() =>
    canWebGL() && !matchMedia('(prefers-reduced-motion: reduce)').matches ? '3d' : 'list',
  )
  const [hovered, setHovered] = useState<string | null>(null)
  const [docentOpen, setDocentOpen] = useState(false)
  const [modal, setModal] = useState<{ id: string; confirmed: boolean } | null>(null)
  const [entered, setEntered] = useState(false)
  const [moved, setMoved] = useState(false)
  const [current, setCurrent] = useState(0)

  const maxZ = 2
  const minZ = FIRST_Z - (works.length - 1) * SPACING + STOP_OFFSET - 1.5
  const walk = useRef(maxZ)

  const select = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(params)
      if (id) next.set('w', id)
      else next.delete('w')
      setParams(next, { replace: true })
      if (id) {
        const p = placements.find((x) => x.work.id === id)
        if (p) walk.current = p.z + STOP_OFFSET
      }
    },
    [params, setParams, placements],
  )

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  // 걷기: 휠 / 터치 / 키보드
  useEffect(() => {
    if (mode !== '3d') return
    const clampZ = (z: number) => Math.min(maxZ, Math.max(minZ, z))
    const onWheel = (e: WheelEvent) => {
      if (selected || docentOpen || modal) return
      walk.current = clampZ(walk.current - e.deltaY * 0.006)
      setMoved(true)
    }
    let ty = 0
    const onTouchStart = (e: TouchEvent) => (ty = e.touches[0].clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (selected || docentOpen || modal) return
      const y = e.touches[0].clientY
      walk.current = clampZ(walk.current - (ty - y) * 0.02)
      ty = y
      setMoved(true)
    }
    const stops = placements.map((p) => p.z + STOP_OFFSET)
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
      if (modal) return
      if (e.key === 'Escape') select(null)
      const i = stops.findIndex((s) => s < walk.current - 0.5)
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        if (selected) {
          const idx = placements.findIndex((p) => p.work.id === selected)
          select(placements[Math.min(placements.length - 1, idx + 1)].work.id)
        } else walk.current = clampZ(stops[i === -1 ? stops.length - 1 : i])
        setMoved(true)
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        if (selected) {
          const idx = placements.findIndex((p) => p.work.id === selected)
          select(placements[Math.max(0, idx - 1)].work.id)
        } else {
          const prev = [...stops].reverse().find((s) => s > walk.current + 0.5)
          walk.current = clampZ(prev ?? maxZ)
        }
      }
      if (e.key === 'Enter' && !selected && !docentOpen) select(placements[current]?.work.id ?? null)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [mode, selected, docentOpen, modal, placements, minZ, select, current])

  // 현재 서 있는 위치의 작품 (레일 표시용)
  useEffect(() => {
    if (mode !== '3d') return
    let raf = 0
    const tick = () => {
      let best = 0
      let bestD = Infinity
      placements.forEach((p, i) => {
        const d = Math.abs(p.z + STOP_OFFSET - walk.current)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      setCurrent((c) => (c === best ? c : best))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, placements])

  if (!ex) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="display text-[28px]">찾는 기획전이 없습니다.</p>
        <Link to="/" className="btn-ghost">
          지금 열린 기획전 보기
        </Link>
      </div>
    )
  }

  if (ex.status === 'upcoming') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="label">{ex.vol}</p>
        <p className="display text-[32px]">〈{ex.title}〉은 아직 문이 닫혀 있어요.</p>
        <button className="btn-light" onClick={() => actions.toggleNotify(ex.slug)}>
          {store.notify[ex.slug] ? '오픈 알림 신청됨' : '오픈 알림 받기'}
        </button>
        <Link to="/drops" className="label hover:text-plaster">
          드롭 일정 보기
        </Link>
      </div>
    )
  }

  const selWork = selected ? artworks.find((w) => w.id === selected) : undefined
  const collectorNoFor = (id: string) => {
    const w = artworks.find((x) => x.id === id)!
    const stored = store.adopted[id]?.no
    if (stored) return stored
    const mine = Object.keys(store.adopted).filter((k) => artworks.find((x) => x.id === k)?.artistId === w.artistId).length
    return artistById(w.artistId).collectors + mine + 1
  }
  const selIdx = selWork ? placements.findIndex((p) => p.work.id === selWork.id) : -1

  return (
    <div className={mode === '3d' ? 'fixed inset-0 overflow-hidden' : 'min-h-dvh'}>
      {mode === '3d' && (
        <div className="absolute inset-0">
          <GalleryScene
            placements={placements}
            walk={walk}
            selected={selected}
            hovered={hovered}
            adopted={store.adopted}
            onHover={setHovered}
            onSelect={(id) => select(id)}
            onMiss={() => selected && select(null)}
          />
        </div>
      )}

      {/* 입장 암전 */}
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-black transition-opacity duration-[1800ms] ease-out"
        style={{ opacity: entered ? 0 : 1 }}
      />

      <header className="fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-4 bg-gradient-to-b from-black/70 to-transparent px-4 pb-10 pt-4 sm:px-8 sm:pt-6">
        <Wordmark />
        <div className="hidden text-center sm:block">
          <p className="label">{ex.vol}</p>
          <p className="display text-[17px] text-plaster">{ex.title}</p>
        </div>
        <div className="flex items-center gap-5 text-[13px]">
          <button
            className="text-ash transition-colors hover:text-plaster"
            onClick={() => {
              select(null)
              setMode(mode === '3d' ? 'list' : '3d')
            }}
          >
            {mode === '3d' ? '목록으로 보기' : '전시장으로 보기'}
          </button>
          <button className="text-ash transition-colors hover:text-plaster" onClick={() => navigate('/')}>
            나가기
          </button>
        </div>
      </header>

      {mode === '3d' && !selected && (
        <>
          <p
            className="pointer-events-none fixed right-4 top-20 z-20 max-w-[220px] text-right text-[12px] text-ash transition-opacity duration-1000 sm:right-8 sm:top-24"
            style={{ opacity: moved ? 0 : 1 }}
          >
            스크롤하면 앞으로 걸어갑니다. 작품을 누르면 가까이 다가가요.
          </p>
          <Rail
            placements={placements}
            current={current}
            adopted={store.adopted}
            onPick={(id) => select(id)}
          />
        </>
      )}

      {mode === 'list' && <ListView exSlug={ex.slug} onPick={(id) => select(id)} />}

      {selWork && (
        <ArtworkPanel
          work={selWork}
          collectorNo={collectorNoFor(selWork.id)}
          showImage={mode === 'list'}
          onClose={() => select(null)}
          onAdopt={() => setModal({ id: selWork.id, confirmed: false })}
          onShowCard={() => setModal({ id: selWork.id, confirmed: true })}
          onAsk={() => setDocentOpen(true)}
          onPrev={selIdx > 0 ? () => select(placements[selIdx - 1].work.id) : undefined}
          onNext={selIdx < placements.length - 1 ? () => select(placements[selIdx + 1].work.id) : undefined}
        />
      )}

      <Docent
        open={docentOpen}
        onOpenChange={setDocentOpen}
        exhibition={ex}
        focus={selWork ?? (mode === '3d' && moved ? placements[current]?.work : undefined)}
        onPoint={(id) => select(id)}
      />

      {modal && (
        <CollectorModal
          work={artworks.find((w) => w.id === modal.id)!}
          exhibition={ex}
          no={collectorNoFor(modal.id)}
          confirmed={modal.confirmed}
          onConfirm={() => {
            actions.adopt(modal.id, collectorNoFor(modal.id))
            setModal({ ...modal, confirmed: true })
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

function Rail({
  placements,
  current,
  adopted,
  onPick,
}: {
  placements: ReturnType<typeof place>
  current: number
  adopted: Record<string, unknown>
  onPick: (id: string) => void
}) {
  const w = placements[current]?.work
  return (
    <div className="fixed inset-x-0 bottom-20 z-20 flex flex-col items-center gap-3 px-4 sm:bottom-8">
      {w && (
        <button
          onClick={() => onPick(w.id)}
          className="fade-in text-center"
          key={w.id}
        >
          <span className="label tabular-nums">
            {current + 1} / {placements.length}
          </span>
          <span className="display mt-0.5 block text-[16px] text-plaster">〈{w.title}〉</span>
        </button>
      )}
      <div className="flex items-center gap-1.5">
        {placements.map((p, i) => (
          <button
            key={p.work.id}
            onClick={() => onPick(p.work.id)}
            aria-label={`${i + 1}번째 작품 ${p.work.title}`}
            className="group flex h-6 items-center"
          >
            <span
              className={`block h-px transition-all duration-500 ${
                i === current ? 'w-9 bg-tungsten' : 'w-5 bg-plaster/25 group-hover:bg-plaster/60'
              }`}
            />
            {adopted[p.work.id] ? <span className="ml-1 h-1.5 w-1.5 rounded-full bg-reddot" /> : null}
          </button>
        ))}
      </div>
    </div>
  )
}

function ListView({ exSlug, onPick }: { exSlug: string; onPick: (id: string) => void }) {
  const ex = exhibitionBySlug(exSlug)!
  const store = useStore()
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-8">
      <p className="label">{ex.vol}</p>
      <h1 className="display mt-2 text-[44px] leading-tight text-plaster sm:text-[64px]">{ex.title}</h1>
      <p className="mt-5 max-w-xl text-[15px] text-ash prose-ko">{ex.curatorNote}</p>
      <ul className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {worksOf(ex).map((w) => (
          <li key={w.id}>
            <WorkCaption work={w} adopted={!!store.adopted[w.id]} onClick={() => onPick(w.id)} />
          </li>
        ))}
      </ul>
    </main>
  )
}
