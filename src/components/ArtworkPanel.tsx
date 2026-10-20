import { useState } from 'react'
import { artistById } from '../data/catalog'
import type { Artwork } from '../data/types'
import { artUrl } from '../lib/artgen'
import { actions, useStore } from '../lib/store'
import { ordinal } from './CollectorCard'
import { SaleBlock } from './SaleBlock'

interface Props {
  work: Artwork
  collectorNo: number
  showImage?: boolean
  onClose: () => void
  onAdopt: () => void
  onShowCard: () => void
  onAsk: () => void
  onPrev?: () => void
  onNext?: () => void
}

export function ArtworkPanel({ work, collectorNo, showImage, onClose, onAdopt, onShowCard, onAsk, onPrev, onNext }: Props) {
  const artist = artistById(work.artistId)
  const store = useStore()
  const hearted = !!store.hearts[work.id]
  const adopted = store.adopted[work.id]
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = `${location.origin}${location.pathname}#/ex/vol-01?w=${work.id}`
    try {
      if (navigator.share) await navigator.share({ title: work.title, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      /* 사용자가 공유 취소 */
    }
  }

  return (
    <aside
      key={work.id}
      className="slide-panel fixed inset-x-0 bottom-0 z-[45] max-h-[78dvh] overflow-y-auto border-t border-plaster/10 bg-wall/95 backdrop-blur-md no-scrollbar sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:border-l sm:border-t-0"
      aria-label={`${work.title} 작품 정보`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-wall via-wall/90 to-transparent px-6 pb-6 pt-5">
        <div className="flex gap-4 text-[13px] text-ash">
          {onPrev && (
            <button onClick={onPrev} className="hover:text-plaster" aria-label="이전 작품">
              이전
            </button>
          )}
          {onNext && (
            <button onClick={onNext} className="hover:text-plaster" aria-label="다음 작품">
              다음
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-[13px] text-ash hover:text-plaster">
          닫기
        </button>
      </div>

      <div className="px-6 pb-10">
        {showImage && <img src={artUrl(work, 800)} alt={work.title} className="mb-8 w-full" />}
        <p className="flex items-center gap-2 text-[14px] text-plaster">
          {adopted && <span className="reddot" />}
          {artist.name}
        </p>
        <h2 className="display mt-2 text-[30px] leading-[1.25] text-plaster">〈{work.title}〉</h2>
        <p className="label mt-3">
          {work.year}
          <br />
          {work.medium}
          <br />
          {work.size}
        </p>

        <p className="mt-8 text-[15px] text-plaster/90 prose-ko">{work.story}</p>

        <div className="mt-8">
          <SaleBlock work={work} adoptedNo={adopted?.no} onAdopt={onAdopt} onShowCard={onShowCard} />
          {!adopted && (
            <p className="label mt-3">
              지금 소장하면 {artist.name} 작가의 <span className="text-tungsten">{ordinal(collectorNo)} 번째 소장자</span>가 됩니다.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => actions.toggleHeart(work.id)}
            className={`btn-ghost ${hearted ? '!border-tungsten !text-tungsten' : ''}`}
            aria-pressed={hearted}
          >
            <Heart filled={hearted} />
            {(work.hearts + (hearted ? 1 : 0)).toLocaleString()}
          </button>
          <button onClick={share} className="btn-ghost">
            {copied ? '링크 복사됨' : '공유'}
          </button>
          <button onClick={onAsk} className="btn-ghost">
            도슨트에게 묻기
          </button>
        </div>

        <section className="mt-12 border-t border-plaster/10 pt-8">
          <h3 className="label">작가가 작업을 시작한 이유</h3>
          <blockquote className="display mt-3 text-[18px] leading-[1.75] text-plaster">“{artist.origin}”</blockquote>
          <p className="label mt-3">{artist.school}</p>

          <h3 className="label mt-10">작가의 말</h3>
          <p className="mt-3 text-[14px] text-plaster/85 prose-ko">{artist.statement}</p>

          <h3 className="label mt-10">작업 히스토리</h3>
          <ol className="mt-3 space-y-2">
            {artist.history.map((h) => (
              <li key={h.text} className="grid grid-cols-[52px_1fr] text-[13px]">
                <span className="tabular-nums text-ash">{h.year}</span>
                <span className="text-plaster/85">{h.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </aside>
  )
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.3 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}
