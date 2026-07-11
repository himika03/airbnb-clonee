'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Clock, CheckCircle, XCircle, Star, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { bookingsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatPrice, formatDate, getInitials } from '@/lib/utils';
import { Booking } from '@/lib/supabase';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'text-[#00A699] bg-[#00A699]/10', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-[#FFB400] bg-[#FFB400]/10', icon: Clock },
  cancelled: { label: 'Cancelled', color: 'text-[#E31C5F] bg-[#E31C5F]/10', icon: XCircle },
  completed: { label: 'Completed', color: 'text-[#717171] bg-[#F0F0F0]', icon: CheckCircle },
};

export default function TripsPage() {
  const { currentUser } = useAppStore();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'guest', currentUser?.id],
    queryFn: () => bookingsApi.getByGuestId(currentUser!.id),
    enabled: !!currentUser,
  });

  const upcoming = bookings?.filter((b: any) => b.status === 'confirmed' && new Date(b.check_in) >= new Date()) || [];
  const past = bookings?.filter((b: any) => b.status === 'completed' || new Date(b.check_out) < new Date()) || [];
  const cancelled = bookings?.filter((b: any) => b.status === 'cancelled') || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-[32px] font-bold text-[#222222] mb-8">Trips</h1>

        {isLoading ? (
          <TripsSkeleton />
        ) : !bookings?.length ? (
          <EmptyTrips />
        ) : (
          <div className="space-y-12">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-[20px] font-semibold text-[#222222] mb-5">Upcoming trips</h2>
                <div className="space-y-4">
                  {upcoming.map((b: any, i: number) => <BookingCard key={b.id} booking={b} index={i} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-[20px] font-semibold text-[#222222] mb-5">Past trips</h2>
                <div className="space-y-4">
                  {past.map((b: any, i: number) => <BookingCard key={b.id} booking={b} index={i} />)}
                </div>
              </section>
            )}
            {cancelled.length > 0 && (
              <section>
                <h2 className="text-[20px] font-semibold text-[#222222] mb-5">Cancelled trips</h2>
                <div className="space-y-4">
                  {cancelled.map((b: any, i: number) => <BookingCard key={b.id} booking={b} index={i} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const config = STATUS_CONFIG[booking.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/listings/${booking.listing_id}`}>
        <div className="border border-[#DDDDDD] rounded-2xl p-5 flex gap-5 hover:shadow-md transition-shadow group">
          {/* Image */}
          <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0F0F0]">
            <img
              src={(booking.listing as any)?.thumbnail_url || 'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=400'}
              alt={(booking.listing as any)?.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#222222] line-clamp-1">
                  {(booking.listing as any)?.title || 'Property'}
                </h3>
                <p className="text-[14px] text-[#717171] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {(booking.listing as any)?.location_city}, {(booking.listing as any)?.location_country}
                </p>
              </div>
              <span className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ${config.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {config.label}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-[13px] text-[#717171]">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(booking.check_in), 'MMM d')} – {format(new Date(booking.check_out), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-[#717171]">
                <Users className="w-3.5 h-3.5" />
                {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-[#717171]">
                <Clock className="w-3.5 h-3.5" />
                {booking.nights} night{booking.nights !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-[14px] font-semibold text-[#222222]">
                {formatPrice(booking.total_amount)} total
              </p>
              <div className="flex items-center gap-1 text-[13px] font-medium text-[#222222] group-hover:underline">
                View details
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyTrips() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mx-auto mb-6">
        <Calendar className="w-8 h-8 text-[#DDDDDD]" />
      </div>
      <h3 className="text-[20px] font-semibold text-[#222222] mb-2">No trips yet</h3>
      <p className="text-[#717171] text-[15px] mb-6 max-w-sm mx-auto">
        Time to dust off your bags and start planning your next adventure.
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

function TripsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-[#DDDDDD] rounded-2xl p-5 flex gap-5">
          <div className="w-32 h-24 rounded-xl bg-[#EBEBEB] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-[#EBEBEB] rounded-full w-2/3" />
            <div className="h-4 bg-[#EBEBEB] rounded-full w-1/3" />
            <div className="h-4 bg-[#EBEBEB] rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}