import type { Artwork } from '../data/types'

// 실제 작품 사진이 들어갈 자리. MVP에선 작품마다 시드 기반으로 그려서
// 저작권 걱정 없이 쇼룸 전체 톤을 검증한다.

function rng(seed: number) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const cache = new Map<string, HTMLCanvasElement>()

export function artCanvas(w: Artwork, size = 1024): HTMLCanvasElement {
  const key = `${w.id}:${size}`
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  const aspect = w.kind === 'vessel' ? 0.8 : w.aspect
  c.width = aspect >= 1 ? size : Math.round(size * aspect)
  c.height = aspect >= 1 ? Math.round(size / aspect) : size
  const ctx = c.getContext('2d')!
  const r = rng(w.seed)
  const P = w.palette
  const W = c.width
  const Hh = c.height

  switch (w.kind) {
    case 'window': {
      ctx.fillStyle = P[0]
      ctx.fillRect(0, 0, W, Hh)
      const g = ctx.createRadialGradient(W * 0.5, Hh * 0.52, 10, W * 0.5, Hh * 0.52, W * 0.9)
      g.addColorStop(0, 'rgba(242,223,164,0.35)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, Hh)
      ctx.filter = 'blur(14px)'
      ctx.fillStyle = P[2]
      ctx.fillRect(W * 0.3, Hh * 0.28, W * 0.4, Hh * 0.46)
      ctx.filter = 'blur(4px)'
      ctx.fillStyle = P[3]
      ctx.fillRect(W * 0.34, Hh * 0.32, W * 0.32, Hh * 0.38)
      ctx.filter = 'none'
      ctx.fillStyle = 'rgba(20,18,22,0.5)'
      for (let i = 1; i < 4; i++) ctx.fillRect(W * 0.34, Hh * (0.32 + i * 0.095), W * 0.32, 3)
      break
    }
    case 'colorfield': {
      ctx.fillStyle = P[0]
      ctx.fillRect(0, 0, W, Hh)
      const bands = [
        [0.08, 0.1, 0.84, 0.36, P[1]],
        [0.08, 0.52, 0.84, 0.18, P[2]],
        [0.08, 0.74, 0.84, 0.16, P[3]],
      ] as const
      for (const [x, y, bw, bh, col] of bands) {
        ctx.filter = 'blur(10px)'
        ctx.globalAlpha = 0.92
        ctx.fillStyle = col
        ctx.fillRect(W * x, Hh * y, W * bw, Hh * bh)
      }
      ctx.filter = 'none'
      ctx.globalAlpha = 1
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.lineWidth = 10
      for (let i = 0; i < 5; i++) {
        const x = W * (0.2 + i * 0.15)
        ctx.beginPath()
        ctx.moveTo(x, Hh * 0.52)
        ctx.lineTo(x + W * 0.08, Hh * 0.7)
        ctx.stroke()
      }
      break
    }
    case 'ink': {
      ctx.fillStyle = P[0]
      ctx.fillRect(0, 0, W, Hh)
      ctx.strokeStyle = P[1]
      ctx.lineCap = 'round'
      let x = W * 0.18
      let y = Hh * 0.2
      for (let i = 0; i < 220; i++) {
        const nx = x + (r() - 0.35) * W * 0.03
        const ny = y + Hh * 0.0028 + (r() - 0.5) * 2
        ctx.globalAlpha = 0.85 - i / 400
        ctx.lineWidth = 34 - i * 0.12 + r() * 6
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(nx, ny)
        ctx.stroke()
        x = nx
        y = ny
      }
      ctx.globalAlpha = 1
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(20,18,16,${r() * 0.05})`
        ctx.fillRect(r() * W, r() * Hh, 2, 2)
      }
      break
    }
    case 'print': {
      ctx.fillStyle = P[0]
      ctx.fillRect(0, 0, W, Hh)
      ctx.strokeStyle = P[1]
      for (let row = 0; row < 46; row++) {
        const y0 = Hh * 0.1 + row * Hh * 0.0175
        ctx.lineWidth = 3 + r() * 3
        ctx.beginPath()
        for (let xx = W * 0.08; xx < W * 0.92; xx += 8) {
          const crack = row > 28 && xx > W * 0.55 && xx < W * 0.6 ? 14 : 0
          const yy = y0 + Math.sin(xx / 60 + row * 0.4) * 6 + (r() - 0.5) * 2 + crack
          if (r() < 0.015) ctx.moveTo(xx, yy)
          else ctx.lineTo(xx, yy)
        }
        ctx.stroke()
      }
      ctx.fillStyle = P[0]
      ctx.beginPath()
      ctx.moveTo(W * 0.56, Hh * 0.55)
      ctx.lineTo(W * 0.6, Hh * 0.62)
      ctx.lineTo(W * 0.57, Hh * 0.92)
      ctx.lineTo(W * 0.555, Hh * 0.92)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'textile': {
      ctx.fillStyle = P[4] ?? '#ccc'
      ctx.fillRect(0, 0, W, Hh)
      let y = 0
      while (y < Hh) {
        const rh = Hh * (0.06 + r() * 0.1)
        let x = 0
        while (x < W) {
          const rw = W * (0.06 + r() * 0.16)
          ctx.fillStyle = P[Math.floor(r() * (P.length - 1))]
          ctx.globalAlpha = 0.75 + r() * 0.25
          ctx.fillRect(x + 2, y + 2, rw - 4, rh - 4)
          ctx.globalAlpha = 1
          ctx.setLineDash([7, 6])
          ctx.strokeStyle = 'rgba(230,220,200,0.55)'
          ctx.lineWidth = 2
          ctx.strokeRect(x + 7, y + 7, rw - 14, rh - 14)
          ctx.setLineDash([])
          x += rw
        }
        y += rh
      }
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = `rgba(0,0,0,${r() * 0.06})`
        ctx.fillRect(r() * W, r() * Hh, 1, 3)
      }
      break
    }
    case 'vessel': {
      const g = ctx.createLinearGradient(0, 0, 0, Hh)
      g.addColorStop(0, '#1f1c18')
      g.addColorStop(1, '#0c0b09')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, Hh)
      const prof = vesselProfile(w.seed)
      const cx = W / 2
      const scale = Hh * 0.62
      const base = Hh * 0.85
      ctx.beginPath()
      prof.forEach(([px, py], i) => {
        const X = cx + px * scale
        const Y = base - py * scale
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)
      })
      for (let i = prof.length - 1; i >= 0; i--) ctx.lineTo(cx - prof[i][0] * scale, base - prof[i][1] * scale)
      ctx.closePath()
      const vg = ctx.createLinearGradient(cx - scale * 0.5, 0, cx + scale * 0.5, 0)
      vg.addColorStop(0, P[2])
      vg.addColorStop(0.35, P[1])
      vg.addColorStop(1, P[0])
      ctx.fillStyle = vg
      ctx.fill()
      if (P[2].startsWith('#c')) {
        ctx.strokeStyle = P[2]
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(cx - scale * 0.1, base - scale * 0.3)
        ctx.lineTo(cx + scale * 0.02, base - scale * 0.18)
        ctx.lineTo(cx + scale * 0.12, base - scale * 0.25)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(234,215,174,0.08)'
      ctx.beginPath()
      ctx.ellipse(cx, base + 6, scale * 0.42, 10, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    }
  }

  cache.set(key, c)
  return c
}

/** 도자기 실루엣 프로필 (x=반지름, y=높이), 0..1 범위 — LatheGeometry와 2D 썸네일이 공유 */
export function vesselProfile(seed: number): [number, number][] {
  if (seed === 61) {
    // 낮은 사발
    return [
      [0.0, 0],
      [0.14, 0],
      [0.16, 0.03],
      [0.3, 0.12],
      [0.38, 0.22],
      [0.4, 0.26],
    ]
  }
  // 달항아리 변형
  return [
    [0.0, 0],
    [0.12, 0],
    [0.14, 0.02],
    [0.26, 0.12],
    [0.33, 0.28],
    [0.32, 0.42],
    [0.24, 0.56],
    [0.14, 0.64],
    [0.13, 0.68],
    [0.15, 0.7],
  ]
}

const urlCache = new Map<string, string>()
export function artUrl(w: Artwork, size = 640) {
  const k = `${w.id}:${size}`
  let u = urlCache.get(k)
  if (!u) {
    u = artCanvas(w, size).toDataURL('image/jpeg', 0.86)
    urlCache.set(k, u)
  }
  return u
}
