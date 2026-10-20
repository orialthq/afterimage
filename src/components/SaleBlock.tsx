import type { Artwork } from '../data/types'
import { auctionPrice, clock, currentPrice, dday, nextDropIn, useNow, won } from '../lib/sale'

interface Props {
  work: Artwork
  adoptedNo?: number
  onAdopt: () => void
  onShowCard: () => void
}

export function SaleBlock({ work, adoptedNo, onAdopt, onShowCard }: Props) {
  const now = useNow(1000)
  const s = work.sale

  if (adoptedNo) {
    return (
      <div className="border border-plaster/15 p-5">
        <div className="flex items-center gap-3 text-[15px] text-plaster">
          <span className="reddot" />
          소장 완료, No.{String(adoptedNo).padStart(3, '0')}
        </div>
        <p className="label mt-2">작가가 직접 포장해 7일 안에 보내드려요.</p>
        <button className="btn-ghost mt-4" onClick={onShowCard}>
          소장 증명서 보기
        </button>
      </div>
    )
  }

  return (
    <div className="border border-plaster/15 p-5">
      {s.type === 'rescue' && (
        <>
          <div className="flex items-baseline justify-between">
            <span className="label">정리 예정일까지</span>
            <span className="text-[12px] text-tungsten">{dday(s.disposeAt - now)}</span>
          </div>
          <div className="display mt-1 text-[34px] tabular-nums text-tungsten">{clock(s.disposeAt - now)}</div>
          <p className="label mt-2 prose-ko">
            이 날이 지나면 작업실 정리와 함께 폐기됩니다. 여기서는 구매를 구조라고 불러요.
          </p>
          <button className="btn-light mt-5 w-full justify-center" onClick={onAdopt}>
            {won(s.price)}에 구조하기
          </button>
        </>
      )}

      {s.type === 'auction' && (
        <>
          <div className="flex items-baseline justify-between">
            <span className="label">지금 가격</span>
            <span className="text-[12px] tabular-nums text-ash">다음 하락까지 {clock(nextDropIn(s, now)).slice(3)}</span>
          </div>
          <div className="display mt-1 text-[34px] tabular-nums text-tungsten">{won(auctionPrice(s, now))}</div>
          <PriceSteps work={work} now={now} />
          <p className="label mt-2 prose-ko">
            한 시간마다 {won(s.dropPerHour)}씩 내려가고 {won(s.floorPrice)}에서 멈춥니다. 한 점뿐이라, 누군가 먼저 소장하면 끝납니다.
          </p>
          <button className="btn-light mt-5 w-full justify-center" onClick={onAdopt}>
            지금 가격에 소장하기
          </button>
        </>
      )}

      {s.type === 'fixed' && (
        <>
          <span className="label">가격</span>
          <div className="display mt-1 text-[34px] tabular-nums text-tungsten">{won(currentPrice(s))}</div>
          <button className="btn-light mt-5 w-full justify-center" onClick={onAdopt}>
            소장하기
          </button>
        </>
      )}
    </div>
  )
}

/** 내림 경매 계단 그래프 — 지난 시간은 밝게, 남은 하락은 흐리게 */
function PriceSteps({ work, now }: { work: Artwork; now: number }) {
  const s = work.sale
  if (s.type !== 'auction') return null
  const totalSteps = Math.ceil((s.startPrice - s.floorPrice) / s.dropPerHour)
  const done = Math.min(totalSteps, Math.floor((now - s.startsAt) / 3_600_000))
  const W = 300
  const H = 46
  const x = (i: number) => (i / totalSteps) * W
  const y = (price: number) => H - ((price - s.floorPrice) / (s.startPrice - s.floorPrice)) * (H - 4) - 2
  let past = `M0 ${y(s.startPrice)}`
  let future = ''
  for (let i = 1; i <= totalSteps; i++) {
    const prev = Math.max(s.floorPrice, s.startPrice - (i - 1) * s.dropPerHour)
    const cur = Math.max(s.floorPrice, s.startPrice - i * s.dropPerHour)
    const seg = `H${x(i)} V${y(cur)}`
    if (i <= done) past += ` ${seg}`
    else {
      if (!future) future = `M${x(i - 1)} ${y(prev)}`
      future += ` ${seg}`
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-[46px] w-full" aria-hidden>
      <path d={past} fill="none" stroke="#ead7ae" strokeWidth="1.2" />
      <path d={future} fill="none" stroke="#ead7ae" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx={x(done)} cy={y(Math.max(s.floorPrice, s.startPrice - done * s.dropPerHour))} r="3" fill="#ead7ae" />
    </svg>
  )
}
