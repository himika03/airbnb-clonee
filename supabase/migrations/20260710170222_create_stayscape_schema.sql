
/*
# StayScape - Complete Airbnb Clone Schema

## Overview
Full relational schema for a vacation rental marketplace.

## Tables Created
1. **profiles** - Extended user profiles (name, avatar, bio, host status)
2. **listings** - Property listings with all details
3. **listing_images** - Multiple images per listing
4. **amenities** - Available amenities
5. **listing_amenities** - Many-to-many listings <-> amenities
6. **bookings** - Reservation records with status
7. **reviews** - Guest reviews for listings
8. **wishlists** - Saved/favorited listings per user
9. **availability** - Blocked dates per listing

## Security
- RLS enabled on all tables
- Public read access for listings, reviews, profiles
- Write access scoped to authenticated users
- Since this is a mock-auth app, most policies use anon + authenticated
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  is_host boolean DEFAULT false,
  is_superhost boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO anon, authenticated USING (true);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('entire_home','apartment','villa','cabin','treehouse','hotel','farm','boat','castle','tiny_home','cottage','bungalow')),
  category text NOT NULL DEFAULT 'homes',
  location_city text NOT NULL,
  location_country text NOT NULL,
  location_address text,
  latitude float,
  longitude float,
  price_per_night numeric(10,2) NOT NULL,
  cleaning_fee numeric(10,2) DEFAULT 0,
  service_fee_pct numeric(5,2) DEFAULT 14,
  max_guests integer NOT NULL DEFAULT 2,
  bedrooms integer NOT NULL DEFAULT 1,
  bathrooms numeric(3,1) NOT NULL DEFAULT 1,
  beds integer NOT NULL DEFAULT 1,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  is_superhost_listing boolean DEFAULT false,
  instant_book boolean DEFAULT false,
  is_active boolean DEFAULT true,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_select" ON listings;
CREATE POLICY "listings_select" ON listings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "listings_insert" ON listings;
CREATE POLICY "listings_insert" ON listings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "listings_update" ON listings;
CREATE POLICY "listings_update" ON listings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "listings_delete" ON listings;
CREATE POLICY "listings_delete" ON listings FOR DELETE TO anon, authenticated USING (true);

-- Listing images
CREATE TABLE IF NOT EXISTS listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_images_select" ON listing_images;
CREATE POLICY "listing_images_select" ON listing_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "listing_images_insert" ON listing_images;
CREATE POLICY "listing_images_insert" ON listing_images FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "listing_images_update" ON listing_images;
CREATE POLICY "listing_images_update" ON listing_images FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "listing_images_delete" ON listing_images;
CREATE POLICY "listing_images_delete" ON listing_images FOR DELETE TO anon, authenticated USING (true);

-- Amenities
CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text,
  category text DEFAULT 'general'
);

ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "amenities_select" ON amenities;
CREATE POLICY "amenities_select" ON amenities FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "amenities_insert" ON amenities;
CREATE POLICY "amenities_insert" ON amenities FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Listing amenities (junction)
CREATE TABLE IF NOT EXISTS listing_amenities (
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id uuid REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

ALTER TABLE listing_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_amenities_select" ON listing_amenities;
CREATE POLICY "listing_amenities_select" ON listing_amenities FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "listing_amenities_insert" ON listing_amenities;
CREATE POLICY "listing_amenities_insert" ON listing_amenities FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "listing_amenities_delete" ON listing_amenities;
CREATE POLICY "listing_amenities_delete" ON listing_amenities FOR DELETE TO anon, authenticated USING (true);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  nights integer GENERATED ALWAYS AS (check_out - check_in) STORED,
  price_per_night numeric(10,2) NOT NULL,
  cleaning_fee numeric(10,2) DEFAULT 0,
  service_fee numeric(10,2) DEFAULT 0,
  taxes numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select" ON bookings;
CREATE POLICY "bookings_select" ON bookings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "bookings_insert" ON bookings;
CREATE POLICY "bookings_insert" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_update" ON bookings;
CREATE POLICY "bookings_update" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_delete" ON bookings;
CREATE POLICY "bookings_delete" ON bookings FOR DELETE TO anon, authenticated USING (true);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness integer CHECK (cleanliness >= 1 AND cleanliness <= 5),
  communication integer CHECK (communication >= 1 AND communication <= 5),
  check_in_rating integer CHECK (check_in_rating >= 1 AND check_in_rating <= 5),
  accuracy integer CHECK (accuracy >= 1 AND accuracy <= 5),
  location_rating integer CHECK (location_rating >= 1 AND location_rating <= 5),
  value integer CHECK (value >= 1 AND value <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_update" ON reviews;
CREATE POLICY "reviews_update" ON reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY "reviews_delete" ON reviews FOR DELETE TO anon, authenticated USING (true);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlists_select" ON wishlists;
CREATE POLICY "wishlists_select" ON wishlists FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "wishlists_insert" ON wishlists;
CREATE POLICY "wishlists_insert" ON wishlists FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "wishlists_delete" ON wishlists;
CREATE POLICY "wishlists_delete" ON wishlists FOR DELETE TO anon, authenticated USING (true);

-- Availability (blocked dates)
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  reason text DEFAULT 'booked',
  UNIQUE(listing_id, blocked_date)
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "availability_select" ON availability;
CREATE POLICY "availability_select" ON availability FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "availability_insert" ON availability;
CREATE POLICY "availability_insert" ON availability FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "availability_delete" ON availability;
CREATE POLICY "availability_delete" ON availability FOR DELETE TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_host_id ON listings(host_id);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_location_city ON listings(location_city);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price_per_night);
CREATE INDEX IF NOT EXISTS idx_listings_rating ON listings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_listing_id ON availability(listing_id);
