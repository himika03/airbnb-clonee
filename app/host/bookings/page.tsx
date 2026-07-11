'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { bookingsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatPrice, getInitials } from '@/lib/utils';

export default function HostBookingsPage() {
  const { currentUser } = useAppStore();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['host-bookings', currentUser?.id],
    queryFn: () => bookingsApi.getByHostId(currentUser!.id),
    enabled: !!currentUser,
  });

  const STATUS_CONFIG = {
    confirmed: { label: 'Confirmed', color: 'text-[#00A699] bg-[#00A699]/10', icon: CheckCircle },
    pending: { label: 'Pending', color: 'text-[#FFB400] bg-[#FFB400]/10', icon: Clock },
    cancelled: { label: 'Cancelled', color: 'text-[#E31C5F] bg-[#E31C5F]/10', icon: XCircle },
    completed: { label: 'Completed', color: 'text-[#717171] bg-[#F0F0F0]', icon: CheckCircle },
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-[28px] font-bold text-[#222222] mb-8">Bookings</h1>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-24 border border-[#EBEBEB]" />
            ))}
          </div>
        ) : !bookings?.length ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#EBEBEB]">
            <Calendar className="w-12 h-12 text-[#DDDDDD] mx-auto mb-4" />
            <h3 className="text-[18px] font-semibold text-[#222222]">No bookings yet</h3>
            <p className="text-[#717171] text-[14px] mt-2">Your bookings will appear here once guests start reserving your listings.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden">
            <div className="divide-y divide-[#F0F0F0]">
              {bookings.map((booking: any, i: number) => {
                const config = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG];
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-5 px-6 py-5 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={(booking.guest as any)?.avatar_url} />
                      <AvatarFallback className="bg-[#F0F0F0] text-[#222222] font-semibold">
                        {(booking.guest as any) ? getInitials((booking.guest as any).name) : 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[15px] font-semibold text-[#222222]">{(booking.guest as any)?.name}</p>
                          <p className="text-[13px] text-[#717171] truncate">{(booking.listing as any)?.title}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ${config.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[13px] text-[#717171]">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(booking.check_in), 'MMM d')} – {format(new Date(booking.check_out), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1.5 text-[13px] text-[#717171]">
                          <Users className="w-3.5 h-3.5" />
                          {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[14px] font-bold text-[#222222]">{formatPrice(booking.total_amount)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
