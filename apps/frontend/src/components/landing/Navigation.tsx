import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

/* ── NavLink ────────────────────────────────────────────────── */
function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        active
          ? 'text-rs-accent font-bold border-b-2 border-rs-accent pb-0.5'
          : 'text-muted-foreground hover:text-rs-accent'
      }`}
    >
      {label}
    </Link>
  );
}

/* ── Navigation ─────────────────────────────────────────────── */
export function Navigation() {
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const NAV_LINKS = useMemo(() => [
    { to: '/mentors', label: t('nav.findMentors') },
    { to: '/#how-it-works', label: t('nav.howItWorks') },
    { to: '/#programs', label: t('nav.programs') },
    { to: '/#resources', label: t('nav.resources') },
  ], [t]);

  const links = useMemo(() => {
    if (!user) return NAV_LINKS;
    if (user.role === 'ADMIN') {
      return [
        { to: '/dashboard/admin', label: t('dashboard.sidebar.dashboard') },
      ];
    }
    if (user.role === 'MENTOR') {
      return [
        { to: '/dashboard/mentor', label: t('dashboard.sidebar.dashboard') },
      ];
    }
    // Student
    return [
      { to: '/dashboard/student', label: t('nav.mySessions') },
      { to: '/mentors', label: t('nav.findMentors') },
    ];
  }, [user, NAV_LINKS, t]);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 h-14">
        {/* Logo */}
        <Link to="/" className="text-xl font-black text-rs-accent tracking-tight">
          {t('common.appName')}
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} label={label} active={pathname === to} />
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-9 w-9">
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          {/* Language switcher */}
          <LanguageToggle />

          <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

          {/* Auth buttons — Desktop */}
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-rs-accent transition-colors">
                {user.name}
              </Link>
              <Button size="sm" variant="outline" onClick={logout} className="rounded-full">
                {t('nav.signOut')}
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button size="sm" asChild className="bg-rs-accent hover:bg-rs-accent-hover text-white rounded-full">
                <Link to="/register">{t('nav.joinNow')}</Link>
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-10">
              <div className="flex flex-col gap-4">
                {links.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`text-sm font-medium py-2 ${
                      pathname === to
                        ? 'text-rs-accent'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <Separator />
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-sm font-medium py-2 text-muted-foreground hover:text-rs-accent transition-colors"
                    >
                      {t('dashboard.sidebar.dashboard')} ({user.name})
                    </Link>
                    <Button size="sm" variant="outline" onClick={logout} className="w-full rounded-full">
                      {t('nav.signOut')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login">{t('nav.login')}</Link>
                    </Button>
                    <Button size="sm" asChild className="bg-rs-accent hover:bg-rs-accent-hover text-white rounded-full">
                      <Link to="/register">{t('nav.joinNow')}</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
