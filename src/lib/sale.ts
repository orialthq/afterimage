import { useEffect, useState } from 'react'
import type { Sale } from '../data/types'

export const won = (n: number) => `₩${Math.round(n).toLocaleString('ko-KR')}`

/** 내림 경매 현재가 — 정시마다 dropPerHour씩 떨어지고 floor에서 멈춤 */
export function auctionPrice(s: Extract<Sale, { type: 'auction' }>, t = Date.now()) {
  const hours = Math.max(0, Math.floor((t - s.startsAt) / 3_600_000))
  return Math.max(s.floorPrice, s.startPrice - hours * s.dropPerHour)
}

export function nextDropIn(s: Extract<Sale, { type: 'auction' }>, t = Date.now()) {
  const elapsed = (t - s.startsAt) % 3_600_000
  return 3_600_000 - elapsed
}

export function currentPrice(s: Sale, t = Date.now()) {
  if (s.type === 'auction') return auctionPrice(s, t)
  return s.price
}

export function useNow(intervalMs = 1000) {
  const [t, setT] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return t
}

export function splitDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')
export function clock(ms: number) {
  const { d, h, m, s } = splitDuration(ms)
  return d > 0 ? `${d}일 ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`
}

export const dday = (ms: number) => {
  const d = Math.ceil(ms / 86_400_000)
  return d <= 0 ? 'D-DAY' : `D-${d}`
}

export function saleLabel(s: Sale) {
  if (s.type === 'rescue') return '구조 대기'
  if (s.type === 'auction') return '내림 경매'
  return '상시 판매'
}
