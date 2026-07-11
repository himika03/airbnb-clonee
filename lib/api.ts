import { supabase, Listing, Booking, Review, Profile, Wishlist } from './supabase';

export const listingsApi = {
  async getAll(params?: {
    category?: string;
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    priceMin?: number;
    priceMax?: number;
    propertyType?: string;
    amenities?: string[];
    sortBy?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('listings')
      .select(`
        *,
        host:profiles!listings_host_id_fkey(id, name, avatar_url, is_superhost, is_verified),
        images:listing_images(id, url, alt, sort_order)
      `)
      .eq('is_active', true);

    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params?.location) {
      query = query.or(`location_city.ilike.%${params.location}%,location_country.ilike.%${params.location}%`);
    }
    if (params?.guests) {
      query = query.gte('max_guests', params.guests);
    }
    if (params?.priceMin !== undefined) {
      query = query.gte('price_per_night', params.priceMin);
    }
    if (params?.priceMax !== undefined) {
      query = query.lte('price_per_night', params.priceMax);
    }
    if (params?.propertyType) {
      query = query.eq('property_type', params.propertyType);
    }

    if (params?.sortBy === 'price_asc') {
      query = query.order('price_per_night', { ascending: true });
    } else if (params?.sortBy === 'price_desc') {
      query = query.order('price_per_night', { ascending: false });
    } else if (params?.sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (params?.limit) query = query.limit(params.limit);
    if (params?.offset) query = query.range(params.offset, (params.offset + (params.limit || 20)) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data as Listing[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        host:profiles!listings_host_id_fkey(id, name, avatar_url, bio, is_superhost, is_verified, joined_at),
        images:listing_images(id, url, alt, sort_order),
        amenities:listing_amenities(amenity:amenities(id, name, icon, category))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const processed = {
      ...data,
      amenities: (data.amenities as any[])?.map((la: any) => la.amenity) || [],
    };
    return processed as Listing;
  },

  async getByHostId(hostId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        images:listing_images(id, url, alt, sort_order)
      `)
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Listing[];
  },

  async create(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'host' | 'images' | 'amenities'>) {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async update(id: string, updates: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const bookingsApi = {
  async create(booking: Omit<Booking, 'id' | 'nights' | 'created_at' | 'listing' | 'guest' | 'host'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async getByGuestId(guestId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(id, title, thumbnail_url, location_city, location_country, price_per_night),
        host:profiles!bookings_host_id_fkey(id, name, avatar_url)
      `)
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Booking[];
  },

  async getByHostId(hostId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(id, title, thumbnail_url, location_city, location_country),
        guest:profiles!bookings_guest_id_fkey(id, name, avatar_url, email)
      `)
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Booking[];
  },

  async updateStatus(id: string, status: Booking['status'], reason?: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, cancellation_reason: reason, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },
};

export const reviewsApi = {
  async getByListingId(listingId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        author:profiles!reviews_author_id_fkey(id, name, avatar_url, is_verified)
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  async create(review: Omit<Review, 'id' | 'created_at' | 'author'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },
};

export const wishlistApi = {
  async toggle(userId: string, listingId: string, isWishlisted: boolean) {
    if (isWishlisted) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: userId, listing_id: listingId });
      if (error) throw error;
    }
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        listing:listings(
          id, title, thumbnail_url, location_city, location_country,
          price_per_night, rating, review_count, is_superhost_listing,
          images:listing_images(url, sort_order)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Wishlist[];
  },
};

export const profilesApi = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
  },

  async update(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },
};
