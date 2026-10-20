import { useEffect, useMemo, useState } from 'react'
import { artistById } from '../data/catalog'
import type { Artwork, Exhibition } from '../data/types'
import { artCanvas } from '../lib/artgen'
import { currentPrice, won } from '../lib/sale'

export const ordinal = (n: number) =>
  ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'][n - 1] ?? `${n}`

interface Props {
  work: Artwork
  exhibition: Exhibition
  no: number
  confirmed: boolean
  onConfirm: () => void
  onClose: () => void
}

/** 구매 확인 → 얼리 컬렉터 증명서. 증명서 이미지는 인스타 4:5 비율로 저장 */
export function CollectorModal({ work, exhibition, no, confirmed, onConfirm, onClose }: Props) {
  const artist = artistById(work.artistId)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!confirmed) return
    let alive = true
    document.fonts.ready.then(() => alive && setUrl(drawCard(work, exhibition, no)))
    return () => {
      alive = false
    }
  }, [confirmed, work, exhibition, no])

  const price = useMemo(() => currentPrice(work.sale), [work])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm fade-in" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-[880px] border border-plaster/15 bg-wall">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 text-[13px] text-ash hover:text-plaster">
          닫기
        </button>
        {!confirmed ? (
          <div className="grid gap-8 p-6 sm:grid-cols-[1fr_1.1fr] sm:p-10">
            <img src={artCanvas(work, 640).toDataURL()} alt="" className="aspect-[4/5] w-full object-cover" />
            <div className="flex flex-col">
              <p className="label">{artist.name}</p>
              <h2 className="display mt-1 text-[28px] leading-tight text-plaster">〈{work.title}〉</h2>
              <p className="label mt-2">
                {work.medium}, {work.size}
              </p>
              <dl className="mt-8 space-y-3 border-t border-plaster/10 pt-6 text-[14px]">
                <Row k="작품가" v={won(price)} />
                <Row k="작가에게 가는 금액" v={won(price * 0.7)} />
                <Row k="배송" v="작가 직접 포장, 7일 이내" />
              </dl>
              <p className="mt-6 text-[14px] leading-relaxed text-plaster prose-ko">
                소장하면 {artist.name} 작가의 <span className="text-tungsten">{ordinal(no)} 번째 소장자</span>가 됩니다.
              </p>
              <div className="mt-auto pt-8">
                <button className="btn-light w-full justify-center" onClick={onConfirm}>
                  소장 확정
                </button>
                <p className="label mt-3 text-center">MVP: 결제 없이 소장 과정만 체험합니다.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 p-6 sm:grid-cols-[1fr_1fr] sm:p-10">
            <div className="flex aspect-[4/5] items-center justify-center bg-black">
              {url ? <img src={url} alt="얼리 컬렉터 증명서" className="h-full w-full object-contain" /> : null}
            </div>
            <div className="flex flex-col">
              <span className="reddot" />
              <h2 className="display mt-5 text-[30px] leading-tight text-plaster">
                {artist.name} 작가의
                <br />
                {ordinal(no)} 번째 소장자가 되었어요.
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ash prose-ko">
                이 작품은 이제 전시장에서 빨간 점과 함께 걸립니다. 증명서를 저장해 공유하면, 다음 방문자는 누가 먼저 알아봤는지 보게 돼요.
              </p>
              <div className="mt-auto flex flex-col gap-3 pt-8">
                {url && (
                  <a className="btn-light justify-center" href={url} download={`잔상-No${String(no).padStart(3, '0')}.png`}>
                    증명서 이미지 저장
                  </a>
                )}
                <button className="btn-ghost justify-center" onClick={onClose}>
                  전시 계속 보기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ash">{k}</dt>
      <dd className="text-right tabular-nums text-plaster">{v}</dd>
    </div>
  )
}

function drawCard(work: Artwork, ex: Exhibition, no: number) {
  const W = 1080
  const H = 1350
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  g.fillStyle = '#000'
  g.fillRect(0, 0, W, H)

  // 스포트라이트
  const spot = g.createRadialGradient(W / 2, 420, 40, W / 2, 520, 700)
  spot.addColorStop(0, 'rgba(255,226,176,0.22)')
  spot.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = spot
  g.fillRect(0, 0, W, H)

  const art = artCanvas(work, 1024)
  const maxW = 600
  const maxH = 640
  const r = Math.min(maxW / art.width, maxH / art.height)
  const aw = art.width * r
  const ah = art.height * r
  const ax = (W - aw) / 2
  const ay = 150 + (maxH - ah) / 2
  g.fillStyle = '#0f0d0b'
  g.fillRect(ax - 16, ay - 16, aw + 32, ah + 32)
  g.drawImage(art, ax, ay, aw, ah)

  const artist = artistById(work.artistId)
  g.fillStyle = '#c8372d'
  g.beginPath()
  g.arc(ax + aw + 40, ay + ah + 4, 11, 0, Math.PI * 2)
  g.fill()

  g.fillStyle = '#ead7ae'
  g.font = '300 132px Hahmlet, serif'
  g.fillText(`No.${String(no).padStart(3, '0')}`, 90, 1000)

  g.fillStyle = '#d4cdbf'
  g.font = '400 42px Hahmlet, serif'
  g.fillText(`${artist.name} 작가의 ${ordinal(no)} 번째 소장자`, 92, 1080)

  g.fillStyle = '#8a8275'
  g.font = '400 28px "Pretendard Variable", Pretendard, sans-serif'
  g.fillText(`〈${work.title}〉, ${work.year}`, 92, 1140)
  const d = new Date()
  g.fillText(`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} 소장`, 92, 1182)

  g.fillStyle = '#ead7ae'
  g.fillRect(92, 1250, 14, 24)
  g.fillStyle = '#d4cdbf'
  g.font = '400 28px Hahmlet, serif'
  g.fillText('잔상', 120, 1272)
  g.fillStyle = '#5a544a'
  g.font = '400 24px "Pretendard Variable", Pretendard, sans-serif'
  g.textAlign = 'right'
  g.fillText(`${ex.vol} ${ex.title}`, W - 90, 1272)
  return c.toDataURL('image/png')
}
