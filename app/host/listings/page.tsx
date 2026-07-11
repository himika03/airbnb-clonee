'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Star, MapPin, MoreHorizontal, Grid, List } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { listingsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function HostListingsPage() {
  const { currentUser } = useAppStore();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['host-listings', currentUser?.id],
    queryFn: () => listingsApi.getByHostId(currentUser!.id),
    enabled: !!currentUser,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => listingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-listings'] });
      toast.success('Listing deleted');
    },
    onError: () => toast.error('Failed to delete listing'),
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#222222]">Your listings</h1>
            <p className="text-[14px] text-[#717171] mt-1">{listings?.length || 0} properties</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[#DDDDDD] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[#222222] text-white' : 'text-[#717171] hover:bg-[#F7F7F7]'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-[#222222] text-white' : 'text-[#717171] hover:bg-[#F7F7F7]'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Link
              href="/host/listings/new"
              className="flex items-center gap-2 bg-[#FF385C] text-white rounded-xl px-5 py-3 text-[14px] font-semibold hover:bg-[#E31C5F] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New listing
            </Link>
          </div>
        </div>

        {isLoading ? (
          <HostListingsSkeleton viewMode={viewMode} />
        ) : !listings?.length ? (
          <EmptyListings />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing: any, i: number) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EBEBEB] group"
              >
                <div className="relative h-44 overflow-hidden bg-[#F0F0F0]">
                  <img
                    src={listing.thumbnail_url || ''}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                  />
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-[#222222]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-[#DDDDDD]">
                        <DropdownMenuItem asChild>
                          <Link href={`/listings/${listing.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" />
                            View listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/host/listings/${listing.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-[#E31C5F] flex items-center gap-2 cursor-pointer"
                          onClick={() => handleDelete(listing.id, listing.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className={`absolute top-3 left-3 text-[11px] font-semibold px-2 py-1 rounded-full ${
                    listing.is_active ? 'bg-[#00A699]/90 text-white' : 'bg-[#F0F0F0]/90 text-[#717171]'
                  }`}>
                    {listing.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold text-[#222222] line-clamp-1">{listing.title}</h3>
                  <p className="text-[13px] text-[#717171] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {listing.location_city}, {listing.location_country}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[14px] font-bold text-[#222222]">{formatPrice(listing.price_per_night)}<span className="font-normal text-[#717171] text-[12px]">/night</span></p>
                    {listing.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#222222] stroke-[#222222]" />
                        <span className="text-[12px] text-[#717171]">{listing.rating.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-[#F7F7F7] border-b border-[#EBEBEB] text-[12px] font-semibold text-[#717171] uppercase tracking-wide">
              <span>Property</span>
              <span>Status</span>
              <span>Price</span>
              <span>Rating</span>
              <span>Actions</span>
            </div>
            {listings.map((listing: any, i: number) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-[#F0F0F0] last:border-0 items-center hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0F0F0]">
                    <img src={listing.thumbnail_url || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#222222] truncate">{listing.title}</p>
                    <p className="text-[12px] text-[#717171] truncate">{listing.location_city}, {listing.location_country}</p>
                  </div>
                </div>
                <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full w-fit ${
                  listing.is_active ? 'bg-[#00A699]/10 text-[#00A699]' : 'bg-[#F0F0F0] text-[#717171]'
                }`}>
                  {listing.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[14px] font-semibold text-[#222222]">{formatPrice(listing.price_per_night)}</span>
                <div className="flex items-center gap-1">
                  {listing.rating > 0 ? (
                    <>
                      <Star className="w-3 h-3 fill-[#222222] stroke-[#222222]" />
                      <span className="text-[13px] text-[#222222]">{listing.rating.toFixed(2)}</span>
                    </>
                  ) : <span className="text-[13px] text-[#717171]">No reviews</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/listings/${listing.id}`} className="p-1.5 rounded-lg hover:bg-[#F0F0F0] transition-colors">
                    <Eye className="w-4 h-4 text-[#717171]" />
                  </Link>
                  <Link href={`/host/listings/${listing.id}/edit`} className="p-1.5 rounded-lg hover:bg-[#F0F0F0] transition-colors">
                    <Edit className="w-4 h-4 text-[#717171]" />
                  </Link>
                  <button onClick={() => handleDelete(listing.id, listing.title)} className="p-1.5 rounded-lg hover:bg-[#FFE8ED] transition-colors">
                    <Trash2 className="w-4 h-4 text-[#E31C5F]" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function EmptyListings() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-[#EBEBEB]">
      <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mx-auto mb-6">
        <Plus className="w-8 h-8 text-[#DDDDDD]" />
      </div>
      <h3 className="text-[20px] font-semibold text-[#222222] mb-2">No listings yet</h3>
      <p className="text-[#717171] text-[15px] mb-6 max-w-sm mx-auto">Create your first listing and start hosting guests from around the world.</p>
      <Link href="/host/listings/new" className="inline-flex items-center gap-2 bg-[#FF385C] text-white rounded-xl px-6 py-3 text-[14px] font-semibold hover:bg-[#E31C5F] transition-colors">
        <Plus className="w-4 h-4" />
        Create listing
      </Link>
    </div>
  );
}

function HostListingsSkeleton({ viewMode }: { viewMode: string }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#EBEBEB]">
            <div className="h-44 bg-[#EBEBEB]" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-[#EBEBEB] rounded-full w-3/4" />
              <div className="h-3.5 bg-[#EBEBEB] rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <div className="h-64 bg-[#EBEBEB] rounded-2xl animate-pulse" />;
}
