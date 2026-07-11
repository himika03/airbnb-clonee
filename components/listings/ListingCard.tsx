'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ChevronLeft, ChevronRight, Award, Zap } from 'lucide-react';
import { Listing } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const { toggleWishlist, isWishlisted } = useAppStore();
  const wishlisted = isWishlisted(listing.id);
  const [imgIndex, setImgIndex] = useState(0);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const images = listing.images?.length
    ? listing.images.sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url)
    : [listing.thumbnail_url || 'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=800'];

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnimating(true);
    toggleWishlist(listing.id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
    setTimeout(() => setHeartAnimating(false), 300);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link href={`/listings/${listing.id}`} className="block group">
        {/* Image container */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F0F0F0]">
          <motion.img
            key={imgIndex}
            src={images[imgIndex]}
            alt={listing.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{ transform: 'scale(1)', transition: 'transform 0.4s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {listing.is_superhost_listing && (
              <div className="flex items-center gap-1 bg-white rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#222222] shadow-sm">
                <Award className="w-3 h-3 text-[#FF385C]" />
                Superhost
              </div>
            )}
            {listing.instant_book && (
              <div className="flex items-center gap-1 bg-white rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#222222] shadow-sm">
                <Zap className="w-3 h-3 text-[#00A699]" />
                Instant
              </div>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-200 ${
                heartAnimating ? 'animate-pulse-heart' : ''
              } ${
                wishlisted
                  ? 'fill-[#FF385C] stroke-[#FF385C]'
                  : 'fill-black/30 stroke-white'
              }`}
              strokeWidth={2}
            />
          </button>

          {/* Image navigation */}
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handlePrev}
                className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#222222]" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1">
                {images.slice(0, 5).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all ${
                      i === imgIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#222222]" />
              </button>
            </div>
          )}
        </div>

        {/* Listing info */}
        <div className="mt-3 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-semibold text-[#222222] line-clamp-1 flex-1">
              {listing.location_city}, {listing.location_country}
            </p>
            {listing.rating > 0 && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Star className="w-3 h-3 fill-[#222222] stroke-[#222222]" />
                <span className="text-[13px] font-medium text-[#222222]">
                  {listing.rating.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <p className="text-[14px] text-[#717171] line-clamp-1">{listing.title}</p>

          <p className="text-[14px] text-[#717171]">
            {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''} · {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
          </p>

          <p className="text-[14px] font-semibold text-[#222222] pt-1">
            {formatPrice(listing.price_per_night)}{' '}
            <span className="font-normal text-[#222222]">night</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
