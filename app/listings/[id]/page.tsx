'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, Share2, ChevronLeft, Award, Shield, Zap, Wifi, Waves, Car,
  Utensils, Wind, Flame, Shirt, Laptop, Tv, Dumbbell, X, Users, Home,
  BedDouble, Bath, MapPin, Calendar, ChevronRight, Check
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { listingsApi, reviewsApi, bookingsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatPrice, formatDate, calculateTotalPrice, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import 'react-day-picker/dist/style.css';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-5 h-5" />,
  'Kitchen': <Utensils className="w-5 h-5" />,
  'Free parking': <Car className="w-5 h-5" />,
  'Pool': <Waves className="w-5 h-5" />,
  'Air conditioning': <Wind className="w-5 h-5" />,
  'Washer': <Shirt className="w-5 h-5" />,
  'Workspace': <Laptop className="w-5 h-5" />,
  'TV': <Tv className="w-5 h-5" />,
  'Gym': <Dumbbell className="w-5 h-5" />,
  'Fireplace': <Flame className="w-5 h-5" />,
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, toggleWishlist, isWishlisted, addRecentlyViewed } = useAppStore();
  const listingId = params.id as string;
  const wishlisted = isWishlisted(listingId);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [guestCount, setGuestCount] = useState(1);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const result = await listingsApi.getById(listingId);
      if (result) addRecentlyViewed(listingId);
      return result;
    },
    enabled: !!listingId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', listingId],
    queryFn: () => reviewsApi.getByListingId(listingId),
    enabled: !!listingId,
  });

  if (isLoading) return <ListingDetailSkeleton />;
  if (!listing) return <div className="min-h-screen flex items-center justify-center"><p>Listing not found</p></div>;

  const images = listing.images?.length
    ? listing.images.sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => i.url)
    : [listing.thumbnail_url || 'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=1200'];

  const nights = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const pricing = nights > 0 ? calculateTotalPrice(listing.price_per_night, nights, listing.cleaning_fee) : null;

  const handleBook = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (!currentUser) {
      toast.error('Please sign in to book');
      return;
    }

    setBooking(true);
    try {
      await bookingsApi.create({
        listing_id: listing.id,
        guest_id: currentUser.id,
        host_id: listing.host_id,
        check_in: format(dateRange.from, 'yyyy-MM-dd'),
        check_out: format(dateRange.to, 'yyyy-MM-dd'),
        guests: guestCount,
        price_per_night: listing.price_per_night,
        cleaning_fee: listing.cleaning_fee || 0,
        service_fee: pricing?.serviceFee || 0,
        taxes: pricing?.taxes || 0,
        total_amount: pricing?.total || 0,
        status: 'confirmed',
      });
      setBooked(true);
      toast.success('Booking confirmed! Check your trips page.');
    } catch (err) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6">
        {/* Back + breadcrumb */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[14px] font-medium text-[#222222] hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title */}
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-[26px] font-bold text-[#222222] leading-tight">{listing.title}</h1>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <button
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#222222] underline hover:text-[#717171] transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => toggleWishlist(listing.id)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#222222] underline hover:text-[#717171] transition-colors"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#FF385C] stroke-[#FF385C]' : ''}`} />
              {wishlisted ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Rating + location */}
        <div className="flex items-center gap-3 text-[14px] mb-6 flex-wrap">
          {listing.rating > 0 && (
            <span className="flex items-center gap-1 font-semibold text-[#222222]">
              <Star className="w-3.5 h-3.5 fill-[#222222] stroke-[#222222]" />
              {listing.rating.toFixed(2)}
              <span className="font-normal text-[#717171]">({listing.review_count} reviews)</span>
            </span>
          )}
          {listing.is_superhost_listing && (
            <>
              <span className="text-[#717171]">·</span>
              <span className="flex items-center gap-1 text-[#222222]">
                <Award className="w-3.5 h-3.5" />
                Superhost
              </span>
            </>
          )}
          <span className="text-[#717171]">·</span>
          <span className="flex items-center gap-1 text-[#717171] underline cursor-pointer">
            <MapPin className="w-3.5 h-3.5" />
            {listing.location_city}, {listing.location_country}
          </span>
        </div>

        {/* Photo gallery */}
        <div className="relative rounded-2xl overflow-hidden mb-10 cursor-pointer" onClick={() => setGalleryOpen(true)}>
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px]">
            <div className="col-span-2 row-span-2 overflow-hidden">
              <img
                src={images[0]}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {images.slice(1, 5).map((img: string, i: number) => (
              <div key={i} className="overflow-hidden">
                <img
                  src={img}
                  alt={`${listing.title} ${i + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setGalleryOpen(true)}
            className="absolute bottom-4 right-4 bg-white border border-[#222222] rounded-lg px-4 py-2 text-[13px] font-semibold text-[#222222] hover:bg-[#F7F7F7] transition-colors"
          >
            Show all photos
          </button>
        </div>

        {/* Content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Left column */}
          <div>
            {/* Host info */}
            <div className="flex items-center justify-between pb-6 border-b border-[#DDDDDD]">
              <div>
                <h2 className="text-[22px] font-semibold text-[#222222]">
                  {listing.property_type.replace(/_/g, ' ')} hosted by {listing.host?.name}
                </h2>
                <p className="text-[16px] text-[#717171] mt-1">
                  {listing.max_guests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''} · {listing.beds} bed{listing.beds !== 1 ? 's' : ''} · {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
                </p>
              </div>
              <Avatar className="w-14 h-14 border-2 border-white shadow-md flex-shrink-0">
                <AvatarImage src={listing.host?.avatar_url} />
                <AvatarFallback className="bg-[#222222] text-white font-semibold">
                  {listing.host ? getInitials(listing.host.name) : 'H'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Feature badges */}
            <div className="py-6 border-b border-[#DDDDDD] space-y-5">
              {listing.is_superhost_listing && (
                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[16px] font-semibold text-[#222222]">{listing.host?.name} is a Superhost</p>
                    <p className="text-[14px] text-[#717171]">Superhosts are experienced, highly rated hosts.</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[16px] font-semibold text-[#222222]">Great location</p>
                  <p className="text-[14px] text-[#717171]">Recent guests rated this property's location highly.</p>
                </div>
              </div>
              {listing.instant_book && (
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[16px] font-semibold text-[#222222]">Instant Book</p>
                    <p className="text-[14px] text-[#717171]">Book instantly without waiting for host approval.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="py-6 border-b border-[#DDDDDD]">
              <p className="text-[16px] text-[#222222] leading-relaxed">{listing.description}</p>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="py-6 border-b border-[#DDDDDD]">
                <h3 className="text-[22px] font-semibold text-[#222222] mb-5">What this place offers</h3>
                <div className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((amenity: any) => (
                    <div key={amenity.id} className="flex items-center gap-3 py-2">
                      <span className="text-[#222222]">{AMENITY_ICONS[amenity.name] || <Check className="w-5 h-5" />}</span>
                      <span className="text-[16px] text-[#222222]">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar */}
            <div className="py-6 border-b border-[#DDDDDD]">
              <h3 className="text-[22px] font-semibold text-[#222222] mb-2">Select check-in date</h3>
              <p className="text-[15px] text-[#717171] mb-5">Add your travel dates for exact pricing</p>
              <DayPicker
                mode="range"
                selected={dateRange as any}
                onSelect={(range: any) => setDateRange(range || {})}
                disabled={{ before: new Date() }}
                numberOfMonths={2}
                styles={{ root: { fontFamily: 'Plus Jakarta Sans, sans-serif' } }}
              />
            </div>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="py-6 border-b border-[#DDDDDD]">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 fill-[#222222] stroke-[#222222]" />
                  <span className="text-[22px] font-semibold text-[#222222]">
                    {listing.rating.toFixed(2)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {reviews.slice(0, 6).map((review: any) => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.author?.avatar_url} />
                          <AvatarFallback className="bg-[#F0F0F0] text-[#222222] text-sm font-semibold">
                            {review.author ? getInitials(review.author.name) : 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[14px] font-semibold text-[#222222]">{review.author?.name}</p>
                          <p className="text-[12px] text-[#717171]">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <p className="text-[14px] text-[#222222] leading-relaxed line-clamp-4">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Host profile */}
            <div className="py-6 border-b border-[#DDDDDD]">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={listing.host?.avatar_url} />
                    <AvatarFallback className="bg-[#222222] text-white font-semibold">
                      {listing.host ? getInitials(listing.host.name) : 'H'}
                    </AvatarFallback>
                  </Avatar>
                  {listing.host?.is_superhost && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF385C] rounded-full flex items-center justify-center">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#222222]">Hosted by {listing.host?.name}</h3>
                  <p className="text-[14px] text-[#717171]">
                    Joined {listing.host?.joined_at ? format(new Date(listing.host.joined_at), 'MMMM yyyy') : 'recently'}
                  </p>
                </div>
              </div>
              {listing.host?.bio && (
                <p className="text-[15px] text-[#222222] leading-relaxed mb-4">{listing.host.bio}</p>
              )}
              <div className="flex gap-6">
                {listing.host?.is_superhost && (
                  <div className="flex items-center gap-2 text-[14px] text-[#222222]">
                    <Award className="w-4 h-4" />
                    Superhost
                  </div>
                )}
                {listing.host?.is_verified && (
                  <div className="flex items-center gap-2 text-[14px] text-[#222222]">
                    <Shield className="w-4 h-4" />
                    Identity verified
                  </div>
                )}
              </div>
            </div>

            {/* House rules */}
            <div className="py-6">
              <h3 className="text-[22px] font-semibold text-[#222222] mb-5">Things to know</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-[16px] text-[#222222] mb-3">House rules</h4>
                  <ul className="space-y-2 text-[14px] text-[#222222]">
                    <li>Check-in: After 3:00 PM</li>
                    <li>Checkout: Before 11:00 AM</li>
                    <li>No smoking</li>
                    <li>No pets allowed</li>
                    <li>No parties or events</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[16px] text-[#222222] mb-3">Safety & property</h4>
                  <ul className="space-y-2 text-[14px] text-[#222222]">
                    <li>Carbon monoxide alarm</li>
                    <li>Smoke alarm</li>
                    <li>No security camera on property</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[16px] text-[#222222] mb-3">Cancellation policy</h4>
                  <p className="text-[14px] text-[#222222]">
                    Free cancellation before 48 hours. After that, non-refundable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking widget (sticky) */}
          <div className="lg:col-start-2">
            <div className="sticky top-28">
              <div className="border border-[#DDDDDD] rounded-2xl p-6 shadow-xl">
                {booked ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-[#00A699] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-[20px] font-bold text-[#222222] mb-2">Booking confirmed!</h3>
                    <p className="text-[14px] text-[#717171] mb-4">Check your Trips page for details.</p>
                    <Link
                      href="/trips"
                      className="block w-full py-3 bg-[#FF385C] text-white text-center rounded-xl font-semibold hover:bg-[#E31C5F] transition-colors"
                    >
                      View your trips
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-[22px] font-bold text-[#222222]">{formatPrice(listing.price_per_night)}</span>
                      <span className="text-[16px] text-[#222222]">night</span>
                    </div>

                    {/* Date picker */}
                    <div className="border border-[#DDDDDD] rounded-xl overflow-hidden mb-3">
                      <div className="grid grid-cols-2 divide-x divide-[#DDDDDD]">
                        <div
                          onClick={() => {}}
                          className="p-3 cursor-pointer hover:bg-[#F7F7F7] transition-colors"
                        >
                          <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide">Check-in</p>
                          <p className="text-[13px] text-[#717171]">
                            {dateRange.from ? format(dateRange.from, 'MM/dd/yyyy') : 'Add date'}
                          </p>
                        </div>
                        <div className="p-3 cursor-pointer hover:bg-[#F7F7F7] transition-colors">
                          <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide">Checkout</p>
                          <p className="text-[13px] text-[#717171]">
                            {dateRange.to ? format(dateRange.to, 'MM/dd/yyyy') : 'Add date'}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-[#DDDDDD] p-3">
                        <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Guests</p>
                        <select
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="w-full text-[13px] text-[#222222] focus:outline-none bg-transparent"
                        >
                          {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleBook}
                      disabled={booking}
                      className="w-full py-3.5 bg-gradient-to-r from-[#E61E4D] to-[#E31C5F] text-white rounded-xl font-semibold text-[16px] hover:from-[#D70466] hover:to-[#BD1E59] transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                    >
                      {booking ? 'Booking...' : nights > 0 ? 'Reserve' : 'Check availability'}
                    </button>

                    <p className="text-center text-[13px] text-[#717171] mt-2">You won't be charged yet</p>

                    {/* Price breakdown */}
                    {nights > 0 && pricing && (
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between text-[15px] text-[#222222]">
                          <span className="underline">{formatPrice(listing.price_per_night)} × {nights} nights</span>
                          <span>{formatPrice(pricing.subtotal)}</span>
                        </div>
                        {pricing.cleaningFee > 0 && (
                          <div className="flex justify-between text-[15px] text-[#222222]">
                            <span className="underline">Cleaning fee</span>
                            <span>{formatPrice(pricing.cleaningFee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[15px] text-[#222222]">
                          <span className="underline">StayScape service fee</span>
                          <span>{formatPrice(pricing.serviceFee)}</span>
                        </div>
                        <div className="flex justify-between text-[15px] text-[#222222]">
                          <span className="underline">Taxes</span>
                          <span>{formatPrice(pricing.taxes)}</span>
                        </div>
                        <div className="flex justify-between text-[16px] font-bold text-[#222222] pt-3 border-t border-[#DDDDDD]">
                          <span>Total</span>
                          <span>{formatPrice(pricing.total)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Report */}
              <p className="text-center text-[13px] text-[#717171] mt-4 underline cursor-pointer hover:text-[#222222] transition-colors">
                Report this listing
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Full gallery modal */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 text-white">
              <button onClick={() => setGalleryOpen(false)} className="hover:bg-white/20 rounded-full p-2 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <span className="text-[14px] font-medium">{galleryIndex + 1} / {images.length}</span>
              <div className="w-10" />
            </div>
            <div className="flex-1 flex items-center justify-center relative px-4">
              <button
                onClick={() => setGalleryIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <motion.img
                key={galleryIndex}
                src={images[galleryIndex]}
                alt={`Photo ${galleryIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
              <button
                onClick={() => setGalleryIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="absolute right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto justify-center">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-opacity ${i === galleryIndex ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-75'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 animate-pulse">
        <div className="h-8 bg-[#EBEBEB] rounded-full w-48 mb-4" />
        <div className="h-6 bg-[#EBEBEB] rounded-full w-3/4 mb-2" />
        <div className="h-4 bg-[#EBEBEB] rounded-full w-1/2 mb-6" />
        <div className="h-[420px] bg-[#EBEBEB] rounded-2xl mb-10" />
      </div>
    </div>
  );
}