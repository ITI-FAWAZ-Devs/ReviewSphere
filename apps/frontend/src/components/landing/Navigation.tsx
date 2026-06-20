import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

/* ── Data ───────────────────────────────────────────────────── */
const NAV_LINKS = [
  { to: '/mentors', label: 'Find Mentors' },
  { to: '/#how-it-works', label: 'How it Works' },
  { to: '/#programs', label: 'Programs' },
  { to: '/#resources', label: 'Resources' },
] as const;

const STUDENT_NAV_LINKS = [
  { to: '/dashboard', label: 'My Sessions' },
  { to: '/mentors', label: 'Find Mentors' },
] as const;

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
] as const;

/* ── NavLink ────────────────────────────────────────────────── */
function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        active
          ? 'text-landing-primary dark:text-primary-fixed-dim font-bold border-b-2 border-landing-primary dark:border-primary-fixed-dim pb-0.5'
          : 'text-muted-foreground hover:text-landing-primary dark:hover:text-primary-fixed-dim'
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

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <nav className="sticky top-0 z-50 bg-background/80 dark:bg-[#0b1c30]/80 backdrop-blur-xl border-b shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 h-14">
        {/* Logo */}
        <Link to="/" className="text-xl font-black text-landing-primary dark:text-primary-fixed-dim tracking-tight">
          ReviewSphere
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {(user?.role === 'STUDENT' ? STUDENT_NAV_LINKS : NAV_LINKS).map(({ to, label }) => (
            <NavLink key={to} to={to} label={label} active={pathname === to} />
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <span className="material-symbols-outlined text-xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </Button>

          {/* Language switcher */}
          <Select defaultValue="en">
            <SelectTrigger className="w-[70px] h-8 text-xs rounded-full border-outline-variant/50 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(({ code, label }) => (
                <SelectItem key={code} value={code}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

          {/* Auth buttons — Desktop */}
          {user ? (
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/profile/edit" className="text-sm font-semibold text-muted-foreground hover:text-landing-primary dark:hover:text-primary-fixed-dim transition-colors">
                {user.name}
              </Link>
              <Button size="sm" variant="outline" onClick={logout} className="rounded-full border-outline-variant/60 hover:bg-slate-850">
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary-container text-on-primary-container hover:bg-primary-container/90 rounded-full">
                <Link to="/signup">Join Now</Link>
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <span className="material-symbols-outlined">menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-10">
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`text-sm font-medium py-2 ${
                      pathname === to
                        ? 'text-landing-primary dark:text-primary-fixed-dim'
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
                      to="/profile/edit"
                      className="text-sm font-medium py-2 text-muted-foreground hover:text-landing-primary dark:hover:text-primary-fixed-dim"
                    >
                      Settings ({user.name})
                    </Link>
                    <Button size="sm" variant="outline" onClick={logout} className="w-full rounded-full">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button size="sm" asChild className="bg-primary-container text-on-primary-container rounded-full">
                      <Link to="/signup">Join Now</Link>
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
