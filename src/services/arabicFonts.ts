import '@fontsource/amiri/400.css';
import '@fontsource/scheherazade-new/400.css';
import '@fontsource-variable/noto-naskh-arabic';
import '@fontsource-variable/noto-sans-arabic';
import '@fontsource-variable/noto-kufi-arabic';
import '@fontsource-variable/reem-kufi';
import '@fontsource-variable/cairo';
import '@fontsource/tajawal/400.css';
import '@fontsource/lateef/400.css';
import '@fontsource/aref-ruqaa/400.css';

export interface ArabicFontOption {
  id: string;
  name: string;
  family: string;
  style: 'naskh' | 'sans' | 'kufi' | 'ruqah';
}

export const ARABIC_FONTS: ArabicFontOption[] = [
  { id: 'noto-naskh', name: 'Noto Naskh Arabic', family: '"Noto Naskh Arabic Variable"', style: 'naskh' },
  { id: 'amiri', name: 'Amiri', family: '"Amiri"', style: 'naskh' },
  { id: 'scheherazade', name: 'Scheherazade New', family: '"Scheherazade New"', style: 'naskh' },
  { id: 'lateef', name: 'Lateef', family: '"Lateef"', style: 'naskh' },
  { id: 'noto-sans', name: 'Noto Sans Arabic', family: '"Noto Sans Arabic Variable"', style: 'sans' },
  { id: 'noto-kufi', name: 'Noto Kufi Arabic', family: '"Noto Kufi Arabic Variable"', style: 'kufi' },
  { id: 'reem-kufi', name: 'Reem Kufi', family: '"Reem Kufi Variable"', style: 'kufi' },
  { id: 'cairo', name: 'Cairo', family: '"Cairo Variable"', style: 'sans' },
  { id: 'tajawal', name: 'Tajawal', family: '"Tajawal"', style: 'sans' },
  { id: 'aref-ruqaa', name: 'Aref Ruqaa', family: '"Aref Ruqaa"', style: 'ruqah' },
];
