/**
 * Client-side sync client for PostgreSQL Cloud SQL backend API
 */
import { User } from 'firebase/auth';

async function getAuthHeaders(user: User): Promise<HeadersInit> {
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function syncUserToCloudSQL(user: User) {
  try {
    const headers = await getAuthHeaders(user);
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Cloud SQL user sync warning:', err);
    return null;
  }
}

export async function syncSettingsToCloudSQL(
  user: User,
  settings: {
    theme?: string;
    arabicFontSize?: number;
    banglaFontSize?: number;
    selectedReciterId?: string;
    currentLanguage?: string;
    selectedDistrict?: string;
    lastReadSurahId?: number;
    lastReadAyahNumber?: number;
    lastReadSurahNameBn?: string;
  }
) {
  try {
    const headers = await getAuthHeaders(user);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers,
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Cloud SQL settings sync warning:', err);
    return null;
  }
}

export async function fetchSettingsFromCloudSQL(user: User) {
  try {
    const headers = await getAuthHeaders(user);
    const res = await fetch('/api/settings', {
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.settings || null;
  } catch (err) {
    console.warn('Cloud SQL fetch settings warning:', err);
    return null;
  }
}

export async function addBookmarkToCloudSQL(
  user: User,
  item: {
    verseKey: string;
    surahNameBn: string;
    ayahNumber: number;
    addedAt: string;
  }
) {
  try {
    const headers = await getAuthHeaders(user);
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers,
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Cloud SQL add bookmark warning:', err);
    return null;
  }
}

export async function deleteBookmarkFromCloudSQL(user: User, verseKey: string) {
  try {
    const headers = await getAuthHeaders(user);
    const res = await fetch(`/api/bookmarks/${encodeURIComponent(verseKey)}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Cloud SQL delete bookmark warning:', err);
    return null;
  }
}

export async function saveDhikrToCloudSQL(
  user: User,
  item: {
    dhikrId: number;
    count: number;
    target: number;
    completed: boolean;
  }
) {
  try {
    const headers = await getAuthHeaders(user);
    const res = await fetch('/api/dhikr', {
      method: 'POST',
      headers,
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Cloud SQL dhikr sync warning:', err);
    return null;
  }
}
