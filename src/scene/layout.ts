import type { Artwork } from '../data/types'

export const WALL_X = 3.2
export const SPACING = 5.5
export const FIRST_Z = -5
export const EYE = 1.6
export const CEIL = 4.4

export interface Placement {
  work: Artwork
  side: -1 | 1
  z: number
  /** 작품 중심 */
  pos: [number, number, number]
  /** 감상 위치 (선택 시 카메라) */
  view: [number, number, number]
  /** 카메라가 바라볼 지점 */
  look: [number, number, number]
  w: number
  h: number
}

export function place(works: Artwork[]): Placement[] {
  return works.map((work, i) => {
    const side = (i % 2 === 0 ? -1 : 1) as -1 | 1
    const z = FIRST_Z - i * SPACING
    if (work.kind === 'vessel') {
      const x = side * (WALL_X - 1.0)
      const top = 1.05
      return {
        work,
        side,
        z,
        pos: [x, top, z],
        view: [side * 0.2, 1.45, z + 0.9],
        look: [x, top + 0.25, z],
        w: 0.8,
        h: 0.8,
      }
    }
    const h = work.aspect >= 1 ? 1.25 : 1.6
    const w = Math.min(2.2, h * work.aspect)
    const x = side * (WALL_X - 0.04)
    return {
      work,
      side,
      z,
      pos: [x, 1.75, z],
      view: [side * 0.4, 1.7, z],
      look: [x, 1.72, z],
      w,
      h,
    }
  })
}

export const corridorLength = (n: number) => -FIRST_Z + (n - 1) * SPACING + 8
