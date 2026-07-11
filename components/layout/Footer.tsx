'use client';

import Link from 'next/link';
import { Home, Globe, Shield, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#DDDDDD] mt-16">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-[13px] font-semibold text-[#222222] mb-3">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'StayScape Cover', 'Safety information', 'Cancellation options', 'Report a concern'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[13px] text-[#222222] hover:underline transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[#222222] mb-3">Community</h4>
            <ul className="space-y-2">
              {['StayScape your home', 'Hosting resources', 'Community forum', 'Hosting responsibly', 'StayScape-friendly apartments'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[13px] text-[#222222] hover:underline transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[#222222] mb-3">About</h4>
            <ul className="space-y-2">
              {['Newsroom', 'Learn about new features', 'Letter from our founders', 'Careers', 'Investors'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[13px] text-[#222222] hover:underline transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DDDDDD]">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-[13px] text-[#222222]">
            <span>© 2025 StayScape, Inc.</span>
            <span className="text-[#DDDDDD] mx-2">·</span>
            <Link href="#" className="hover:underline">Privacy</Link>
            <span className="text-[#DDDDDD] mx-2">·</span>
            <Link href="#" className="hover:underline">Terms</Link>
            <span className="text-[#DDDDDD] mx-2">·</span>
            <Link href="#" className="hover:underline">Sitemap</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#222222] hover:underline">
              <Globe className="w-3.5 h-3.5" />
              English (US)
            </button>
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#222222] hover:underline">
              $ USD
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
