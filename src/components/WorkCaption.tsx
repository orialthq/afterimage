import { artistById } from '../data/catalog'
import type { Artwork } from '../data/types'
import { artUrl } from '../lib/artgen'
import { currentPrice, dday, saleLabel, won } from '../lib/sale'

export function WorkCaption({ work, adopted, onClick }: { work: Artwork; adopted: boolean; onClick: () => void }) {
  const a = artistById(work.artistId)
  const s = work.sale
  return (
    <button onClick={onClick} className="group block w-full text-left">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-wall">
        <img
          src={artUrl(work, 640)}
          alt=""
          loading="lazy"
          className="max-h-[82%] max-w-[78%] shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-transform duration-[1200ms] ease-[var(--ease-gallery)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[14px] text-plaster">
            {adopted && <span className="reddot" />}
            {a.name}
          </p>
          <p className="label mt-1">
            〈{work.title}〉, {work.year}
            <br />
            {work.medium}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] tabular-nums text-plaster">{won(currentPrice(s))}</p>
          <p className="label mt-1">{s.type === 'rescue' ? `정리 ${dday(s.disposeAt - Date.now())}` : saleLabel(s)}</p>
        </div>
      </div>
    </button>
  )
}
