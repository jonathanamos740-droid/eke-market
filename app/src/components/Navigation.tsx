import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  TrendingUp, 
  Star, 
  Zap,
  BarChart3,
  ChevronRight,
  Sun,
  Moon,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'Markets', icon: TrendingUp },
  { path: '/gainers-losers', label: 'Gainers/Losers', icon: Activity },
  { path: '/compare', label: 'Compare', icon: BarChart3 },
  { path: '/watchlist', label: 'Watchlist', icon: Star },
  { path: '/trending', label: 'Trending', icon: Zap },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Toggle dark/light mode
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light');
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Navigation Bar */}
      <nav className="bg-surface-container-low/90 backdrop-blur-glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img src="/eke-icon.svg" alt="Eke Market" className="w-10 h-auto animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-eke-amber transition-colors">
                  EKE MARKET
                </span>
                <span className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase -mt-1">
                  Crypto Terminal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-300
                      ${active 
                        ? 'text-eke-amber bg-eke-amber/10' 
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {active && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-eke-amber" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:flex text-muted-foreground hover:text-white mr-2"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Live Connection Indicator */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/50 border border-white/[0.06]">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-eke-amber" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-eke-amber animate-pulse-ring" />
                </div>
                <span className="text-xs text-muted-foreground tracking-wide">LIVE</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-low/95 backdrop-blur-glass border-b border-white/[0.06]">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300
                    ${active 
                      ? 'bg-eke-amber/10 text-eke-amber' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}
            
              {/* Mobile Live Indicator */}
              <div className="flex items-center gap-2 px-4 py-3 mt-4 border-t border-white/[0.06]">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-eke-amber" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-eke-amber animate-pulse-ring" />
                </div>
                <span className="text-xs text-muted-foreground tracking-wide">LIVE CONNECTION</span>
              </div>

              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-3 mt-2 border-t border-white/[0.06]">
                <span className="text-sm text-muted-foreground">Theme</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-muted-foreground hover:text-white"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              </div>
            </div>
        </div>
      )}
    </header>
  );
}
