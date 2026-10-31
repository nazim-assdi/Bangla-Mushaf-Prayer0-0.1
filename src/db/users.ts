import { db } from './index.ts';
import { users, userSettings, bookmarks, dhikrProgress } from './schema.ts';
import { eq, and } from 'drizzle-orm';

/**
 * Ensures user exists in PostgreSQL Cloud SQL database
 */
export async function getOrCreateUser(uid: string, email?: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email: email || null,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email || null,
          displayName: displayName || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

/**
 * Get user settings from Cloud SQL
 */
export async function getUserSettings(uid: string) {
  try {
    const result = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, uid));

    return result[0] || null;
  } catch (error) {
    console.error('Database getUserSettings failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

/**
 * Save or update user settings in Cloud SQL
 */
export async function saveUserSettings(
  uid: string,
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
    await getOrCreateUser(uid);

    const result = await db
      .insert(userSettings)
      .values({
        userId: uid,
        ...settings,
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database saveUserSettings failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

/**
 * Get all user bookmarks
 */
export async function getUserBookmarks(uid: string) {
  try {
    return await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, uid));
  } catch (error) {
    console.error('Database getUserBookmarks failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

/**
 * Add or update a user bookmark
 */
export async function addBookmark(
  uid: string,
  item: {
    verseKey: string;
    surahNameBn: string;
    ayahNumber: number;
    addedAt: string;
  }
) {
  try {
    await getOrCreateUser(uid);

    const result = await db
      .insert(bookmarks)
      .values({
        userId: uid,
        verseKey: item.verseKey,
        surahNameBn: item.surahNameBn,
        ayahNumber: item.ayahNumber,
        addedAt: item.addedAt,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database addBookmark failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

/**
 * Remove a user bookmark by verseKey
 */
export async function removeBookmark(uid: string, verseKey: string) {
  try {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, uid), eq(bookmarks.verseKey, verseKey)));
    return { success: true };
  } catch (error) {
    console.error('Database removeBookmark failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

/**
 * Get user dhikr progress records
 */
export async function getUserDhikrProgress(uid: string) {
  try {
    return await db
      .select()
      .from(dhikrProgress)
      .where(eq(dhikrProgress.userId, uid));
  } catch (error) {
    console.error('Database getUserDhikrProgress failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

/**
 * Save dhikr progress
 */
export async function upsertDhikrProgress(
  uid: string,
  item: {
    dhikrId: number;
    count: number;
    target: number;
    completed: boolean;
  }
) {
  try {
    await getOrCreateUser(uid);

    // Check if progress already exists for this dhikrId
    const existing = await db
      .select()
      .from(dhikrProgress)
      .where(and(eq(dhikrProgress.userId, uid), eq(dhikrProgress.dhikrId, item.dhikrId)));

    if (existing.length > 0) {
      const updated = await db
        .update(dhikrProgress)
        .set({
          count: item.count,
          target: item.target,
          completed: item.completed,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(dhikrProgress.id, existing[0].id))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(dhikrProgress)
        .values({
          userId: uid,
          dhikrId: item.dhikrId,
          count: item.count,
          target: item.target,
          completed: item.completed,
          updatedAt: new Date().toISOString(),
        })
        .returning();
      return inserted[0];
    }
  } catch (error) {
    console.error('Database upsertDhikrProgress failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
