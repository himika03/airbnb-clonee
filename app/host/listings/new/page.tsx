'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, X, Upload, Check } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { listingsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const PROPERTY_TYPES = ['entire_home', 'apartment', 'villa', 'cabin', 'treehouse', 'bungalow', 'cottage', 'castle', 'tiny_home'];
const CATEGORIES = ['beachfront', 'mountains', 'cabins', 'amazing_pools', 'treehouses', 'tropical', 'city', 'countryside', 'islands', 'lakefront', 'desert'];
const AMENITIES_LIST = ['WiFi', 'Kitchen', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Heating', 'Washer', 'Dryer', 'Workspace', 'TV', 'Gym', 'BBQ grill', 'Beach access', 'Mountain view', 'Fireplace', 'Pet friendly', 'Breakfast included'];

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  property_type: z.string().min(1, 'Select a property type'),
  category: z.string().min(1, 'Select a category'),
  location_city: z.string().min(2, 'Enter a city'),
  location_country: z.string().min(2, 'Enter a country'),
  location_address: z.string().optional(),
  price_per_night: z.coerce.number().min(10, 'Minimum price is $10'),
  cleaning_fee: z.coerce.number().min(0).optional(),
  max_guests: z.coerce.number().min(1).max(50),
  bedrooms: z.coerce.number().min(0).max(20),
  bathrooms: z.coerce.number().min(0.5).max(20),
  beds: z.coerce.number().min(1).max(30),
  thumbnail_url: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
  instant_book: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewListingPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      cleaning_fee: 0,
      instant_book: false,
    },
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const listing = await listingsApi.create({
        ...data,
        host_id: currentUser.id,
        cleaning_fee: data.cleaning_fee || 0,
        service_fee_pct: 14,
        rating: 0,
        review_count: 0,
        is_superhost_listing: currentUser.is_superhost,
        is_active: true,
        instant_book: data.instant_book || false,
        thumbnail_url: data.thumbnail_url || undefined,
        location_address: data.location_address || undefined,
      });
      toast.success('Listing created successfully!');
      router.push('/host/listings');
    } catch (err) {
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-[14px] font-medium text-[#222222] hover:underline mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-[28px] font-bold text-[#222222] mb-2">Create a new listing</h1>
        <p className="text-[#717171] text-[15px] mb-8">Fill in the details about your property.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < step ? 'bg-[#222222]' : 'bg-[#EBEBEB]'}`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-[20px] font-semibold text-[#222222]">Basic information</h2>

              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Listing title <span className="text-[#FF385C]">*</span></label>
                <Input
                  {...register('title')}
                  placeholder="Cozy beachfront villa with ocean views..."
                  className="rounded-xl border-[#DDDDDD] h-12 text-[15px] focus:border-[#222222]"
                />
                {errors.title && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Description <span className="text-[#FF385C]">*</span></label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe your space, what makes it unique, nearby attractions..."
                  className="rounded-xl border-[#DDDDDD] min-h-[140px] text-[15px] focus:border-[#222222] resize-none"
                />
                {errors.description && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Property type <span className="text-[#FF385C]">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('property_type', type)}
                      className={`px-3 py-3 rounded-xl border text-[13px] font-medium capitalize text-center transition-all ${
                        watch('property_type') === type
                          ? 'border-[#222222] bg-[#F7F7F7] text-[#222222]'
                          : 'border-[#DDDDDD] text-[#717171] hover:border-[#717171]'
                      }`}
                    >
                      {type.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
                {errors.property_type && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.property_type.message}</p>}
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Category <span className="text-[#FF385C]">*</span></label>
                <select
                  {...register('category')}
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 h-12 text-[15px] text-[#222222] focus:outline-none focus:border-[#222222] bg-white"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                {errors.category && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.category.message}</p>}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-[#222222] text-white hover:bg-black rounded-xl px-8 py-3 text-[15px] font-semibold"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location + details */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-[20px] font-semibold text-[#222222]">Location & details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">City <span className="text-[#FF385C]">*</span></label>
                  <Input {...register('location_city')} placeholder="Paris" className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
                  {errors.location_city && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.location_city.message}</p>}
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Country <span className="text-[#FF385C]">*</span></label>
                  <Input {...register('location_country')} placeholder="France" className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
                  {errors.location_country && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.location_country.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Street address</label>
                <Input {...register('location_address')} placeholder="123 Rue de Rivoli" className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Max guests <span className="text-[#FF385C]">*</span></label>
                  <Input type="number" {...register('max_guests')} min={1} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Beds <span className="text-[#FF385C]">*</span></label>
                  <Input type="number" {...register('beds')} min={1} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Bedrooms <span className="text-[#FF385C]">*</span></label>
                  <Input type="number" {...register('bedrooms')} min={0} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Bathrooms <span className="text-[#FF385C]">*</span></label>
                  <Input type="number" {...register('bathrooms')} min={0.5} step={0.5} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-xl px-8 py-3 border-[#DDDDDD]">Back</Button>
                <Button type="button" onClick={() => setStep(3)} className="bg-[#222222] text-white hover:bg-black rounded-xl px-8 py-3 text-[15px] font-semibold">Next</Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Pricing + amenities */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-[20px] font-semibold text-[#222222]">Pricing & amenities</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Price per night ($) <span className="text-[#FF385C]">*</span></label>
                  <Input type="number" {...register('price_per_night')} min={10} placeholder="150" className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
                  {errors.price_per_night && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.price_per_night.message}</p>}
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Cleaning fee ($)</label>
                  <Input type="number" {...register('cleaning_fee')} min={0} placeholder="50" className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Cover photo URL</label>
                <Input
                  {...register('thumbnail_url')}
                  placeholder="https://images.pexels.com/photos/..."
                  className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]"
                />
                {errors.thumbnail_url && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.thumbnail_url.message}</p>}
                {watch('thumbnail_url') && (
                  <div className="mt-3 rounded-xl overflow-hidden h-40">
                    <img
                      src={watch('thumbnail_url')}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-3">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITIES_LIST.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-medium text-left transition-all ${
                        selectedAmenities.includes(amenity)
                          ? 'border-[#222222] bg-[#F7F7F7] text-[#222222]'
                          : 'border-[#DDDDDD] text-[#717171] hover:border-[#717171]'
                      }`}
                    >
                      {selectedAmenities.includes(amenity) && <Check className="w-3.5 h-3.5 text-[#222222]" />}
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-xl">
                <div>
                  <p className="text-[14px] font-semibold text-[#222222]">Instant Book</p>
                  <p className="text-[12px] text-[#717171]">Guests can book without waiting for approval</p>
                </div>
                <div
                  onClick={() => setValue('instant_book', !watch('instant_book'))}
                  className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                    watch('instant_book') ? 'bg-[#222222]' : 'bg-[#DDDDDD]'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    watch('instant_book') ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-xl px-8 py-3 border-[#DDDDDD]">Back</Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FF385C] text-white hover:bg-[#E31C5F] rounded-xl px-8 py-3 text-[15px] font-semibold disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create listing'}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}
