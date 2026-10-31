import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Users table keyed by Firebase UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email'),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User settings and reading preferences
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  theme: text('theme').default('emerald'),
  arabicFontSize: integer('arabic_font_size').default(28),
  banglaFontSize: integer('bangla_font_size').default(15),
  selectedReciterId: text('selected_reciter_id').default('alafasy'),
  currentLanguage: text('current_language').default('bn'),
  selectedDistrict: text('selected_district').default('Dhaka'),
  lastReadSurahId: integer('last_read_surah_id').default(1),
  lastReadAyahNumber: integer('last_read_ayah_number').default(1),
  lastReadSurahNameBn: text('last_read_surah_name_bn').default('আল-ফাতিহা'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Quran Bookmarks
export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  verseKey: text('verse_key').notNull(),
  surahNameBn: text('surah_name_bn').notNull(),
  ayahNumber: integer('ayah_number').notNull(),
  addedAt: text('added_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// User Masnun Dhikr and Tasbih progress
export const dhikrProgress = pgTable('dhikr_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  dhikrId: integer('dhikr_id').notNull(),
  count: integer('count').notNull().default(0),
  target: integer('target').notNull().default(33),
  completed: boolean('completed').notNull().default(false),
  updatedAt: text('updated_at').notNull(),
});

// Table relationships
export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [users.uid],
    references: [userSettings.userId],
  }),
  bookmarks: many(bookmarks),
  dhikr: many(dhikrProgress),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.uid],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.uid],
  }),
}));

export const dhikrProgressRelations = relations(dhikrProgress, ({ one }) => ({
  user: one(users, {
    fields: [dhikrProgress.userId],
    references: [users.uid],
  }),
}));
