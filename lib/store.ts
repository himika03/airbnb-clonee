import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '@/lib/supabase';

export type UserRole = 'guest' | 'host';

interface AppState {
  currentUser: Profile | null;
  role: UserRole;
  wishlistIds: string[];
  recentlyViewed: string[];
  searchParams: {
    location: string;
    checkIn: string | null;
    checkOut: string | null;
    guests: number;
  };

  setCurrentUser: (user: Profile | null) => void;
  setRole: (role: UserRole) => void;
  toggleWishlist: (listingId: string) => void;
  isWishlisted: (listingId: string) => boolean;
  addRecentlyViewed: (listingId: string) => void;
  setSearchParams: (params: Partial<AppState['searchParams']>) => void;
  switchRole: () => void;
}

const MOCK_GUEST: Profile = {
  id: '66666666-6666-6666-6666-666666666666',
  name: 'Alex Thompson',
  email: 'alex@guest.com',
  avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
  bio: 'Adventure seeker and travel enthusiast.',
  is_host: false,
  is_superhost: false,
  is_verified: false,
  joined_at: new Date('2022-01-15').toISOString(),
  created_at: new Date('2022-01-15').toISOString(),
};

const MOCK_HOST: Profile = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Sarah Mitchell',
  email: 'sarah@stayscape.com',
  avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  bio: 'Passionate about creating unique travel experiences. Superhost with 5 years of hosting.',
  is_host: true,
  is_superhost: true,
  is_verified: true,
  joined_at: new Date('2019-06-01').toISOString(),
  created_at: new Date('2019-06-01').toISOString(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: MOCK_GUEST,
      role: 'guest',
      wishlistIds: [],
      recentlyViewed: [],
      searchParams: {
        location: '',
        checkIn: null,
        checkOut: null,
        guests: 1,
      },

      setCurrentUser: (user) => set({ currentUser: user }),

      setRole: (role) => {
        const user = role === 'host' ? MOCK_HOST : MOCK_GUEST;
        set({ role, currentUser: user });
      },

      switchRole: () => {
        const { role } = get();
        const newRole = role === 'guest' ? 'host' : 'guest';
        const user = newRole === 'host' ? MOCK_HOST : MOCK_GUEST;
        set({ role: newRole, currentUser: user });
      },

      toggleWishlist: (listingId) => {
        const { wishlistIds } = get();
        if (wishlistIds.includes(listingId)) {
          set({ wishlistIds: wishlistIds.filter((id) => id !== listingId) });
        } else {
          set({ wishlistIds: [...wishlistIds, listingId] });
        }
      },

      isWishlisted: (listingId) => {
        return get().wishlistIds.includes(listingId);
      },

      addRecentlyViewed: (listingId) => {
        const { recentlyViewed } = get();
        const updated = [listingId, ...recentlyViewed.filter((id) => id !== listingId)].slice(0, 10);
        set({ recentlyViewed: updated });
      },

      setSearchParams: (params) => {
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        }));
      },
    }),
    {
      name: 'stayscape-storage',
      partialize: (state) => ({
        wishlistIds: state.wishlistIds,
        recentlyViewed: state.recentlyViewed,
        role: state.role,
        currentUser: state.currentUser,
      }),
    }
  )
);
