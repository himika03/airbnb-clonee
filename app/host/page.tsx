'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Home, DollarSign, Calendar, Star, TrendingUp, Plus, Users,
  ArrowRight, CheckCircle, Clock, BarChart2, Eye
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { listingsApi, bookingsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatPrice, getInitials } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HostDashboard() {
  const { currentUser } = useAppStore();

  const { data: listings } = useQuery({
    queryKey: ['host-listings', currentUser?.id],
    queryFn: () => listingsApi.getByHostId(currentUser!.id),
    enabled: !!currentUser,
  });

  const { data: bookings } = useQuery({
    queryKey: ['host-bookings', currentUser?.id],
    queryFn: () => bookingsApi.getByHostId(currentUser!.id),
    enabled: !!currentUser,
  });

  const totalRevenue = bookings?.filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum: number, b: any) => sum + b.total_amount, 0) || 0;

  const confirmedBookings = bookings?.filter((b: any) => b.status === 'confirmed').length || 0;
  const totalGuests = bookings?.reduce((sum: number, b: any) => sum + b.guests, 0) || 0;
 const avgRating =
  listings && listings.length > 0
    ? listings.reduce((sum: number, l: any) => sum + l.rating, 0) / listings.length
    : 0;

  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - 5 + i);
    const monthBookings = bookings?.filter((b: any) => {
      const d = new Date(b.created_at);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    });
    return {
      month: format(month, 'MMM'),
      revenue: monthBookings?.reduce((s: number, b: any) => s + b.total_amount, 0) || 0,
    };
  });

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-[#00A699]/10 text-[#00A699]', trend: '+12%' },
    { label: 'Active Bookings', value: confirmedBookings, icon: Calendar, color: 'bg-[#FF385C]/10 text-[#FF385C]', trend: '+3' },
    { label: 'Total Properties', value: listings?.length || 0, icon: Home, color: 'bg-blue-100 text-blue-600', trend: null },
    { label: 'Total Guests', value: totalGuests, icon: Users, color: 'bg-amber-100 text-amber-600', trend: '+5' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#222222]">
              Welcome back, {currentUser?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-[15px] text-[#717171] mt-1">Here's what's happening with your properties.</p>
          </div>
          <Link
            href="/host/listings/new"
            className="flex items-center gap-2 bg-[#FF385C] text-white rounded-xl px-5 py-3 text-[14px] font-semibold hover:bg-[#E31C5F] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#EBEBEB]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {stat.trend && (
                    <span className="text-[12px] font-semibold text-[#00A699] bg-[#00A699]/10 px-2 py-0.5 rounded-full">
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-[26px] font-bold text-[#222222]">{stat.value}</p>
                <p className="text-[13px] text-[#717171] mt-0.5">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#EBEBEB]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-semibold text-[#222222]">Revenue overview</h2>
              <div className="flex items-center gap-1.5 text-[13px] text-[#00A699] font-medium">
                <TrendingUp className="w-4 h-4" />
                Last 6 months
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717171' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717171' }} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip
                  formatter={(v: number) => [formatPrice(v), 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #DDDDDD', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#FF385C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#EBEBEB]"
          >
            <h2 className="text-[18px] font-semibold text-[#222222] mb-5">Performance</h2>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[#717171]">Avg. Rating</span>
                  <span className="font-semibold text-[#222222]">{avgRating.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFB400] rounded-full" style={{ width: `${(avgRating / 5) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[#717171]">Occupancy Rate</span>
                  <span className="font-semibold text-[#222222]">{Math.min(85, confirmedBookings * 15)}%</span>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00A699] rounded-full" style={{ width: `${Math.min(85, confirmedBookings * 15)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[#717171]">Response Rate</span>
                  <span className="font-semibold text-[#222222]">98%</span>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF385C] rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#F0F0F0] space-y-3">
              <Link href="/host/listings" className="flex items-center justify-between text-[14px] text-[#222222] hover:text-[#FF385C] transition-colors group">
                <span className="font-medium">Manage listings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/host/bookings" className="flex items-center justify-between text-[14px] text-[#222222] hover:text-[#FF385C] transition-colors group">
                <span className="font-medium">View bookings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Recent bookings */}
        {bookings && bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
              <h2 className="text-[18px] font-semibold text-[#222222]">Recent bookings</h2>
              <Link href="/host/bookings" className="text-[13px] font-medium text-[#FF385C] hover:underline">
                See all
              </Link>
            </div>
            <div className="divide-y divide-[#F0F0F0]">
              {bookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={(booking.guest as any)?.avatar_url} />
                    <AvatarFallback className="bg-[#F0F0F0] text-[#222222] text-sm font-semibold">
                      {(booking.guest as any) ? getInitials((booking.guest as any).name) : 'G'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#222222] truncate">
                      {(booking.guest as any)?.name || 'Guest'}
                    </p>
                    <p className="text-[13px] text-[#717171] truncate">
                      {(booking.listing as any)?.title || 'Property'} · {format(new Date(booking.check_in), 'MMM d')} – {format(new Date(booking.check_out), 'MMM d')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-semibold text-[#222222]">{formatPrice(booking.total_amount)}</p>
                    <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-[#00A699]/10 text-[#00A699]' :
                      booking.status === 'pending' ? 'bg-[#FFB400]/10 text-[#FFB400]' :
                      'bg-[#F0F0F0] text-[#717171]'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Listings preview */}
        {listings && listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
              <h2 className="text-[18px] font-semibold text-[#222222]">Your listings</h2>
              <Link href="/host/listings" className="text-[13px] font-medium text-[#FF385C] hover:underline">
                Manage all
              </Link>
            </div>
            <div className="divide-y divide-[#F0F0F0]">
              {listings.slice(0, 4).map((listing: any) => (
                <div key={listing.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
                  <div className="w-14 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0F0F0]">
                    <img
                      src={listing.thumbnail_url || ''}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#222222] truncate">{listing.title}</p>
                    <p className="text-[13px] text-[#717171] truncate">{listing.location_city}, {listing.location_country}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-semibold text-[#222222]">{formatPrice(listing.price_per_night)}/night</p>
                    {listing.rating > 0 && (
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Star className="w-3 h-3 fill-[#222222] stroke-[#222222]" />
                        <span className="text-[12px] text-[#717171]">{listing.rating.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="w-8 h-8 rounded-lg border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] transition-colors"
                    >
                      <Eye className="w-4 h-4 text-[#717171]" />
                    </Link>
                    <Link
                      href={`/host/listings/${listing.id}/edit`}
                      className="text-[12px] font-medium text-[#222222] border border-[#DDDDDD] rounded-lg px-3 py-1.5 hover:border-[#222222] transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
