const ACCOUNT_KEY = 'mushaf_offline_note_accounts_v1';
const ACTIVE_KEY = 'mushaf_offline_note_user_v1';
const ITERATIONS = 310000;

type AccountRecord = { username: string; salt: string; verifier: string; createdAt: string };

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

function readAccounts(): AccountRecord[] {
  try {
    const value = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function makeVerifier(key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode('AL-QURAN-OFFLINE-NOTES-ACCOUNT'));
  return JSON.stringify({ iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(encrypted)) });
}

async function verifyKey(key: CryptoKey, verifier: string): Promise<boolean> {
  try {
    const value = JSON.parse(verifier);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(value.iv) }, key, base64ToBytes(value.data));
    return new TextDecoder().decode(decrypted) === 'AL-QURAN-OFFLINE-NOTES-ACCOUNT';
  } catch { return false; }
}

export function getOfflineNoteUser(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export async function createOfflineNoteAccount(usernameInput: string, password: string): Promise<void> {
  if (!crypto?.subtle) throw new Error('এই ডিভাইসে নিরাপদ পাসওয়ার্ড এনক্রিপশন সমর্থিত নয়।');
  const username = usernameInput.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,24}$/.test(username)) throw new Error('ইউজারনেম ৩–২৪ অক্ষর; ইংরেজি অক্ষর, সংখ্যা, dot, _ বা - ব্যবহার করুন।');
  if (password.length < 8) throw new Error('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
  const accounts = readAccounts();
  if (accounts.some((item) => item.username === username)) throw new Error('এই ইউজারনেমে অ্যাকাউন্ট আছে। লগইন করুন।');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  accounts.push({ username, salt: bytesToBase64(salt), verifier: await makeVerifier(key), createdAt: new Date().toISOString() });
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
  localStorage.setItem(ACTIVE_KEY, username);
  window.dispatchEvent(new Event('mushaf-offline-note-account-change'));
}

export async function loginOfflineNoteAccount(usernameInput: string, password: string): Promise<void> {
  const username = usernameInput.trim().toLowerCase();
  const account = readAccounts().find((item) => item.username === username);
  if (!account) throw new Error('এই ডিভাইসে অ্যাকাউন্ট পাওয়া যায়নি। আগে অ্যাকাউন্ট তৈরি করুন।');
  const key = await deriveKey(password, base64ToBytes(account.salt));
  if (!(await verifyKey(key, account.verifier))) throw new Error('ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।');
  localStorage.setItem(ACTIVE_KEY, username);
  window.dispatchEvent(new Event('mushaf-offline-note-account-change'));
}

export function logoutOfflineNoteAccount(): void {
  localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new Event('mushaf-offline-note-account-change'));
}

export function listOfflineNoteAccounts(): string[] {
  return readAccounts().map((item) => item.username);
}
