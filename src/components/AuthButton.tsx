import React from 'react';
import { Cloud } from 'lucide-react';

/** Cloud authentication is currently disabled; personal data remains on this device. */
export const AuthButton: React.FC = () => (
  <div
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-800/40 border border-emerald-700/40 text-xs font-bangla text-emerald-200"
    title="ক্লাউড সিঙ্ক বর্তমানে বন্ধ"
    aria-label="ক্লাউড সিঙ্ক বন্ধ"
  >
    <Cloud className="w-3.5 h-3.5" />
    <span className="hidden md:inline">অফলাইন মোড</span>
  </div>
);
