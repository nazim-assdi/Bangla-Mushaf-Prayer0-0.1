import React from 'react';
import { X, UserRoundPlus, Heart, LocateFixed, Bell, Clock3, Languages, Settings, Star, Share2, MessageCircle, MessageSquare, BarChart3, Search, Compass, BookOpen, MoonStar } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  onSettings: () => void;
  onPrayer: () => void;
  onQibla: () => void;
  onDhikr: () => void;
  onBookmarks: () => void;
  onGoToAyah: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onSearch, onSettings, onPrayer, onQibla, onDhikr, onBookmarks, onGoToAyah }) => {
  const items = [
    { label: 'সদস্য হন / Sign in', icon: UserRoundPlus, action: () => { onClose(); document.querySelector<HTMLButtonElement>('[aria-label*="অ্যাকাউন্ট"], [aria-label*="Sign"]')?.click(); } },
    { label: 'দান করুন', icon: Heart, action: () => { onClose(); document.getElementById('donation-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } },
    { label: 'নির্দিষ্ট আয়াতে যান', icon: LocateFixed, action: onGoToAyah },
    { label: 'নোটিফিকেশন', icon: Bell, action: () => { onClose(); window.dispatchEvent(new CustomEvent('mushaf:notifications')); } },
    { label: 'সালাতের সময়সূচি', icon: Clock3, action: onPrayer },
    { label: 'আরবি অভিধান', icon: Languages, action: () => { onClose(); window.dispatchEvent(new CustomEvent('mushaf:dictionary')); } },
    { label: 'সেটিংস', icon: Settings, action: onSettings },
    { label: 'অ্যাপ রেটিং', icon: Star, action: () => { onClose(); window.open('https://play.google.com/store', '_blank', 'noopener,noreferrer'); } },
    { label: 'অ্যাপ শেয়ার', icon: Share2, action: async () => { onClose(); if (navigator.share) await navigator.share({ title: 'Al-Quran Al-Kareem', url: window.location.href }); else await navigator.clipboard?.writeText(window.location.href); } },
    { label: 'আমাদের সাথে কথা বলুন', icon: MessageCircle, action: () => { onClose(); window.open('https://wa.me/8801602859957', '_blank', 'noopener,noreferrer'); } },
    { label: 'ফিডব্যাক', icon: MessageSquare, action: () => { onClose(); window.location.href = 'mailto:feedback@example.com?subject=Al-Quran%20Al-Kareem%20Feedback'; } },
    { label: 'শেয়ার পরিসংখ্যান', icon: BarChart3, action: onBookmarks },
    { label: 'সার্চ', icon: Search, action: onSearch },
    { label: 'কিবলা', icon: Compass, action: onQibla },
    { label: 'যিকির ও আদকার', icon: MoonStar, action: onDhikr },
    { label: 'কুরআন লাইব্রেরি', icon: BookOpen, action: onBookmarks },
  ];

  return (
    <>
      <div className={`fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px] transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onClose} aria-hidden="true" />
      <aside dir="rtl" className={`fixed right-0 top-0 z-[71] flex h-full w-[min(88vw,370px)] flex-col border-l border-amber-200/20 bg-gradient-to-b from-[#073f32] via-[#0b3029] to-[#10231f] text-stone-50 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!isOpen}>
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-5">
          <div><p className="font-serif text-lg font-bold text-amber-200">Al-Quran Al-Kareem</p><p className="mt-1 text-[10px] tracking-[0.2em] text-emerald-100/70">READ · REFLECT · REMEMBER</p></div>
          <button onClick={onClose} className="rounded-xl bg-white/10 p-2 hover:bg-white/20" aria-label="মেনু বন্ধ করুন"><X className="h-5 w-5" /></button>
        </div>
        <div className="mx-4 my-4 rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-300/15 to-emerald-300/5 p-4">
          <p className="text-sm font-semibold text-amber-100">আপনার কুরআন পাঠের সঙ্গী</p><p className="mt-1 text-xs leading-5 text-emerald-50/70">পড়ুন · বুঝুন · আমল করুন</p>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          {items.map(({ label, icon: Icon, action }) => <button key={label} onClick={action} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm text-emerald-50/90 transition hover:bg-white/10 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300"><Icon className="h-[18px] w-[18px] shrink-0 text-amber-300" /><span>{label}</span></button>)}
        </nav>
        <div className="border-t border-white/10 px-5 py-3 text-center text-[10px] text-emerald-100/50">Al-Quran Al-Kareem</div>
      </aside>
    </>
  );
};
