import type { Artist, Artwork, Exhibition } from './types'

// MVP 샘플 데이터. 작가·작품은 모두 가상입니다.
// 시간은 페이지 로드 시점 기준 상대값 → D-day가 항상 살아있게.
const now = Date.now()
const H = 3_600_000
const D = 24 * H

export const artists: Artist[] = [
  {
    id: 'yoon-seohae',
    name: '윤서해',
    school: '서울과학기술대학교 도예학과 4학년',
    origin:
      '어릴 때 외할머니 댁 장독대가 비 온 뒤에 색이 바뀌는 걸 봤어요. 흙이 물을 기억한다는 게 신기했어요. 그 기억을 손으로 붙잡고 싶어서 흙을 시작했습니다.',
    statement:
      '쓰임이 끝난 그릇에도 시간은 남는다. 나는 유약 대신 물의 흔적을 남긴다. 회색은 비어 있는 색이 아니라 모든 것이 지나간 색이다.',
    history: [
      { year: '2023', text: '교내 공예전 〈흙의 온도〉 단체전' },
      { year: '2025', text: '이천 도자 레지던시 2주 참여' },
      { year: '2026', text: '졸업전시 〈물이 지나간 자리〉' },
    ],
    collectors: 2,
  },
  {
    id: 'min-doyun',
    name: '민도윤',
    school: '홍익대학교 회화과 졸업',
    origin:
      '반지하 방에서 3년을 살았어요. 창문 높이가 사람들 발목이었어요. 그 창으로 들어오는 빛이 하루에 40분쯤이었는데, 그걸 그리기 시작했어요.',
    statement:
      '빛이 귀한 곳에서 빛은 색이 된다. 나는 장면을 그리지 않고, 장면에 남은 빛의 양을 그린다.',
    history: [
      { year: '2024', text: '을지로 대안공간 〈낮은 창〉 2인전' },
      { year: '2025', text: '홍익대 졸업전시 우수상' },
      { year: '2026', text: '작업실 계약 만료로 작품 정리 중' },
    ],
    collectors: 0,
  },
  {
    id: 'cha-eun',
    name: '차은',
    school: '국민대학교 섬유디자인 졸업',
    origin:
      '할머니가 돌아가시고 이불장을 정리하다가, 수십 년 동안 덧댄 천 조각들을 봤어요. 그게 할머니의 일기 같았어요.',
    statement: '천은 몸을 기억한다. 나는 버려질 옷과 이불을 모아 누군가의 시간을 다시 꿰맨다.',
    history: [
      { year: '2024', text: '서울공예박물관 청년공예 워크숍' },
      { year: '2025', text: '졸업전시 〈덧댐〉' },
    ],
    collectors: 4,
  },
  {
    id: 'jung-haram',
    name: '정하람',
    school: '한국예술종합학교 미술원 판화 전공',
    origin: '말을 잘 못했어요. 대신 손으로 새긴 선은 거짓말을 못 하더라고요.',
    statement: '반복해서 찍을수록 판은 닳는다. 닳아가는 판의 마지막 장이 가장 정직하다고 믿는다.',
    history: [
      { year: '2025', text: '판화 3인전 〈마지막 장〉' },
      { year: '2026', text: '졸업 예정, 판 폐기 예정' },
    ],
    collectors: 1,
  },
]

