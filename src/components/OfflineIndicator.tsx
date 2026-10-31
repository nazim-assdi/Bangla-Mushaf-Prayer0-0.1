import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed top-18 right-3 z-40 animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-2 bg-stone-900/95 dark:bg-stone-800/95 text-amber-300 px-3.5 py-2 rounded-2xl shadow-xl border border-amber-500/40 text-xs font-bangla backdrop-blur-md">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <div>
            <span className="font-bold block text-white text-[11px]">সম্পূর্ণ অফলাইন মোড সক্রিয়</span>
            <span className="text-[10px] text-stone-300">কুরআন, সালাত ও আযকার অফলাইনে ব্যবহারযোগ্য</span>
          </div>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed top-18 right-3 z-40 animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-2 bg-emerald-900/95 text-white px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-500/50 text-xs font-bangla backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-semibold">ইন্টারনেট পুনঃসংযুক্ত হয়েছে</span>
        </div>
      </div>
    );
  }

  return null;
};
