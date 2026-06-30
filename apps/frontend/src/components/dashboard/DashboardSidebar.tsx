import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

export interface SidebarLink {
  to: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardSidebarProps {
  links: SidebarLink[];
}

export default function DashboardSidebar({ links }: DashboardSidebarProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-e border-border bg-card/60 backdrop-blur-3xl h-screen sticky top-0 z-20 overflow-y-auto">
      <div className="px-6 pt-8 pb-6">
        <Link to="/" className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-rs-accent flex items-center justify-center text-white font-black shadow-lg shadow-rs-accent/30">
            R
          </span>
          {t('common.appName')}
        </Link>
        <p className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-widest">{t('dashboard.portal')}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          const baseClass =
            'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden group';
          const activeClass =
            'bg-rs-accent text-white shadow-md shadow-rs-accent/20';
          const inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-muted/60';

          return (
            <Link
              key={label}
              to={to}
              className={`${baseClass} ${active ? activeClass : inactiveClass}`}
            >
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-rs-danger hover:bg-rs-danger/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('dashboard.sidebar.logout')}
        </button>
      </div>
    </aside>
  );
}
