import { useEffect, useRef, useState } from 'react'
import type { Artwork, Exhibition } from '../data/types'
import { ruleDocent, suggestedQuestions } from '../lib/docent'

interface Msg {
  from: 'me' | 'docent'
  text: string
  done?: boolean
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  exhibition: Exhibition
  focus?: Artwork
  onPoint: (id: string) => void
}

export function Docent({ open, onOpenChange, exhibition, focus, onPoint }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: 'docent',
      text: '안녕하세요, 이번 기획전 도슨트예요. 작품이나 작가에 대해 무엇이든 물어보세요.',
      done: true,
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const ask = async (q: string) => {
    if (!q.trim() || busy) return
    setInput('')
    setBusy(true)
    setMsgs((m) => [...m, { from: 'me', text: q, done: true }, { from: 'docent', text: '' }])
    const r = await ruleDocent.reply({ exhibition, focus }, q)
    await new Promise((res) => setTimeout(res, 450))
    // 타이핑 스트리밍 — LLM 엔진으로 바꿔도 같은 UI
    for (let i = 1; i <= r.text.length; i += 2) {
      const t = r.text.slice(0, i)
      setMsgs((m) => [...m.slice(0, -1), { from: 'docent', text: t }])
      await new Promise((res) => setTimeout(res, 16))
    }
    setMsgs((m) => [...m.slice(0, -1), { from: 'docent', text: r.text, done: true }])
    setBusy(false)
    if (r.pointTo) setTimeout(() => onPoint(r.pointTo!), 400)
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => onOpenChange(true)}
          className="fixed bottom-5 left-4 z-30 flex items-center gap-3 border border-plaster/20 bg-black/60 px-4 py-3 text-[13px] text-plaster backdrop-blur-md transition-colors hover:border-tungsten sm:bottom-8 sm:left-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tungsten opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-tungsten" />
          </span>
          도슨트에게 묻기
        </button>
      )}

      {open && (
        <section
          className="fade-in fixed bottom-0 left-0 z-40 flex h-[70dvh] w-full flex-col border-r border-t border-plaster/10 bg-black/90 backdrop-blur-xl sm:bottom-8 sm:left-8 sm:h-[560px] sm:w-[380px] sm:border"
          aria-label="도슨트 대화"
        >
          <header className="flex items-center justify-between border-b border-plaster/10 px-5 py-4">
            <div>
              <p className="text-[14px] text-plaster">도슨트</p>
              <p className="label">{focus ? `〈${focus.title}〉 앞에서` : exhibition.title}</p>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-[13px] text-ash hover:text-plaster">
              닫기
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-5 no-scrollbar">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'me' ? 'flex justify-end' : ''}>
                {m.from === 'me' ? (
                  <p className="max-w-[80%] bg-plaster/10 px-4 py-2.5 text-[14px] text-plaster">{m.text}</p>
                ) : (
                  <p className={`display max-w-[92%] text-[15px] leading-[1.8] text-plaster/95 ${m.done ? '' : 'caret'}`}>
                    {m.text}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
            {suggestedQuestions(focus).map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                disabled={busy}
                className="shrink-0 border border-plaster/15 px-3 py-1.5 text-[12px] text-ash transition-colors hover:border-tungsten hover:text-tungsten disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-3 border-t border-plaster/10 px-5 py-3"
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="이 작품은 왜 회색이에요?"
              className="field flex-1 !border-0"
              aria-label="도슨트에게 질문"
            />
            <button type="submit" disabled={busy || !input.trim()} className="text-[13px] text-tungsten disabled:text-dim">
              묻기
            </button>
          </form>
        </section>
      )}
    </>
  )
}