export const artworks: Artwork[] = [
  {
    id: 'w01',
    artistId: 'min-doyun',
    title: '새벽 4시의 냉장고 불빛',
    year: 2025,
    medium: '캔버스에 유채',
    size: '91 × 116.8 cm',
    story:
      '잠이 안 오던 밤, 냉장고 문을 열었을 때 방 전체가 그 빛 하나로 채워졌다. 이 작품의 노란색은 물감 7가지를 섞어 그 온도를 맞춘 색이다.',
    kind: 'window',
    palette: ['#0d0c10', '#1a1820', '#f2dfa4', '#fff6d8'],
    seed: 11,
    sale: { type: 'rescue', price: 680_000, disposeAt: now + 3 * D + 7 * H },
    hearts: 214,
    aspect: 0.78,
  },
  {
    id: 'w02',
    artistId: 'yoon-seohae',
    title: '물이 지나간 자리 I',
    year: 2026,
    medium: '조합토, 무유 소성',
    size: 'H 38 × Ø 31 cm',
    story:
      '유약을 바르지 않고, 가마 안에서 물이 증발한 자국만 남겼다. 같은 흙으로 열두 점을 빚었고, 깨지지 않고 남은 건 이 한 점이다.',
    kind: 'vessel',
    palette: ['#6f6b66', '#9a958c', '#3e3b37'],
    seed: 21,
    sale: { type: 'auction', startPrice: 520_000, floorPrice: 240_000, dropPerHour: 8_000, startsAt: now - 9 * H },
    hearts: 388,
    aspect: 1,
  },
  {
    id: 'w03',
    artistId: 'cha-eun',
    title: '덧댐 — 1974에서 2025까지',
    year: 2025,
    medium: '폐이불, 면사, 손바느질',
    size: '120 × 150 cm',
    story:
      '할머니의 이불에서 떼어낸 조각 41개와, 지인들에게서 받은 헌 옷 조각 63개를 이어 붙였다. 바늘땀 사이 간격은 일부러 고르지 않게 두었다.',
    kind: 'textile',
    palette: ['#6b3a35', '#c9b48f', '#2f3e46', '#8d6a4f', '#d8cfc0'],
    seed: 31,
    sale: { type: 'fixed', price: 1_200_000 },
    hearts: 156,
    aspect: 0.8,
  },
  {
    id: 'w04',
    artistId: 'jung-haram',
    title: '마지막 장 #12',
    year: 2026,
    medium: '목판화, 한지',
    size: '60 × 45 cm',
    story:
      '같은 판으로 서른 장을 찍었다. 열두 번째 장부터 판이 갈라지기 시작했고, 그 갈라짐이 그대로 선이 됐다. 판은 졸업과 함께 폐기된다.',
    kind: 'print',
    palette: ['#e8e1d3', '#191714'],
    seed: 41,
    sale: { type: 'rescue', price: 240_000, disposeAt: now + 1 * D + 2 * H },
    hearts: 97,
    aspect: 1.33,
  },
  {
    id: 'w05',
    artistId: 'min-doyun',
    title: '반지하의 창, 오후 2시 40분',
    year: 2024,
    medium: '캔버스에 유채',
    size: '72.7 × 60.6 cm',
    story:
      '하루 40분 들어오던 빛의 마지막 5분. 창살 그림자가 바닥에서 벽으로 올라가는 순간을 색면으로만 남겼다.',
    kind: 'colorfield',
    palette: ['#1d1a17', '#7a5b3a', '#d8b27a', '#3a2f26'],
    seed: 51,
    sale: { type: 'auction', startPrice: 900_000, floorPrice: 420_000, dropPerHour: 12_000, startsAt: now - 20 * H },
    hearts: 302,
    aspect: 1.2,
  },
  {
    id: 'w06',
    artistId: 'yoon-seohae',
    title: '깨진 것을 붙인 그릇',
    year: 2026,
    medium: '조합토, 금분 수리',
    size: 'H 14 × Ø 22 cm',
    story:
      '소성 중 금이 간 그릇을 버리지 않고 이어 붙였다. 갈라진 선은 흙이 견딘 온도의 기록이다.',
    kind: 'vessel',
    palette: ['#4a4744', '#7d7871', '#c9a45c'],
    seed: 61,
    sale: { type: 'rescue', price: 180_000, disposeAt: now + 5 * D + 11 * H },
    hearts: 241,
    aspect: 1,
  },
  {
    id: 'w07',
    artistId: 'jung-haram',
    title: '말 대신 #3',
    year: 2025,
    medium: '먹, 장지',
    size: '45 × 60 cm',
    story: '하고 싶었지만 못 한 말 하나를 정하고, 그 말을 소리 내지 않고 선 하나로 끝까지 그었다.',
    kind: 'ink',
    palette: ['#ece6d8', '#141210'],
    seed: 71,
    sale: { type: 'fixed', price: 320_000 },
    hearts: 128,
    aspect: 0.75,
  },
  {
    id: 'w08',
    artistId: 'cha-eun',
    title: '입던 옷의 색',
    year: 2025,
    medium: '헌 옷, 자연 염색, 손바느질',
    size: '80 × 80 cm',
    story:
      '열두 명에게 가장 오래 입은 옷을 받았다. 색을 빼고 다시 물들인 뒤, 각자의 옷이 가진 해짐을 지우지 않고 겹쳤다.',
    kind: 'textile',
    palette: ['#3c4a3e', '#a68a64', '#5e2f2a', '#c7bca6', '#22282c'],
    seed: 81,
    sale: { type: 'rescue', price: 450_000, disposeAt: now + 2 * D + 19 * H },
    hearts: 175,
    aspect: 1,
  },
]

export const exhibitions: Exhibition[] = [
  {
    slug: 'vol-01',
    vol: 'Vol. 01',
    title: '버려지지 않은 것들',
    subtitle: '졸업 이후, 작업실을 비워야 하는 네 작가의 작품 여덟 점',
    curatorNote:
      '졸업전시가 끝나면 작품은 대부분 작업실 구석으로, 본가 창고로, 혹은 폐기물 스티커가 붙은 채 복도로 나갑니다. 이번 기획전은 그 문 앞에서 다시 불을 켭니다. 작품마다 실제 정리 예정일이 적혀 있습니다. 그날이 지나면 이 작품들은 더 이상 볼 수 없습니다.',
    opensAt: now - 2 * D,
    closesAt: now + 6 * D,
    artworkIds: ['w01', 'w02', 'w03', 'w04', 'w05', 'w06', 'w07', 'w08'],
    status: 'open',
  },
  {
    slug: 'vol-02',
    vol: 'Vol. 02',
    title: '이름 없이 걸린 작품들',
    subtitle: '블라인드 기획전 — 작가 정보는 오픈 48시간 뒤에 공개됩니다',
    curatorNote: '작가의 학교도 이력도 모른 채, 작품만 보고 고르는 일주일.',
    opensAt: now + 6 * D,
    closesAt: now + 13 * D,
    artworkIds: [],
    status: 'upcoming',
    format: 'blind',
  },
  {
    slug: 'vol-03',
    vol: 'Vol. 03',
    title: '작은 방에 거는 것',
    subtitle: '게스트 큐레이터와 함께 고른, 원룸 벽 한 칸에 맞는 작품',
    curatorNote: '가로 60cm 이하, 원룸 한 벽에 거는 것을 기준으로 골랐습니다.',
    opensAt: now + 13 * D,
    closesAt: now + 20 * D,
    artworkIds: [],
    status: 'upcoming',
    format: 'guest',
    guest: '게스트 큐레이터 섭외 중',
  },
]

export const artistById = (id: string) => artists.find((a) => a.id === id)!
export const artworkById = (id: string) => artworks.find((a) => a.id === id)
export const exhibitionBySlug = (slug: string) => exhibitions.find((e) => e.slug === slug)
export const worksOf = (ex: Exhibition) => ex.artworkIds.map((id) => artworkById(id)!).filter(Boolean)
