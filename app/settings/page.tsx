'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getInitials, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Shield, Star, Award, Check } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, role } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Profile updated');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-[28px] font-bold text-[#222222] mb-8">Account settings</h1>

        <div className="space-y-8">
          {/* Profile section */}
          <div className="border border-[#DDDDDD] rounded-2xl p-6">
            <h2 className="text-[18px] font-semibold text-[#222222] mb-5">Profile</h2>
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-[#222222] text-white text-2xl font-bold">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {currentUser?.is_superhost && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FF385C] rounded-full flex items-center justify-center border-2 border-white">
                    <Award className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[18px] font-semibold text-[#222222]">{currentUser?.name}</p>
                <p className="text-[14px] text-[#717171]">{currentUser?.email}</p>
                <div className="flex items-center gap-3 mt-1">
                  {currentUser?.is_verified && (
                    <span className="flex items-center gap-1 text-[12px] text-[#00A699] font-medium">
                      <Shield className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  {currentUser?.is_superhost && (
                    <span className="flex items-center gap-1 text-[12px] text-[#FF385C] font-medium">
                      <Award className="w-3.5 h-3.5" />
                      Superhost
                    </span>
                  )}
                  <span className="text-[12px] text-[#717171]">
                    {role === 'host' ? 'Host' : 'Guest'} · Joined {currentUser?.joined_at ? formatDate(currentUser.joined_at) : 'recently'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Display name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-[#DDDDDD] h-12 focus:border-[#222222]"
                />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-[#222222] mb-1.5">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell other members about yourself..."
                  className="rounded-xl border-[#DDDDDD] min-h-[100px] focus:border-[#222222] resize-none"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#222222] text-white hover:bg-black rounded-xl px-6 py-2.5 font-semibold disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>

          {/* Account mode */}
          <div className="border border-[#DDDDDD] rounded-2xl p-6">
            <h2 className="text-[18px] font-semibold text-[#222222] mb-4">Account mode</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'guest' ? 'border-[#222222] bg-[#F7F7F7]' : 'border-[#DDDDDD]'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {role === 'guest' && <Check className="w-4 h-4 text-[#222222]" />}
                  <p className="text-[15px] font-semibold text-[#222222]">Guest</p>
                </div>
                <p className="text-[13px] text-[#717171]">Explore and book stays worldwide.</p>
              </div>
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'host' ? 'border-[#222222] bg-[#F7F7F7]' : 'border-[#DDDDDD]'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {role === 'host' && <Check className="w-4 h-4 text-[#222222]" />}
                  <p className="text-[15px] font-semibold text-[#222222]">Host</p>
                </div>
                <p className="text-[13px] text-[#717171]">List and manage your properties.</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="border border-[#DDDDDD] rounded-2xl p-6">
            <h2 className="text-[18px] font-semibold text-[#222222] mb-4">Preferences</h2>
            <div className="space-y-4">
              {[
                { label: 'Email notifications', sub: 'Receive booking and trip updates via email', enabled: true },
                { label: 'SMS notifications', sub: 'Get text message alerts for bookings', enabled: false },
                { label: 'Marketing emails', sub: 'Receive tips, promotions, and inspiration', enabled: true },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[14px] font-medium text-[#222222]">{pref.label}</p>
                    <p className="text-[13px] text-[#717171]">{pref.sub}</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${pref.enabled ? 'bg-[#222222]' : 'bg-[#DDDDDD]'}`}>
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${pref.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
