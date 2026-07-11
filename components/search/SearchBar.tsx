'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, X, Minus, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useAppStore } from '@/lib/store';

const POPULAR_DESTINATIONS = [
  { label: 'Bali, Indonesia', icon: '🌴' },
  { label: 'Paris, France', icon: '🗼' },
  { label: 'New York, USA', icon: '🗽' },
  { label: 'Tokyo, Japan', icon: '🗾' },
  { label: 'Maldives', icon: '🌊' },
  { label: 'Santorini, Greece', icon: '🏛️' },
];

type ActiveField = 'location' | 'checkin' | 'checkout' | 'guests' | null;

export function SearchBar() {
  const router = useRouter();
  const { searchParams, setSearchParams } = useAppStore();
  const [active, setActive] = useState<ActiveField>(null);
  const [location, setLocation] = useState(searchParams.location || '');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: searchParams.checkIn ? new Date(searchParams.checkIn) : undefined,
    to: searchParams.checkOut ? new Date(searchParams.checkOut) : undefined,
  });
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const totalGuests = guests.adults + guests.children;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setSearchParams({
      location,
      checkIn: dateRange.from?.toISOString() || null,
      checkOut: dateRange.to?.toISOString() || null,
      guests: totalGuests,
    });
    setActive(null);
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (dateRange.from) params.set('checkIn', dateRange.from.toISOString());
    if (dateRange.to) params.set('checkOut', dateRange.to.toISOString());
    if (totalGuests > 1) params.set('guests', String(totalGuests));
    router.push(`/search?${params.toString()}`);
  };

  const adjustGuests = (type: 'adults' | 'children' | 'infants', delta: number) => {
    setGuests((prev) => ({
      ...prev,
      [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + delta),
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4" ref={containerRef}>
      <motion.div
        layout
        className={`relative bg-white rounded-full border shadow-lg transition-all ${
          active ? 'shadow-xl border-[#DDDDDD]' : 'border-[#DDDDDD] hover:shadow-xl'
        }`}
      >
        <div className="flex items-center">
          {/* Location */}
          <button
            onClick={() => setActive(active === 'location' ? null : 'location')}
            className={`flex-1 flex flex-col justify-center px-6 py-3.5 rounded-l-full transition-colors min-w-0 ${
              active === 'location' ? 'bg-white shadow-md rounded-full' : 'hover:bg-[#F7F7F7] rounded-l-full'
            }`}
          >
            <span className="text-[11px] font-bold text-[#222222] whitespace-nowrap">Where</span>
            <span className={`text-[14px] truncate ${location ? 'text-[#222222]' : 'text-[#717171]'}`}>
              {location || 'Search destinations'}
            </span>
          </button>

          <div className="w-px h-8 bg-[#DDDDDD] flex-shrink-0" />

          {/* Check in */}
          <button
            onClick={() => setActive(active === 'checkin' ? null : 'checkin')}
            className={`flex flex-col justify-center px-5 py-3.5 transition-colors w-[140px] flex-shrink-0 ${
              active === 'checkin' ? 'bg-white shadow-md rounded-full' : 'hover:bg-[#F7F7F7]'
            }`}
          >
            <span className="text-[11px] font-bold text-[#222222]">Check in</span>
            <span className={`text-[14px] ${dateRange.from ? 'text-[#222222]' : 'text-[#717171]'}`}>
              {dateRange.from ? format(dateRange.from, 'MMM d') : 'Add dates'}
            </span>
          </button>

          <div className="w-px h-8 bg-[#DDDDDD] flex-shrink-0" />

          {/* Check out */}
          <button
            onClick={() => setActive(active === 'checkout' ? null : 'checkout')}
            className={`flex flex-col justify-center px-5 py-3.5 transition-colors w-[140px] flex-shrink-0 ${
              active === 'checkout' ? 'bg-white shadow-md rounded-full' : 'hover:bg-[#F7F7F7]'
            }`}
          >
            <span className="text-[11px] font-bold text-[#222222]">Check out</span>
            <span className={`text-[14px] ${dateRange.to ? 'text-[#222222]' : 'text-[#717171]'}`}>
              {dateRange.to ? format(dateRange.to, 'MMM d') : 'Add dates'}
            </span>
          </button>

          <div className="w-px h-8 bg-[#DDDDDD] flex-shrink-0" />

          {/* Guests + search */}
          <div className={`flex items-center flex-1 rounded-r-full transition-colors ${
            active === 'guests' ? 'bg-white shadow-md rounded-full' : 'hover:bg-[#F7F7F7]'
          }`}>
            <button
              onClick={() => setActive(active === 'guests' ? null : 'guests')}
              className="flex flex-col justify-center px-5 py-3.5 flex-1 text-left"
            >
              <span className="text-[11px] font-bold text-[#222222]">Who</span>
              <span className={`text-[14px] ${totalGuests > 1 ? 'text-[#222222]' : 'text-[#717171]'}`}>
                {totalGuests > 1 ? `${totalGuests} guests` : 'Add guests'}
              </span>
            </button>

            <button
              onClick={handleSearch}
              className="w-12 h-12 bg-[#FF385C] rounded-full flex items-center justify-center mr-2 hover:bg-[#E31C5F] transition-colors shadow-sm flex-shrink-0"
            >
              <Search className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Dropdowns */}
        <AnimatePresence>
          {active === 'location' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-6 z-50"
            >
              <div className="relative mb-4">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search destinations"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl pl-9 pr-4 py-2.5 text-[14px] focus:outline-none focus:border-[#222222] transition-colors"
                />
                {location && (
                  <button onClick={() => setLocation('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-[#717171]" />
                  </button>
                )}
              </div>

              <p className="text-[12px] font-semibold text-[#222222] mb-3">Popular destinations</p>
              <div className="space-y-1">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.label}
                    onClick={() => {
                      setLocation(dest.label);
                      setActive('checkin');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F7F7] transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-[#F0F0F0] rounded-xl flex items-center justify-center text-xl">
                      {dest.icon}
                    </div>
                    <span className="text-[14px] font-medium text-[#222222]">{dest.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {(active === 'checkin' || active === 'checkout') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-6 z-50"
            >
              <DayPicker
                mode="range"
                selected={dateRange as any}
                onSelect={(range: any) => {
                  setDateRange(range || {});
                  if (range?.from && range?.to) setActive('guests');
                  else if (range?.from) setActive('checkout');
                }}
                disabled={{ before: new Date() }}
                numberOfMonths={2}
                styles={{
                  root: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px' },
                }}
              />
            </motion.div>
          )}

          {active === 'guests' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-6 z-50"
            >
              <div className="space-y-6">
                {[
                  { type: 'adults' as const, label: 'Adults', sub: 'Ages 13 or above' },
                  { type: 'children' as const, label: 'Children', sub: 'Ages 2–12' },
                  { type: 'infants' as const, label: 'Infants', sub: 'Under 2' },
                ].map(({ type, label, sub }) => (
                  <div key={type} className="flex items-center justify-between">
                    <div>
                      <p className="text-[15px] font-medium text-[#222222]">{label}</p>
                      <p className="text-[13px] text-[#717171]">{sub}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => adjustGuests(type, -1)}
                        disabled={guests[type] <= (type === 'adults' ? 1 : 0)}
                        className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-[16px] font-medium">{guests[type]}</span>
                      <button
                        onClick={() => adjustGuests(type, 1)}
                        className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
