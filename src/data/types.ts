export type ArtKind = 'colorfield' | 'window' | 'ink' | 'textile' | 'print' | 'vessel'

export type Sale =
  /** 버려질 작품 구조 — 폐기 예정일이 실제 마감 */
  | { type: 'rescue'; price: number; disposeAt: number }
  /** 내림 경매 — 시간마다 가격 하락, 하한가 존재 */
  | { type: 'auction'; startPrice: number; floorPrice: number; dropPerHour: number; startsAt: number }
  | { type: 'fixed'; price: number }

export interface Artist {
  id: string
  name: string
  school: string
  /** 예술을 시작한 이유 */
  origin: string
  /** 작가 철학 (브랜딩 에이전트 확정본이 들어갈 자리) */
  statement: string
  history: { year: string; text: string }[]
  /** 지금까지의 소장자 수 — "N번째 소장자" 계산용 */
  collectors: number
}

export interface Artwork {
  id: string
  artistId: string
  title: string
  year: number
  medium: string
  size: string
  story: string
  kind: ArtKind
  palette: string[]
  seed: number
  sale: Sale
  hearts: number
  /** 벽에 걸 때 가로/세로 비율 (vessel은 높이 기준) */
  aspect: number
}

export interface Exhibition {
  slug: string
  vol: string
  title: string
  subtitle: string
  curatorNote: string
  opensAt: number
  closesAt: number
  artworkIds: string[]
  status: 'open' | 'upcoming'
  format?: 'blind' | 'guest'
  guest?: string
}
