'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, 
  Globe,
   Menu, 
   User, 
   Heart, 
   Home, 
   BriefcaseIcon,
   Settings, 
   Bell, 

  
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, role, switchRole } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchRole = () => {
    switchRole();
    setMenuOpen(false);
    const newRole = role === 'guest' ? 'Host' : 'Guest';
    toast.success(`Switched to ${newRole} mode`);
    if (role === 'guest') {
      router.push('/host');
    } else {
      router.push('/');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-white border-b border-[#DDDDDD] shadow-sm'
          : 'bg-white border-b border-[#DDDDDD]'
      }`}
    >
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-[#FF385C] rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[#FF385C] font-bold text-xl hidden sm:block tracking-tight">
                stayscape
              </span>
            </div>
          </Link>

          {/* Center search pill (desktop, home page) */}
          {isHome && (
            <div className="hidden md:flex">
              <button
                onClick={() => router.push('/search')}
                className="flex items-center gap-3 border border-[#DDDDDD] rounded-full px-4 py-2.5 hover:shadow-md transition-shadow duration-200 bg-white"
              >
                <span className="text-[13px] font-semibold text-[#222222] border-r border-[#DDDDDD] pr-3">Anywhere</span>
                <span className="text-[13px] font-semibold text-[#222222] border-r border-[#DDDDDD] pr-3">Any week</span>
                <span className="text-[13px] font-medium text-[#717171] pr-1">Add guests</span>
                <div className="w-8 h-8 bg-[#FF385C] rounded-full flex items-center justify-center">
                  <Search className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          )}

          {/* Right nav */}
          <div className="flex items-center gap-2">
            {role === 'guest' ? (
              <Link
                href="/host"
                className="hidden md:block text-[14px] font-medium text-[#222222] hover:bg-[#F7F7F7] rounded-full px-4 py-2.5 transition-colors"
              >
                StayScape your home
              </Link>
            ) : (
              <Link
                href="/"
                className="hidden md:block text-[14px] font-medium text-[#222222] hover:bg-[#F7F7F7] rounded-full px-4 py-2.5 transition-colors"
              >
                Switch to traveling
              </Link>
            )}

            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F7F7F7] transition-colors">
              <Globe className="w-4.5 h-4.5 text-[#222222]" />
            </button>

            {/* Profile menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-2 border rounded-full px-3 py-2 hover:shadow-md transition-all duration-200 ${
                  menuOpen ? 'shadow-md border-[#B0B0B0]' : 'border-[#DDDDDD]'
                } bg-white`}
              >
                <Menu className="w-4 h-4 text-[#222222]" />
                <Avatar className="w-7 h-7">
                  <AvatarImage src={currentUser?.avatar_url} />
                  <AvatarFallback className="bg-[#222222] text-white text-xs font-semibold">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {role === 'host' && (
                  <div className="w-2 h-2 bg-[#FF385C] rounded-full absolute -top-0.5 -right-0.5" />
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#DDDDDD] overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-[#F0F0F0]">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={currentUser?.avatar_url} />
                          <AvatarFallback className="bg-[#222222] text-white text-xs font-semibold">
                            {currentUser ? getInitials(currentUser.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[13px] font-semibold text-[#222222]">{currentUser?.name}</p>
                          <p className="text-[12px] text-[#717171]">{role === 'host' ? 'Host Mode' : 'Guest Mode'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {role === 'guest' ? (
                        <>
                          <MenuLink href="/trips" icon={<BriefcaseIcon className="w-4 h-4" />} label="Trips" onClick={() => setMenuOpen(false)} />
                          <MenuLink href="/wishlist" icon={<Heart className="w-4 h-4" />} label="Wishlist" onClick={() => setMenuOpen(false)} />
                        </>
                      ) : (
                        <>
                          <MenuLink href="/host" icon={<Home className="w-4 h-4" />} label="Dashboard" onClick={() => setMenuOpen(false)} />
                          <MenuLink href="/host/listings" icon={<BriefcaseIcon className="w-4 h-4" />} label="Listings" onClick={() => setMenuOpen(false)} />
                          <MenuLink href="/host/bookings" icon={<Bell className="w-4 h-4" />} label="Bookings" onClick={() => setMenuOpen(false)} />
                        </>
                      )}
                    </div>

                    <div className="border-t border-[#F0F0F0] py-1">
                      <button
                        onClick={handleSwitchRole}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#222222] hover:bg-[#F7F7F7] transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-[#717171]" />
                        {role === 'guest' ? 'Switch to Host mode' : 'Switch to Guest mode'}
                      </button>
                      <MenuLink href="/settings" icon={<Settings className="w-4 h-4 text-[#717171]" />} label="Settings" onClick={() => setMenuOpen(false)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#222222] hover:bg-[#F7F7F7] transition-colors"
    >
      <span className="text-[#717171]">{icon}</span>
      {label}
    </Link>
  );
}
