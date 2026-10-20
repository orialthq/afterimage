import { Link } from 'react-router-dom'
import { Footer, TopBar } from '../components/Chrome'
import { exhibitions, worksOf } from '../data/catalog'
import { clock, useNow } from '../lib/sale'
import { actions, useStore } from '../lib/store'

const FORMAT: Record<string, string> = {
  blind: '작가의 이름, 학교, 이력을 가린 채 작품만 공개합니다. 오픈 48시간 뒤 작가가 공개돼요.',
  guest: '회차마다 다른 큐레이터가 작품을 고릅니다.',
}

const fmt = (t: number) => {
  const d = new Date(t)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function Drops() {
  const now = useNow(1000)
  const store = useStore()
  const nextDrop = exhibitions.find((e) => e.status === 'upcoming')!

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-32 sm:px-8">
        <p className="label">드롭 일정</p>
        <h1 className="display mt-3 text-[40px] leading-[1.15] text-plaster sm:text-[64px]">
          일주일에 한 번,
          <br />
          다섯에서 열 점씩 문을 엽니다.
        </h1>
        <p className="mt-6 max-w-[42ch] text-[15px] text-ash prose-ko">
          모든 작품은 한 점뿐입니다. 기획전이 끝나면 남은 작품은 작가에게 돌아가거나 정리됩니다.
        </p>

        <div className="mt-16 border border-plaster/15 p-6 sm:p-10">
          <p className="label">다음 드롭, {nextDrop.vol}</p>
          <p className="display mt-2 text-[52px] tabular-nums leading-none text-tungsten sm:text-[88px]">
            {clock(nextDrop.opensAt - now)}
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="display text-[22px] text-plaster">〈{nextDrop.title}〉</p>
            <button
              className={store.notify[nextDrop.slug] ? 'btn-ghost !border-tungsten !text-tungsten' : 'btn-light'}
              onClick={() => actions.toggleNotify(nextDrop.slug)}
              aria-pressed={!!store.notify[nextDrop.slug]}
            >
              {store.notify[nextDrop.slug] ? '오픈 알림 신청됨' : '오픈 알림 받기'}
            </button>
          </div>
        </div>

        <ol className="relative mt-20 border-l border-plaster/15 pl-8 sm:pl-12">
          {exhibitions.map((e) => {
            const open = e.status === 'open'
            return (
              <li key={e.slug} className="relative pb-16 last:pb-0">
                <span
                  className={`absolute -left-[37px] top-2 h-2.5 w-2.5 rounded-full sm:-left-[53px] ${
                    open ? 'bg-tungsten shadow-[0_0_12px_rgba(234,215,174,0.8)]' : 'border border-plaster/40 bg-black'
                  }`}
                />
                <p className="label tabular-nums">
                  {fmt(e.opensAt)} – {fmt(e.closesAt)}
                  {open ? ', 지금 열림' : ''}
                </p>
                <p className="display mt-2 text-[28px] text-plaster">
                  {e.vol} 〈{e.title}〉
                </p>
                <p className="mt-2 max-w-[52ch] text-[14px] text-ash prose-ko">{e.subtitle}</p>
                {e.format && <p className="mt-3 max-w-[52ch] text-[13px] text-plaster/70 prose-ko">{FORMAT[e.format]}</p>}
                <div className="mt-6">
                  {open ? (
                    <Link to={`/ex/${e.slug}`} className="btn-light">
                      전시장 입장, 작품 {worksOf(e).length}점
                    </Link>
                  ) : (
                    <button
                      className={store.notify[e.slug] ? 'btn-ghost !border-tungsten !text-tungsten' : 'btn-ghost'}
                      onClick={() => actions.toggleNotify(e.slug)}
                      aria-pressed={!!store.notify[e.slug]}
                    >
                      {store.notify[e.slug] ? '알림 신청됨' : '오픈 알림 받기'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </main>
      <Footer />
    </>
  )
}
