'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  BarChart3,
  Bookmark,
  User,
  Settings,
  Shield,
  Bell,
  Menu,
  X,
  LogOut,
  Brain,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { mockNotifications } from '@/lib/mock-data';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeNavLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/schemes', label: 'Schemes', icon: Search },
    { href: '/eligibility', label: 'AI Analysis', icon: Brain },
    ...(user ? [{ href: '/bookmarks', label: 'Bookmarks', icon: Bookmark }] : []),
  ];

  const activeMobileNavLinks: NavLink[] = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/schemes', label: 'Schemes', icon: Search },
    { href: '/eligibility', label: 'AI', icon: Brain },
    user 
      ? { href: '/bookmarks', label: 'Saved', icon: Bookmark }
      : { href: '/auth', label: 'Sign In', icon: User },
    ...(user ? [{ href: '/settings', label: 'Settings', icon: Settings }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show navbar on landing or auth pages
  if (pathname === '/' || pathname === '/auth') return null;

  return (
    <>
      {/* Desktop Top Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'nav-blur shadow-lg shadow-black/20' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center shadow-lg shadow-saffron-500/25 group-hover:shadow-saffron-500/40 transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold font-[family-name:var(--font-display)] text-white">
                  JanSeva
                </span>
                <span className="text-lg font-bold font-[family-name:var(--font-display)] text-saffron-400">
                  {' '}AI
                </span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {activeNavLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-saffron-500/15 text-saffron-400 shadow-inner'
                        : 'text-surface-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-saffron-400" />
                ) : (
                  <Moon className="w-5 h-5 text-navy-500" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="relative p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {mockNotifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-saffron-500 rounded-full border-2 border-surface-950 animate-pulse" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl p-4 animate-slide-down shadow-2xl">
                    <h3 className="text-sm font-semibold text-white mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <div className="w-2 h-2 mt-2 rounded-full bg-saffron-500 shrink-0" />
                        <div>
                          <p className="text-xs text-white font-medium">Deadline Approaching</p>
                          <p className="text-xs text-surface-400 mt-0.5">PM Awas Yojana deadline is March 31, 2026</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <p className="text-xs text-white font-medium">New Scheme Available</p>
                          <p className="text-xs text-surface-400 mt-0.5">PM Internship Scheme launched. Check eligibility!</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <div className="w-2 h-2 mt-2 rounded-full bg-navy-400 shrink-0" />
                        <div>
                          <p className="text-xs text-white font-medium">95% Match Found</p>
                          <p className="text-xs text-surface-400 mt-0.5">You&apos;re highly eligible for PM Kisan Samman Nidhi</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/dashboard" className="block text-center text-xs text-saffron-400 hover:text-saffron-300 mt-3 pt-3 border-t border-white/5">
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile Dropdown or Sign In */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-surface-400 hidden sm:block" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 animate-slide-down shadow-2xl">
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-sm font-medium text-white">{user.name || 'Citizen'}</p>
                        <p className="text-xs text-surface-400">{user.phone}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-white hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-white hover:bg-white/5 transition-colors">
                        <BarChart3 className="w-4 h-4" /> Admin Panel
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button 
                          onClick={() => {
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="px-4 py-2 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:shadow-lg hover:shadow-saffron-500/25 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden nav-blur border-t border-white/5">
        <div className="flex items-center justify-around px-2 py-1">
          {activeMobileNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'text-saffron-400'
                    : 'text-surface-500 hover:text-surface-300'
                }`}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]' : ''}`} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}
