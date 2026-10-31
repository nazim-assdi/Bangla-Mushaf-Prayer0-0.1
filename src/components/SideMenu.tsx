import React from 'react';
import {
  X, UserRoundPlus, Heart, MapPin, Bell, Clock3, Languages, Settings,
  Star, Share2, MessageCircle, MessageSquare, BarChart3, Search,
  Compass, Sparkles, Bookmark, BookOpen, CalendarDays
} from 'lucide-react';

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

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen, onClose, onSearch, onSettings, onPrayer, onQibla,
  onDhikr, onBookmarks, onGoToAyah
}) => {
  if (!isOpen) return null;

  const shareApp = async () => {
    const shareData = {
      title: 'Al-Quran Al-Kareem',
      text: 'কুরআন পড়ুন, বুঝুন ও আমল করুন।',
      url: window.location.origin
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) await navigator.clipboard.writeText(shareData.url);
    } catch (error) {
      console.warn('Share was cancelled or unavailable:', error);
    }
  };

  const openWhatsApp = (message: string) => {
    window.open('https://wa.me/8801602859957?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    onClose();
  };

  const jumpToDonation = () => {
    onClose();
    window.setTimeout(() => document.getElementById('donation-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
  };

  const items = [
    { label: 'সদস্য হন', icon: UserRoundPlus, action: () => { onClose(); document.querySelector<HTMLButtonElement>('[aria-label*="সাইন"], [aria-label*="Sign"], button[title*="Sign"]')?.click(); } },
    { label: 'Donate করুন', icon: Heart, action: jumpToDonation },
    { label: 'নির্দিষ্ট আয়াতে যান', icon: MapPin, action: onGoToAyah },
    { label: 'Notification', icon: Bell, action: () => { onClose(); window.dispatchEvent(new CustomEvent('mushaf:open-notifications')); } },
    { label: 'সালাতের সময়সূচি', icon: Clock3, action: onPrayer },
    { label: 'আরবি অভিধান', icon: Languages, action: () => { onClose(); window.dispatchEvent(new CustomEvent('mushaf:open-dictionary')); } },
    { label: 'Settings', icon: Settings, action: onSettings },
    { label: 'App Rating', icon: Star, action: () => { window.open('https://play.google.com/store/search?q=Al-Quran%20Al-Kareem&c=apps', '_blank', 'noopener,noreferrer'); onClose(); } },
    { label: 'App Share', icon: Share2, action: shareApp },
    { label: 'আমাদের সাথে কথা বলুন', icon: MessageCircle, action: () => openWhatsApp('আসসালামু আলাইকুম। Al-Quran Al-Kareem অ্যাপ সম্পর্কে কথা বলতে চাই।') },
    { label: 'Feedback', icon: MessageSquare, action: () => openWhatsApp('আসসালামু আলাইকুম। Al-Quran Al-Kareem অ্যাপ সম্পর্কে আমার মতামত: ') },
    { label: 'Share পরিসংখ্যান', icon: BarChart3, action: onBookmarks },
    { label: 'Search', icon: Search, action: onSearch },
    { label: 'Qibla', icon: Compass, action: onQibla },
    { label: 'Adhkar', icon: Sparkles, action: onDhikr },
    { label: 'Planner', icon: CalendarDays, action: () => { onClose(); window.dispatchEvent(new CustomEvent('mushaf:open-planner')); } },
    { label: 'Library', icon: BookOpen, action: onBookmarks }
  ];

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="অ্যাপ মেনু">
      <button className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} aria-label="মেনু বন্ধ করুন" />
      <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col border-l border-amber-300/20 bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-950 text-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-[10px] tracking-[0.22em] text-amber-300">AL-QURAN AL-KAREEM</p>
            <h2 className="mt-1 text-xl font-bold">মেনু</h2>
            <p className="mt-1 text-xs text-emerald-100/70">পড়ুন · বুঝুন · আমল করুন</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-white/15 bg-white/10 p-2 hover:bg-white/20" aria-label="বন্ধ করুন"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map(({ label, icon: Icon, action }, index) => (
            <button key={label} onClick={action} className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-emerald-50 transition hover:bg-white/10 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200/15 bg-emerald-800/80 text-amber-300 group-hover:bg-amber-300 group-hover:text-emerald-950"><Icon className="h-4 w-4" /></span>
              <span className="flex-1">{label}</span>
              <span className="text-xs text-emerald-300/40">{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-center text-[10px] text-emerald-100/50">Made with care for the Qur’an reader</div>
      </aside>
    </div>
  );
};
