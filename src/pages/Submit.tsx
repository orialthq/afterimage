import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer, TopBar } from '../components/Chrome'

interface Piece {
  url: string
  title: string
  medium: string
  size: string
}

type SaleChoice = 'rescue' | 'auction' | 'fixed'

const STEPS = ['작품 사진', '작가의 이야기', '판매 방식', '쇼룸 미리보기']

export default function Submit() {
  const [step, setStep] = useState(0)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [origin, setOrigin] = useState('')
  const [statement, setStatement] = useState('')
  const [history, setHistory] = useState([{ year: '', text: '' }])
  const [sale, setSale] = useState<SaleChoice>('rescue')
  const [disposeDate, setDisposeDate] = useState('')
  const [price, setPrice] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => () => pieces.forEach((p) => URL.revokeObjectURL(p.url)), []) // eslint-disable-line

  const onFiles = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files)
      .slice(0, 10 - pieces.length)
      .map((f) => ({ url: URL.createObjectURL(f), title: f.name.replace(/\.[^.]+$/, ''), medium: '', size: '' }))
    setPieces((p) => [...p, ...next])
  }

  const canNext = [
    pieces.length > 0,
    name.trim() && origin.trim().length >= 10,
    sale !== 'rescue' || !!disposeDate,
    true,
  ][step]

  if (sent) {
    return (
      <>
        <TopBar />
        <main className="flex min-h-dvh flex-col items-start justify-center px-4 sm:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <span className="block h-10 w-6 bg-tungsten shadow-[0_0_40px_rgba(234,215,174,0.6)]" />
            <h1 className="display mt-8 text-[40px] leading-tight text-plaster sm:text-[56px]">신청을 받았어요.</h1>
            <p className="mt-5 max-w-[40ch] text-[15px] text-ash prose-ko">
              3일 안에 {name || '작가'}님께 연락드릴게요. 다음 기획전 구성이 정해지면 촬영 일정도 함께 잡겠습니다.
            </p>
            <Link to="/" className="btn-ghost mt-10">
              지금 열린 기획전 보기
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-32 sm:px-8">
        <p className="label">작가 입점</p>
        <h1 className="display mt-3 text-[36px] leading-[1.2] text-plaster sm:text-[52px]">
          사진과 이야기만 주세요.
          <br />
          전시는 저희가 엽니다.
        </h1>

        <ol className="mt-12 flex gap-6 overflow-x-auto border-b border-plaster/10 pb-4 text-[13px] no-scrollbar">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex shrink-0 items-center gap-2 ${i === step ? 'text-tungsten' : i < step ? 'text-plaster' : 'text-dim'}`}>
              <span className="tabular-nums">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="mt-12 fade-in" key={step}>
          {step === 0 && (
            <section>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-plaster/25 px-6 py-14 text-center transition-colors hover:border-tungsten">
                <span className="text-[15px] text-plaster">작품 사진 올리기</span>
                <span className="label">한 작품당 한 장, 최대 10장. 휴대폰 사진도 괜찮아요.</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
              </label>
              {pieces.length > 0 && (
                <ul className="mt-10 space-y-8">
                  {pieces.map((p, i) => (
                    <li key={p.url} className="grid gap-5 sm:grid-cols-[140px_1fr]">
                      <img src={p.url} alt="" className="aspect-square w-full object-cover" />
                      <div className="space-y-1">
                        <input
                          className="field"
                          value={p.title}
                          placeholder="작품 제목"
                          aria-label="작품 제목"
                          onChange={(e) => setPieces((all) => all.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                        />
                        <input
                          className="field"
                          value={p.medium}
                          placeholder="재료, 기법  ex. 캔버스에 유채"
                          aria-label="재료와 기법"
                          onChange={(e) => setPieces((all) => all.map((x, j) => (j === i ? { ...x, medium: e.target.value } : x)))}
                        />
                        <input
                          className="field"
                          value={p.size}
                          placeholder="크기  ex. 72.7 × 60.6 cm"
                          aria-label="크기"
                          onChange={(e) => setPieces((all) => all.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))}
                        />
                        <button
                          className="pt-2 text-[12px] text-ash hover:text-plaster"
                          onClick={() => setPieces((all) => all.filter((_, j) => j !== i))}
                        >
                          이 작품 빼기
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {step === 1 && (
            <section className="space-y-10">
              <div className="grid gap-6 sm:grid-cols-2">
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="작가명" aria-label="작가명" />
                <input
                  className="field"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="학교, 전공  ex. 홍익대 회화과 졸업"
                  aria-label="학교와 전공"
                />
              </div>
              <div>
                <p className="text-[15px] text-plaster">예술을 시작한 이유</p>
                <p className="label mt-1">도슨트가 방문자에게 이 이야기로 작가님을 소개해요. 열 글자 이상 적어주세요.</p>
                <textarea
                  className="field mt-3 min-h-[120px] resize-y leading-relaxed"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="ex. 반지하 방 창으로 하루 40분 들어오던 빛을 그리기 시작했어요."
                  aria-label="예술을 시작한 이유"
                />
              </div>
              <div>
                <p className="text-[15px] text-plaster">작가의 말</p>
                <p className="label mt-1">비워두면 다음 단계에서 이야기를 바탕으로 초안을 제안해드려요.</p>
                <textarea
                  className="field mt-3 min-h-[90px] resize-y leading-relaxed"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="ex. 빛이 귀한 곳에서 빛은 색이 된다."
                  aria-label="작가의 말"
                />
              </div>
              <div>
                <p className="text-[15px] text-plaster">작업 히스토리</p>
                <div className="mt-3 space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="grid grid-cols-[80px_1fr] gap-4">
                      <input
                        className="field tabular-nums"
                        value={h.year}
                        placeholder="2025"
                        aria-label="연도"
                        onChange={(e) => setHistory((all) => all.map((x, j) => (j === i ? { ...x, year: e.target.value } : x)))}
                      />
                      <input
                        className="field"
                        value={h.text}
                        placeholder="ex. 졸업전시 〈낮은 창〉"
                        aria-label="히스토리 내용"
                        onChange={(e) => setHistory((all) => all.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                      />
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-[13px] text-ash hover:text-plaster" onClick={() => setHistory((h) => [...h, { year: '', text: '' }])}>
                  한 줄 더 쓰기
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <div className="grid gap-3">
                {(
                  [
                    ['rescue', '정리 예정일이 있어요', '작업실 정리, 이사 등으로 처분해야 하는 날이 있다면. 그날까지 남은 시간이 전시장에 표시됩니다.'],
                    ['auction', '내림 경매로 팔고 싶어요', '시작가에서 한 시간마다 조금씩 내려갑니다. 하한가 아래로는 내려가지 않아요.'],
                    ['fixed', '정해진 가격에 팔고 싶어요', '가장 단순한 방식입니다.'],
                  ] as [SaleChoice, string, string][]
                ).map(([k, t, d]) => (
                  <label
                    key={k}
                    className={`flex cursor-pointer gap-4 border p-5 transition-colors ${sale === k ? 'border-tungsten' : 'border-plaster/15 hover:border-plaster/40'}`}
                  >
                    <input type="radio" name="sale" className="mt-1 accent-[#ead7ae]" checked={sale === k} onChange={() => setSale(k)} />
                    <span>
                      <span className="block text-[15px] text-plaster">{t}</span>
                      <span className="mt-1 block text-[13px] text-ash prose-ko">{d}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {sale === 'rescue' && (
                  <label className="block">
                    <span className="label">정리 예정일</span>
                    <input type="date" className="field [color-scheme:dark]" value={disposeDate} onChange={(e) => setDisposeDate(e.target.value)} />
                  </label>
                )}
                <label className="block">
                  <span className="label">{sale === 'auction' ? '시작가 (원)' : '희망 판매가 (원)'}</span>
                  <input
                    className="field tabular-nums"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="모르면 비워두세요. 함께 정해요."
                  />
                </label>
              </div>
              <p className="label mt-8">팔리면 판매가의 70%를 정산합니다. 안 팔리면 비용은 없어요.</p>
            </section>
          )}

          {step === 3 && <Preview pieces={pieces} name={name} school={school} origin={origin} statement={statement} />}
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-plaster/10 pt-8">
          <button className="text-[14px] text-ash hover:text-plaster disabled:invisible" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            이전
          </button>
          {step < 3 ? (
            <button className="btn-light" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              {step === 2 ? '쇼룸 미리보기' : '다음'}
            </button>
          ) : (
            <button className="btn-light" onClick={() => setSent(true)}>
              입점 신청 보내기
            </button>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

/** 입력한 내용이 실제 전시장에서 어떻게 보일지 — 브랜딩 에이전트 자리 */
function Preview({ pieces, name, school, origin, statement }: { pieces: Piece[]; name: string; school: string; origin: string; statement: string }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2200)
    return () => clearTimeout(t)
  }, [])

  const first = pieces[0]
  const draft =
    statement.trim() ||
    (origin.length > 0 ? `${origin.split(/[.!?。]/)[0].trim()}. 그 기억이 지금의 작업이 되었다.` : '')

  if (!ready) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 text-center">
        <span className="block h-16 w-10 animate-pulse bg-tungsten shadow-[0_0_60px_rgba(234,215,174,0.5)]" />
        <p className="display text-[20px] text-plaster">작품을 벽에 거는 중이에요</p>
        <p className="label">이야기를 읽고 작가의 말 초안을 만들고 있어요.</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="relative overflow-hidden bg-black px-6 pb-12 pt-16 sm:px-14">
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-[70%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,226,176,0.18),transparent_70%)]" />
        <div className="relative mx-auto max-w-sm">
          {first ? (
            <div className="border-[10px] border-[#0f0d0b] shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
              <img src={first.url} alt="" className="block w-full" />
            </div>
          ) : null}
        </div>
        <div className="relative mt-10 flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-[14px] text-plaster">{name}</p>
            <p className="label mt-1">
              〈{first?.title || '제목 없음'}〉
              <br />
              {first?.medium}
              {first?.size ? `, ${first.size}` : ''}
            </p>
          </div>
          <p className="label">{pieces.length}점 출품</p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <div>
          <p className="label">작가의 말 {statement.trim() ? '' : '초안'}</p>
          <p className="display mt-3 text-[18px] leading-[1.8] text-plaster">{draft}</p>
          {!statement.trim() && <p className="label mt-3">초안은 입점 후 함께 다듬어요.</p>}
        </div>
        <div>
          <p className="label">방문자가 도슨트에게 물으면</p>
          <p className="mt-3 text-[13px] text-ash">“이 작가는 왜 이걸 만들었어요?”</p>
          <p className="display mt-3 text-[16px] leading-[1.8] text-plaster/90">
            {name} 작가{school ? `(${school})` : ''}는 이렇게 말했어요. “{origin}”
          </p>
        </div>
      </div>
    </div>
  )
}
