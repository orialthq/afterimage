import { useSyncExternalStore } from 'react'

// 하트·드롭 알림·구조(구매) 기록 — MVP는 localStorage.
// 지표: 하트 수 / 알림 신청 수 / 판매까지 걸린 시간 → 나중에 백엔드 이벤트로 교체.

type State = {
  hearts: Record<string, true>
  notify: Record<string, true>
  adopted: Record<string, { at: number; no: number }>
}

const KEY = 'afterimage:v1'
const empty: State = { hearts: {}, notify: {}, adopted: {} }

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

let state = load()
const subs = new Set<() => void>()

function set(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* private mode — 메모리에만 유지 */
  }
  subs.forEach((f) => f())
}

export function useStore() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => state,
  )
}

export const actions = {
  toggleHeart(id: string) {
    const hearts = { ...state.hearts }
    if (hearts[id]) delete hearts[id]
    else hearts[id] = true
    set({ ...state, hearts })
  },
  toggleNotify(slug: string) {
    const notify = { ...state.notify }
    if (notify[slug]) delete notify[slug]
    else notify[slug] = true
    set({ ...state, notify })
  },
  adopt(id: string, no: number) {
    set({ ...state, adopted: { ...state.adopted, [id]: { at: Date.now(), no } } })
  },
}
