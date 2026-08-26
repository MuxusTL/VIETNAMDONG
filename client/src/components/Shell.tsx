import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Tổng quan' },
  { to: '/chart', icon: 'bi-graph-up', label: 'Biểu đồ Nova' },
  { to: '/daily-reward', icon: 'bi-gift', label: 'Quà thưởng ngày' },
  { to: '/leaderboard', icon: 'bi-trophy', label: 'Bảng xếp hạng' },
  { to: '/wallet', icon: 'bi-cash-coin', label: 'Ví / Rút tiền' },
  { to: '/redeem', icon: 'bi-controller', label: 'Đổi thưởng' },
  { to: '/creator-code', icon: 'bi-tag', label: 'Creator Code' },
  { to: '/login-token', icon: 'bi-key', label: 'Login Token' },
  { to: '/admin', icon: 'bi-shield-lock', label: 'Quản trị' },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition ${
              isActive ? 'text-white bg-indigo/10 border-l-2 border-indigo' : 'text-muted hover:text-ink hover:bg-surface2'
            }`
          }
        >
          <i className={`bi ${item.icon} w-4`} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line sticky top-0 z-30 bg-bg/90 backdrop-blur">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2">
            <img src="/logo-mark.png" alt="LinkNet" className="w-7 h-7" />
            <span className="font-display font-semibold tracking-tight">LinkNet</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-ink"
            aria-label="Mở menu"
          >
            <i className="bi bi-list text-xl" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-64 bg-surface border-l border-line p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-sm">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center text-muted">
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto flex">
        <aside className="w-56 shrink-0 border-r border-line hidden md:block py-4 h-[calc(100vh-56px)] sticky top-14">
          <NavLinks />
        </aside>
        <main className="flex-1 px-4 sm:px-5 py-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
