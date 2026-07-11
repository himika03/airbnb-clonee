'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';

export interface FilterState {
  priceMin: number;
  priceMax: number;
  propertyTypes: string[];
  amenities: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  superhost: boolean;
  instantBook: boolean;
}

const defaultFilters: FilterState = {
  priceMin: 0,
  priceMax: 2000,
  propertyTypes: [],
  amenities: [],
  bedrooms: null,
  bathrooms: null,
  superhost: false,
  instantBook: false,
};

const PROPERTY_TYPES = [
  { id: 'entire_home', label: 'Entire home' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'villa', label: 'Villa' },
  { id: 'cabin', label: 'Cabin' },
  { id: 'treehouse', label: 'Treehouse' },
  { id: 'bungalow', label: 'Bungalow' },
  { id: 'cottage', label: 'Cottage' },
  { id: 'castle', label: 'Castle' },
  { id: 'tiny_home', label: 'Tiny home' },
];

const AMENITIES_LIST = [
  { id: 'WiFi', label: 'WiFi' },
  { id: 'Kitchen', label: 'Kitchen' },
  { id: 'Pool', label: 'Pool' },
  { id: 'Hot tub', label: 'Hot tub' },
  { id: 'Free parking', label: 'Free parking' },
  { id: 'Air conditioning', label: 'Air conditioning' },
  { id: 'Washer', label: 'Washer' },
  { id: 'Gym', label: 'Gym' },
  { id: 'Workspace', label: 'Workspace' },
  { id: 'Pet friendly', label: 'Pet friendly' },
  { id: 'Fireplace', label: 'Fireplace' },
  { id: 'Beach access', label: 'Beach access' },
];

interface FilterModalProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterButton({ filters, onFiltersChange }: FilterModalProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(filters);

  const activeCount = [
    filters.priceMin > 0 || filters.priceMax < 2000,
    filters.propertyTypes.length > 0,
    filters.amenities.length > 0,
    filters.bedrooms !== null,
    filters.superhost,
    filters.instantBook,
  ].filter(Boolean).length;

  const handleOpen = () => {
    setDraft(filters);
    setOpen(true);
  };

  const handleApply = () => {
    onFiltersChange(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(defaultFilters);
  };

  const togglePropertyType = (type: string) => {
    setDraft((d) => ({
      ...d,
      propertyTypes: d.propertyTypes.includes(type)
        ? d.propertyTypes.filter((t) => t !== type)
        : [...d.propertyTypes, type],
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(amenity)
        ? d.amenities.filter((a) => a !== amenity)
        : [...d.amenities, amenity],
    }));
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all hover:shadow-sm ${
          activeCount > 0
            ? 'border-[#222222] bg-[#F7F7F7]'
            : 'border-[#DDDDDD] bg-white hover:border-[#717171]'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
        Filters
        {activeCount > 0 && (
          <span className="w-5 h-5 bg-[#222222] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[90vh] flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[680px] md:max-h-[85vh] md:rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#DDDDDD]">
                <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-[16px] font-semibold">Filters</h3>
                <div className="w-8" />
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-6 py-6 space-y-8">
                {/* Price range */}
                <div>
                  <h4 className="text-[16px] font-semibold text-[#222222] mb-1">Price range</h4>
                  <p className="text-[13px] text-[#717171] mb-6">Nightly prices before fees and taxes</p>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={2000}
                      step={10}
                      value={[draft.priceMin, draft.priceMax]}
                      onValueChange={([min, max]) => setDraft((d) => ({ ...d, priceMin: min, priceMax: max }))}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 border border-[#DDDDDD] rounded-xl p-3">
                        <p className="text-[11px] text-[#717171] mb-1">Minimum</p>
                        <p className="text-[15px] font-semibold">{formatPrice(draft.priceMin)}</p>
                      </div>
                      <div className="w-4 h-px bg-[#DDDDDD]" />
                      <div className="flex-1 border border-[#DDDDDD] rounded-xl p-3">
                        <p className="text-[11px] text-[#717171] mb-1">Maximum</p>
                        <p className="text-[15px] font-semibold">{draft.priceMax >= 2000 ? `${formatPrice(2000)}+` : formatPrice(draft.priceMax)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property type */}
                <div>
                  <h4 className="text-[16px] font-semibold text-[#222222] mb-4">Type of place</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => togglePropertyType(type.id)}
                        className={`px-4 py-3 rounded-xl border text-[13px] font-medium text-center transition-all ${
                          draft.propertyTypes.includes(type.id)
                            ? 'border-[#222222] bg-[#F7F7F7]'
                            : 'border-[#DDDDDD] hover:border-[#717171]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-[16px] font-semibold text-[#222222] mb-4">Amenities</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {AMENITIES_LIST.map((amenity) => (
                      <label key={amenity.id} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={draft.amenities.includes(amenity.id)}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                          className="border-[#DDDDDD] data-[state=checked]:bg-[#222222] data-[state=checked]:border-[#222222]"
                        />
                        <span className="text-[14px] text-[#222222] group-hover:underline">{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rooms */}
                <div>
                  <h4 className="text-[16px] font-semibold text-[#222222] mb-4">Bedrooms</h4>
                  <div className="flex gap-3 flex-wrap">
                    {[null, 1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={String(num)}
                        onClick={() => setDraft((d) => ({ ...d, bedrooms: num }))}
                        className={`px-4 py-2 rounded-full border text-[13px] font-medium transition-all ${
                          draft.bedrooms === num
                            ? 'border-[#222222] bg-[#F7F7F7]'
                            : 'border-[#DDDDDD] hover:border-[#717171]'
                        }`}
                      >
                        {num === null ? 'Any' : num === 5 ? '5+' : num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h4 className="text-[16px] font-semibold text-[#222222] mb-4">Booking options</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-[14px] font-medium text-[#222222]">Instant Book</p>
                        <p className="text-[13px] text-[#717171]">Book without waiting for host approval</p>
                      </div>
                      <div
                        onClick={() => setDraft((d) => ({ ...d, instantBook: !d.instantBook }))}
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                          draft.instantBook ? 'bg-[#222222]' : 'bg-[#DDDDDD]'
                        }`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                          draft.instantBook ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-[14px] font-medium text-[#222222]">Superhost</p>
                        <p className="text-[13px] text-[#717171]">Stay with recognized top hosts</p>
                      </div>
                      <div
                        onClick={() => setDraft((d) => ({ ...d, superhost: !d.superhost }))}
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                          draft.superhost ? 'bg-[#222222]' : 'bg-[#DDDDDD]'
                        }`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                          draft.superhost ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-[#DDDDDD] flex items-center justify-between">
                <button
                  onClick={handleClear}
                  className="text-[14px] font-semibold text-[#222222] underline hover:text-[#717171] transition-colors"
                >
                  Clear all
                </button>
                <Button
                  onClick={handleApply}
                  className="bg-[#222222] text-white hover:bg-[#000000] rounded-xl px-6 py-3 text-[14px] font-semibold"
                >
                  Show results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
