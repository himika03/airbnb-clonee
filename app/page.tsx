'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CategoryBar } from '@/components/listings/CategoryBar';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingsGridSkeleton } from '@/components/listings/ListingSkeleton';
import { FilterButton, FilterState } from '@/components/search/FilterModal';
import { SearchBar } from '@/components/search/SearchBar';
import { listingsApi } from '@/lib/api';
import { Search, SlidersHorizontal } from 'lucide-react';

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

export default function HomePage() {
  const [category, setCategory] = useState('all');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState('newest');

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['listings', category, filters, sortBy],
    queryFn: () =>
      listingsApi.getAll({
        category: category === 'all' ? undefined : category,
        priceMin: filters.priceMin > 0 ? filters.priceMin : undefined,
        priceMax: filters.priceMax < 2000 ? filters.priceMax : undefined,
        propertyType: filters.propertyTypes.length === 1 ? filters.propertyTypes[0] : undefined,
        sortBy,
        limit: 30,
      }),
    staleTime: 30000,
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero search section */}
      <div className="bg-gradient-to-b from-[#F7F7F7] to-white py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#222222] mb-2">
            Find your next perfect stay
          </h1>
          <p className="text-[#717171] text-[16px]">
            Discover unique homes, villas, cabins, and more around the world
          </p>
        </motion.div>

        <SearchBar />
      </div>

      {/* Category bar */}
      <CategoryBar activeCategory={category} onCategoryChange={setCategory} />

      {/* Listings */}
      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[14px] text-[#717171]">
            {isLoading ? 'Loading...' : `${listings?.length || 0} stays`}
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#222222] focus:outline-none focus:border-[#222222] bg-white hover:border-[#717171] transition-colors cursor-pointer"
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
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-[#717171] text-[16px]">Something went wrong. Please try again.</p>
          </div>
        ) : !listings?.length ? (
          <EmptyState category={category} />
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

function EmptyState({ category }: { category: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mb-6">
        <Search className="w-8 h-8 text-[#DDDDDD]" />
      </div>
      <h3 className="text-[20px] font-semibold text-[#222222] mb-2">No exact matches</h3>
      <p className="text-[#717171] text-[15px] max-w-sm">
        Try changing or removing some of your filters, or adjusting your search area.
      </p>
    </motion.div>
  );
}
