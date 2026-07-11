'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, X, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingsGridSkeleton } from '@/components/listings/ListingSkeleton';
import { FilterButton, FilterState } from '@/components/search/FilterModal';
import { listingsApi } from '@/lib/api';

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

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get('location') || '';
  const guests = Number(searchParams.get('guests') || 1);

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState('newest');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['search', location, guests, filters, sortBy],
    queryFn: () =>
      listingsApi.getAll({
        location: location || undefined,
        guests: guests > 1 ? guests : undefined,
        priceMin: filters.priceMin > 0 ? filters.priceMin : undefined,
        priceMax: filters.priceMax < 2000 ? filters.priceMax : undefined,
        propertyType: filters.propertyTypes.length === 1 ? filters.propertyTypes[0] : undefined,
        sortBy,
        limit: 50,
      }),
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-[#222222]">
              {location ? `Stays in ${location}` : 'All stays'}
            </h1>
            <p className="text-[14px] text-[#717171] mt-1">
              {isLoading ? 'Searching...' : `${listings?.length || 0} result${listings?.length !== 1 ? 's' : ''}`}
              {guests > 1 ? ` · ${guests} guests` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {location && (
              <button
                onClick={() => router.push('/search')}
                className="flex items-center gap-2 text-[13px] font-medium text-[#717171] hover:text-[#222222] border border-[#DDDDDD] rounded-full px-3 py-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear location
              </button>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#222222] focus:outline-none focus:border-[#222222] bg-white cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
              <option value="rating">Top rated</option>
            </select>
            <FilterButton filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {isLoading ? (
          <ListingsGridSkeleton count={12} />
        ) : !listings?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-[#DDDDDD]" />
            </div>
            <h3 className="text-[20px] font-semibold text-[#222222] mb-2">No exact matches</h3>
            <p className="text-[#717171] text-[15px] max-w-sm">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
          >
            {listings.map((listing: any, i: number) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
