'use client';

import { motion } from 'framer-motion';

export function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-2xl bg-[#EBEBEB]" />
      <div className="mt-3 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-[#EBEBEB] rounded-full w-2/3" />
          <div className="h-4 bg-[#EBEBEB] rounded-full w-8" />
        </div>
        <div className="h-3.5 bg-[#EBEBEB] rounded-full w-4/5" />
        <div className="h-3.5 bg-[#EBEBEB] rounded-full w-1/2" />
        <div className="h-4 bg-[#EBEBEB] rounded-full w-1/3 mt-1" />
      </div>
    </div>
  );
}

export function ListingsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
