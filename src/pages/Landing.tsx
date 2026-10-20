import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Footer, TopBar } from '../components/Chrome'
import { WorkCaption } from '../components/WorkCaption'
import { exhibitions, worksOf } from '../data/catalog'
import { clock, useNow } from '../lib/sale'
import { actions, useStore } from '../lib/store'

const PortalScene = lazy(() => import('../scene/PortalScene').then((m) => ({ default: m.PortalScene })))
const THRESHOLD = 0.62

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const bell = (a: number, b: number, c: number, d: number, x: number) => smooth(a, b, x) * (1 - smooth(c, d, x))

export default function Landing() {
  const navigate = useNavigate()
  const ex = exhibitions[0]
  const works = useMemo(() => worksOf(ex), [ex])
  const upcoming = exhibitions.filter((e) => e.status === 'upcoming')
  const store = useStore()
  const now = useNow(1000)

  const hero = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = hero.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const v = clamp01(-r.top / (r.height - innerHeight))
        progress.current = v
        setP(v)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const enter = () => {
    setLeaving(true)
    setTimeout(() => navigate(`/ex/${ex.slug}`), 900)
  }

  const intro = 1 - smooth(0.03, 0.12, p)
  const mid = bell(0.18, 0.26, 0.4, 0.48, p)
  const white = bell(0.5, THRESHOLD, THRESHOLD, 0.74, p)
  const inside = smooth(0.8, 0.9, p)

  return (
    <>
      <TopBar transparent />

      <section ref={hero} className="relative" style={{ height: '560vh' }} aria-label="기획전 입구">
        <div className="sticky top-0 h-dvh overflow-hidden">
          <Suspense fallback={<StaticDoor />}>
            <PortalScene progress={progress} works={works} />
          </Suspense>

          {/* 1. 입구 앞 */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-8 sm:pb-14"
            style={{ opacity: intro, transform: `translateY(${(1 - intro) * -24}px)` }}
          >
            <h1 className="display max-w-[14ch] text-[44px] leading-[1.12] text-plaster sm:text-[84px]">
              버려질 뻔한 작품들이 다시 불을 켭니다
            </h1>
            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-[34ch] text-[15px] text-ash prose-ko">
                졸업전시가 끝나고 갈 곳을 잃은 신진 작가의 작품을, 기획전으로 다시 걸고 대신 팝니다.
              </p>
              <p className="flex items-center gap-3 text-[13px] text-plaster">
                <span className="relative block h-9 w-px overflow-hidden bg-plaster/20">
                  <span className="absolute inset-x-0 top-0 h-3 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-tungsten" />
                </span>
                스크롤해서 입장
              </p>
            </div>
          </div>

          {/* 2. 문턱 앞 */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center"
            style={{ opacity: mid }}
          >
            <p className="display text-[22px] leading-[1.7] text-plaster sm:text-[30px]">
              작품마다 정리 예정일이 있습니다.
              <br />
              <span className="text-ash">그날이 지나면, 다시 볼 수 없습니다.</span>
            </p>
          </div>

          {/* 문턱 통과 순간의 과노출 */}
          <div className="pointer-events-none absolute inset-0 bg-[#fff1d6]" style={{ opacity: white * 0.94 }} />

          {/* 3. 전시장 안 */}
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-10 pt-40 sm:px-8 sm:pb-14"
            style={{ opacity: inside, pointerEvents: inside > 0.5 ? 'auto' : 'none' }}
          >
            <p className="label">{ex.vol}, 지금 열린 기획전</p>
            <h2 className="display mt-2 text-[48px] leading-[1.08] text-plaster sm:text-[96px]">{ex.title}</h2>
            <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="max-w-[40ch] text-[15px] text-ash prose-ko">{ex.subtitle}</p>
                <p className="mt-3 text-[13px] tabular-nums text-tungsten">기획전 종료까지 {clock(ex.closesAt - now)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn-light" onClick={enter}>
                  전시장 입장
                </button>
                <a className="btn-ghost" href="#works" onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })
                }}>
                  작품 먼저 둘러보기
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed inset-0 z-[55] bg-black transition-opacity duration-[900ms]" style={{ opacity: leaving ? 1 : 0 }} />

      <main className="relative z-10 bg-void">
        <section id="works" className="mx-auto max-w-6xl px-4 pb-32 pt-28 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="label">{ex.vol}</p>
              <h2 className="display mt-2 text-[36px] leading-tight text-plaster sm:text-[48px]">{ex.title}</h2>
            </div>
            <p className="display text-[17px] leading-[1.95] text-plaster/85 sm:pt-3">{ex.curatorNote}</p>
          </div>

          <ul className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {works.map((w) => (
              <li key={w.id}>
                <WorkCaption work={w} adopted={!!store.adopted[w.id]} onClick={() => navigate(`/ex/${ex.slug}?w=${w.id}`)} />
              </li>
            ))}
          </ul>
          <div className="mt-16">
            <button className="btn-light" onClick={enter}>
              전시장 입장
            </button>
          </div>
        </section>

        <section className="border-t border-plaster/10">
          <div className="mx-auto max-w-6xl px-4 py-28 sm:px-8">
            <div className="flex items-end justify-between gap-6">
              <h2 className="display text-[32px] text-plaster sm:text-[40px]">다음 기획전</h2>
              <Link to="/drops" className="text-[13px] text-ash hover:text-plaster">
                드롭 일정 전체 보기
              </Link>
            </div>
            <ul className="mt-12 divide-y divide-plaster/10 border-y border-plaster/10">
              {upcoming.map((u) => (
                <li key={u.slug} className="grid gap-4 py-8 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <p className="label">{u.vol}</p>
                  <div>
                    <p className="display text-[24px] text-plaster">{u.title}</p>
                    <p className="mt-1 text-[14px] text-ash prose-ko">{u.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-5 sm:justify-end">
                    <span className="text-[13px] tabular-nums text-ash">오픈까지 {clock(u.opensAt - now)}</span>
                    <button
                      className={store.notify[u.slug] ? 'btn-ghost !border-tungsten !text-tungsten' : 'btn-ghost'}
                      onClick={() => actions.toggleNotify(u.slug)}
                      aria-pressed={!!store.notify[u.slug]}
                    >
                      {store.notify[u.slug] ? '알림 신청됨' : '오픈 알림 받기'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-plaster/10 bg-wall">
          <div className="mx-auto grid max-w-6xl gap-16 px-4 py-28 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="label">작가님께</p>
              <h2 className="display mt-3 text-[38px] leading-[1.2] text-plaster sm:text-[52px]">
                작품, 버리지 마세요.
                <br />
                전시하고 팔아드립니다.
              </h2>
              <p className="mt-6 max-w-[38ch] text-[15px] text-ash prose-ko">
                공간도 비용도 필요 없습니다. 안 팔리면 수수료도 없어요. 촬영과 소개글이 어렵다면 저희가 대신 해드립니다.
              </p>
              <Link to="/submit" className="btn-light mt-10">
                작품 맡기기
              </Link>
            </div>
            <ol className="space-y-10 self-end">
              {[
                ['작품 사진을 올립니다', '휴대폰 사진이어도 괜찮아요. 필요하면 촬영을 대행합니다.'],
                ['작업을 시작한 이유와 히스토리를 적습니다', '짧아도 됩니다. 도슨트가 이 이야기로 방문자에게 작품을 설명해요.'],
                ['기획전에 작품이 걸립니다', '팔리면 판매가의 70%를 정산하고, 작품은 작가님이 직접 보내주세요.'],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[40px_1fr] gap-2">
                  <span className="display text-[22px] text-tungsten">{i + 1}</span>
                  <div>
                    <p className="text-[16px] text-plaster">{t}</p>
                    <p className="mt-1.5 text-[14px] text-ash prose-ko">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(300%)}}`}</style>
    </>
  )
}

function StaticDoor() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="h-[38vh] w-[22vh] bg-tungsten shadow-[0_0_120px_40px_rgba(234,215,174,0.35)]" />
    </div>
  )
}
