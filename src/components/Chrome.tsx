import { Link, NavLink } from 'react-router-dom'

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="잔상 홈">
      <span className="relative inline-block h-[18px] w-[11px] bg-tungsten shadow-[0_0_14px_rgba(234,215,174,0.55)] transition-shadow duration-700 group-hover:shadow-[0_0_22px_rgba(234,215,174,0.9)]" />
      <span className="display text-[19px] font-normal text-plaster">잔상</span>
    </Link>
  )
}

const links = [
  { to: '/', label: '기획전', end: true },
  { to: '/drops', label: '드롭 일정' },
  { to: '/submit', label: '작가 입점' },
]

export function TopBar({ transparent = false }: { transparent?: boolean }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 ${
        transparent ? '' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <Wordmark />
      <nav className="flex items-center gap-5 text-[13px] sm:gap-8">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `transition-colors duration-500 ${isActive ? 'text-tungsten' : 'text-ash hover:text-plaster'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-plaster/10 px-4 py-14 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Wordmark />
          <p className="label mt-4 max-w-sm">
            아직 이름 없는 작가의 작품을, 가장 감도 높게 발견하는 곳.
            <br />
            OriAlt가 운영합니다.
          </p>
        </div>
        <p className="label max-w-xs sm:text-right">
          MVP 화면입니다. 작가와 작품은 모두 가상의 샘플이며, 결제는 실제로 이루어지지 않습니다.
        </p>
      </div>
    </footer>
  )
}
