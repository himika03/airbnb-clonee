'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, Star, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useAppStore();

  const { data: allListings, isLoading } = useQuery({
    queryKey: ['listings', 'all-for-wishlist'],
    queryFn: () => listingsApi.getAll({ limit: 100 }),
    enabled: wishlistIds.length > 0,
  });

  const savedListings = allListings?.filter((l: any) => wishlistIds.includes(l.id)) || [];

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
    toast.success('Removed from wishlist');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-[32px] font-bold text-[#222222] mb-2">Wishlist</h1>
        <p className="text-[15px] text-[#717171] mb-8">
          {savedListings.length} {savedListings.length === 1 ? 'place' : 'places'} saved
        </p>

        {!wishlistIds.length ? (
          <EmptyWishlist />
        ) : isLoading ? (
          <WishlistSkeleton />
        ) : !savedListings.length ? (
          <EmptyWishlist />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {savedListings.map((listing: any, i: number) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/listings/${listing.id}`} className="block group relative">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-[#F0F0F0] relative">
                    <img
                      src={listing.thumbnail_url || 'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    />
                    <button
                      onClick={(e) => handleRemove(listing.id, e)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#F7F7F7] transition-colors"
                    >
                      <Heart className="w-4.5 h-4.5 fill-[#FF385C] stroke-[#FF385C]" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-semibold text-[#222222] line-clamp-1">
                        {listing.location_city}, {listing.location_country}
                      </p>
                      {listing.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-[#222222] stroke-[#222222]" />
                          <span className="text-[13px] font-medium text-[#222222]">{listing.rating.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[13px] text-[#717171] line-clamp-1">{listing.title}</p>
                    <p className="text-[14px] font-semibold text-[#222222]">
                      {formatPrice(listing.price_per_night)} <span className="font-normal">night</span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="text-center py-24">
      <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-8 h-8 text-[#DDDDDD]" />
      </div>
      <h3 className="text-[20px] font-semibold text-[#222222] mb-2">Nothing saved yet</h3>
      <p className="text-[#717171] text-[15px] mb-6 max-w-sm mx-auto">
        As you search, click the heart icon to save your favorite places to stay.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#222222] text-white rounded-xl px-6 py-3 text-[14px] font-semibold hover:bg-black transition-colors"
      >
        Start exploring
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <div className="aspect-square rounded-2xl bg-[#EBEBEB]" />
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-[#EBEBEB] rounded-full w-3/4" />
            <div className="h-3.5 bg-[#EBEBEB] rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}