import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with the provisioned named database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on app startup
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, local storage fallback active.');
    }
  }
}

// Test connection on startup
testConnection();

/**
 * Sign in using Google Auth popup
 */
export async function signInWithGoogle(): Promise<User> {
  await setPersistence(auth, browserLocalPersistence);
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
  }
}

/**
 * Subscribe to Auth State
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ================= Firestore Sync Helpers =================

export interface SyncBookmark {
  id: string;
  userId: string;
  verseKey: string;
  surahNameBn: string;
  ayahNumber: number;
  addedAt: string;
}

export interface SyncUserProfile {
  userId: string;
  displayName?: string;
  theme?: string;
  arabicFontSize?: number;
  banglaFontSize?: number;
  selectedReciterId?: string;
  currentLanguage?: string;
  selectedDistrict?: string;
  lastRead?: {
    surahId: number;
    ayahNumber: number;
    surahNameBn: string;
  };
}

/**
 * Save user profile and settings to Firestore
 */
export async function saveUserProfile(userId: string, profile: Partial<SyncUserProfile>) {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), { userId, ...profile }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to user profile changes
 */
export function subscribeToUserProfile(userId: string, callback: (data: SyncUserProfile | null) => void) {
  const path = `users/${userId}`;
  return onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as SyncUserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Save bookmark to Firestore
 */
export async function saveBookmarkToFirestore(userId: string, bookmark: SyncBookmark) {
  const path = `users/${userId}/bookmarks/${bookmark.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'bookmarks', bookmark.id), bookmark);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete bookmark from Firestore
 */
export async function deleteBookmarkFromFirestore(userId: string, bookmarkId: string) {
  const path = `users/${userId}/bookmarks/${bookmarkId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'bookmarks', bookmarkId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to user bookmarks
 */
export function subscribeToBookmarks(userId: string, callback: (bookmarks: SyncBookmark[]) => void) {
  const path = `users/${userId}/bookmarks`;
  const q = query(collection(db, 'users', userId, 'bookmarks'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: SyncBookmark[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SyncBookmark);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Save dhikr progress to Firestore
 */
export async function saveDhikrProgress(
  userId: string,
  dhikrId: number,
  count: number,
  target: number,
  completed: boolean
) {
  const docId = `dhikr_${dhikrId}`;
  const path = `users/${userId}/dhikr_progress/${docId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'dhikr_progress', docId), {
      id: docId,
      userId,
      dhikrId,
      count,
      target,
      completed,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
