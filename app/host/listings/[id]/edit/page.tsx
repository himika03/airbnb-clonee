'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Check } from 'lucide-react';
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

const schema = z.object({
  title: z.string().min(10),
  description: z.string().min(20),
  property_type: z.string().min(1),
  category: z.string().min(1),
  location_city: z.string().min(2),
  location_country: z.string().min(2),
  location_address: z.string().optional(),
  price_per_night: z.coerce.number().min(10),
  cleaning_fee: z.coerce.number().min(0).optional(),
  max_guests: z.coerce.number().min(1),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0.5),
  beds: z.coerce.number().min(1),
  thumbnail_url: z.string().optional(),
  instant_book: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const listingId = params.id as string;

  const { data: listing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => listingsApi.getById(listingId),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title,
        description: listing.description,
        property_type: listing.property_type,
        category: listing.category,
        location_city: listing.location_city,
        location_country: listing.location_country,
        location_address: listing.location_address || '',
        price_per_night: listing.price_per_night,
        cleaning_fee: listing.cleaning_fee,
        max_guests: listing.max_guests,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        beds: listing.beds,
        thumbnail_url: listing.thumbnail_url || '',
        instant_book: listing.instant_book,
      });
    }
  }, [listing, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => listingsApi.update(listingId, { ...data, updated_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      toast.success('Listing updated!');
      router.push('/host/listings');
    },
    onError: () => toast.error('Update failed'),
  });

  if (!listing) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#FF385C] border-t-transparent rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-[14px] font-medium text-[#222222] hover:underline mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-[28px] font-bold text-[#222222] mb-8">Edit listing</h1>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <div>
            <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Title</label>
            <Input {...register('title')} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
            {errors.title && <p className="text-[#E31C5F] text-[12px] mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Description</label>
            <Textarea {...register('description')} className="rounded-xl border-[#DDDDDD] min-h-[120px] focus:border-[#222222] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Property type</label>
              <select {...register('property_type')} className="w-full border border-[#DDDDDD] rounded-xl px-4 h-12 text-[14px] text-[#222222] focus:outline-none focus:border-[#222222] bg-white">
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Category</label>
              <select {...register('category')} className="w-full border border-[#DDDDDD] rounded-xl px-4 h-12 text-[14px] text-[#222222] focus:outline-none focus:border-[#222222] bg-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">City</label>
              <Input {...register('location_city')} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Country</label>
              <Input {...register('location_country')} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Price/night ($)</label>
              <Input type="number" {...register('price_per_night')} min={10} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Cleaning fee ($)</label>
              <Input type="number" {...register('cleaning_fee')} min={0} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {['max_guests', 'bedrooms', 'bathrooms', 'beds'].map((field) => (
              <div key={field}>
                <label className="block text-[13px] font-semibold text-[#222222] mb-1.5 capitalize">{field.replace('_', ' ')}</label>
                <Input type="number" {...register(field as any)} min={0} step={field === 'bathrooms' ? 0.5 : 1} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Cover photo URL</label>
            <Input {...register('thumbnail_url')} className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]" />
            {watch('thumbnail_url') && (
              <div className="mt-3 rounded-xl overflow-hidden h-40">
                <img src={watch('thumbnail_url')} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl border-[#DDDDDD] px-6">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-[#FF385C] text-white hover:bg-[#E31C5F] rounded-xl px-8 disabled:opacity-60">
              {mutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
