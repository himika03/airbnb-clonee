import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      listings: {
        Row: Listing;
        Insert: Omit<Listing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Listing, 'id' | 'created_at'>>;
      };
    };
  };
};

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_host: boolean;
  is_superhost: boolean;
  is_verified: boolean;
  joined_at: string;
  created_at: string;
}

export interface Listing {
  id: string;
  host_id: string;
  title: string;
  description: string;
  property_type: string;
  category: string;
  location_city: string;
  location_country: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_pct: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  rating: number;
  review_count: number;
  is_superhost_listing: boolean;
  instant_book: boolean;
  is_active: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  host?: Profile;
  images?: ListingImage[];
  amenities?: Amenity[];
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  alt?: string;
  sort_order: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  category: string;
}

export interface Booking {
  id: string;
  listing_id: string;
  guest_id: string;
  host_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  cancellation_reason?: string;
  created_at: string;
  listing?: Listing;
  guest?: Profile;
  host?: Profile;
}

export interface Review {
  id: string;
  listing_id: string;
  booking_id?: string;
  author_id: string;
  rating: number;
  cleanliness?: number;
  communication?: number;
  check_in_rating?: number;
  accuracy?: number;
  location_rating?: number;
  value?: number;
  comment: string;
  created_at: string;
  author?: Profile;
}

export interface Wishlist {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}
