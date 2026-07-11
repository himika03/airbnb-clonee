'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Waves, Mountain, Trees, Building2, Tent, Flame, Sailboat, Home, Sparkles, Leaf, Utensils, Snowflake, Star } from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'beachfront', label: 'Beachfront', icon: Waves },
  { id: 'mountains', label: 'Mountains', icon: Mountain },
  { id: 'amazing_pools', label: 'Amazing pools', icon: Waves },
  { id: 'cabins', label: 'Cabins', icon: Tent },
  { id: 'treehouses', label: 'Treehouses', icon: Trees },
  { id: 'tropical', label: 'Tropical', icon: Leaf },
  { id: 'city', label: 'City', icon: Building2 },
  { id: 'countryside', label: 'Countryside', icon: Home },
  { id: 'islands', label: 'Islands', icon: Waves },
  { id: 'lakefront', label: 'Lakefront', icon: Sailboat },
  { id: 'desert', label: 'Desert', icon: Flame },
  { id: 'safari', label: 'Safari', icon: Star },
  { id: 'arctic', label: 'Arctic', icon: Snowflake },
  { id: 'coastal', label: 'Coastal', icon: Waves },
];

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 sm:top-20 z-40 bg-white border-b border-[#DDDDDD]">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative flex items-center">
          {/* Scroll left */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 w-8 h-8 bg-white rounded-full border border-[#DDDDDD] shadow-sm flex items-center justify-center hover:border-[#222222] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#222222]" />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-8 overflow-x-auto scrollbar-hide py-4 px-10"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className="flex flex-col items-center gap-2 min-w-max group flex-shrink-0"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className={`flex items-center justify-center w-7 h-7 transition-colors ${
                    isActive ? 'text-[#222222]' : 'text-[#717171] group-hover:text-[#222222]'
                  }`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span
                    className={`text-[12px] font-medium whitespace-nowrap transition-colors ${
                      isActive ? 'text-[#222222]' : 'text-[#717171] group-hover:text-[#222222]'
                    }`}
                  >
                    {cat.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="category-indicator"
                      className="absolute bottom-0 h-0.5 bg-[#222222] rounded-full"
                      style={{ width: '100%' }}
                    />
                  )}
                  <div className={`h-0.5 rounded-full transition-all duration-200 ${
                    isActive ? 'w-full bg-[#222222]' : 'w-0 bg-transparent'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Scroll right */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 w-8 h-8 bg-white rounded-full border border-[#DDDDDD] shadow-sm flex items-center justify-center hover:border-[#222222] transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[#222222]" />
          </button>
        </div>
      </div>
    </div>
  );
}
