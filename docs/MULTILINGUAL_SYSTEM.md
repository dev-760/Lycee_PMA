# Multilingual Content System Documentation

## Overview

This document describes the professional multilingual system implementation for the school website. The system supports **Arabic (ar)**, **English (en)**, and **French (fr)**.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                          │
│  ┌───────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │ Select Source │ -> │  Write Content  │ -> │    Submit     │  │
│  │   Language    │    │  (One Language) │    │               │  │
│  └───────────────┘    └─────────────────┘    └───────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EDGE FUNCTION                              │
│  ┌───────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │ Receive Text  │ -> │   Translate to  │ -> │ Return All    │  │
│  │  + Source     │    │  Other Languages│    │ Translations  │  │
│  └───────────────┘    └─────────────────┘    └───────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ title_translations: { "ar": "...", "en": "...", "fr": "..." } │
│  │ source_language: "ar"                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  ┌───────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │ User Selects  │ -> │  getContent()   │ -> │ Display in    │  │
│  │   Language    │    │  from Context   │    │ User's Lang   │  │
│  └───────────────┘    └─────────────────┘    └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **Translate on Write, Not Read** - Translation happens when content is created/updated, NOT when pages render
2. **Store All Translations** - All three languages are stored in the database
3. **No Frontend Translation Calls** - Frontend only reads pre-translated content
4. **Graceful Fallbacks** - If translation fails, original text is preserved

## Database Structure

### JSONB Translation Fields

```sql
-- Example: Announcements table
title_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb
description_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb
source_language text DEFAULT 'ar'
```

### Migration Strategy

The migration preserves existing data:
1. Adds new `*_translations` JSONB columns
2. Migrates existing text to Arabic field
3. Keeps legacy columns for backward compatibility

## Translation Service

### Location
`src/lib/translator.ts`

### Core Functions

#### `translateText(text, sourceLanguage)`
Translates a single text to all supported languages.

```typescript
import { translateText } from '@/lib/translator';

const translations = await translateText('إعلان هام', 'ar');
// Result: { ar: 'إعلان هام', en: 'Important announcement', fr: 'Annonce importante' }
```

#### `translateFields(fields, sourceLanguage)`
Translates multiple fields at once (more efficient).

```typescript
import { translateFields } from '@/lib/translator';

const results = await translateFields({
  title: 'إعلان هام',
  description: 'محتوى الإعلان'
}, 'ar');
```

### Content Preparation Helpers

```typescript
import { 
  prepareAnnouncementWithTranslations,
  prepareArticleWithTranslations,
  prepareAbsentTeacherWithTranslations 
} from '@/lib/translator';

// Prepare announcement with automatic translation
const data = await prepareAnnouncementWithTranslations({
  title: 'Important Notice',
  description: 'Details here...'
}, 'en');

// Result includes all translations ready for database
```

## API Usage

### Creating Content with Translations

```typescript
import { api } from '@/lib/api';

// Create announcement - translations generated automatically
const announcement = await api.announcements.create({
  title: 'إعلان مهم',
  description: 'تفاصيل الإعلان',
  urgent: true
}, 'ar'); // Source language

// Create article
const article = await api.articles.create({
  title: 'New Article',
  excerpt: 'Summary...',
  content: '<p>Full content...</p>',
  category: 'news',
  author: 'Admin'
}, 'en'); // Written in English
```

### Updating Content

```typescript
// Update with re-translation
await api.announcements.update(
  id,
  { title: 'Updated Title', description: 'New description' },
  'ar',    // Source language
  true     // Retranslate = true
);

// Update without re-translation (e.g., toggling urgent flag)
await api.announcements.update(
  id,
  { urgent: false },
  'ar',
  false    // Retranslate = false
);
```

## Frontend Display

### Using `useLanguage()` Hook

```tsx
import { useLanguage } from '@/i18n';

function AnnouncementCard({ announcement }) {
  const { getContent, getContentWithFallback, language } = useLanguage();

  return (
    <div>
      {/* Primary method - uses translations field */}
      <h2>{getContent(announcement.title_translations)}</h2>
      
      {/* With fallback to legacy field during migration */}
      <p>{getContentWithFallback(
        announcement.description_translations, 
        announcement.description
      )}</p>
    </div>
  );
}
```

### Fallback Chain

When getting content, the system follows this fallback chain:
1. Requested language (e.g., `en`)
2. Arabic (`ar`)
3. English (`en`)
4. French (`fr`)
5. Empty string or provided fallback

## Edge Function

### Location
`supabase/functions/translate-text/index.ts`

### Features
- Authenticated access only (requires valid Supabase session)
- Rate limiting protection (delays between translations)
- Error handling with graceful fallbacks
- CORS support

### API Endpoints

**Single Text Translation:**
```json
POST /functions/v1/translate-text
{
  "text": "Hello World",
  "from": "en"
}
```

**Multiple Fields Translation:**
```json
POST /functions/v1/translate-text
{
  "fields": {
    "title": "Hello",
    "content": "World"
  },
  "from": "en"
}
```

## Vite Build Configuration

### Avoiding Build Errors

1. **Use Type-Only Imports:**
```typescript
// ✅ Good
import type { Language, MultilingualText } from '@/types';

// Or combined
import { translateText, type TranslationResult } from '@/lib/translator';
```

2. **Avoid Server-Only Code in Components:**
```typescript
// ❌ Bad - Edge function code in React component
import { serve } from 'https://deno.land/std/http/server.ts';

// ✅ Good - Call via Supabase client
const { data } = await supabase.functions.invoke('translate-text', { body });
```

3. **Dynamic Imports for Heavy Dependencies:**
```typescript
// For code-splitting
const translator = await import('@/lib/translator');
await translator.translateText(text, 'ar');
```

## Security Best Practices

### 1. Authentication Required
All translation requests require a valid Supabase session:
```typescript
const { data: { user } } = await supabaseClient.auth.getUser();
if (!user) throw new Error('Unauthorized');
```

### 2. Input Validation
```typescript
// Validate language codes
const SUPPORTED_LANGUAGES = ['ar', 'en', 'fr'];
if (!SUPPORTED_LANGUAGES.includes(from)) {
  throw new Error('Invalid language');
}
```

### 3. Rate Limiting
The Edge Function includes delays between translations to prevent abuse.

### 4. No Client-Side API Keys
Translation API is called only from Edge Functions, never from the browser.

## Performance Recommendations

### 1. Batch Translations
Use `translateFields()` instead of multiple `translateText()` calls:
```typescript
// ✅ Good - Single request
const results = await translateFields({ title, excerpt, content }, 'ar');

// ❌ Bad - Multiple requests
const titleT = await translateText(title, 'ar');
const excerptT = await translateText(excerpt, 'ar');
const contentT = await translateText(content, 'ar');
```

### 2. Skip Unnecessary Re-translation
```typescript
// Only retranslate when text content changes
await api.articles.update(
  id,
  { featured: true },
  'ar',
  false  // No need to retranslate for non-text changes
);
```

### 3. Cache Translations
Translations are stored in the database - no re-translation on read.

### 4. Index JSONB Fields
```sql
CREATE INDEX idx_articles_title_translations 
ON public.articles USING GIN (title_translations);
```

## Type Definitions

### Core Types

```typescript
// Supported languages
type Language = 'ar' | 'en' | 'fr';

// Multilingual text structure
interface MultilingualText {
  ar: string;
  en: string;
  fr: string;
}

// Example: Article type
interface Article {
  id: number;
  title: string;  // Legacy field
  title_translations: MultilingualText;
  excerpt_translations: MultilingualText;
  content_translations: MultilingualText;
  source_language: Language;
  // ... other fields
}
```

### Utility Functions

```typescript
import { 
  createEmptyMultilingualText,
  createMultilingualText,
  getLocalizedText,
  hasTranslation,
  getTranslationCompleteness 
} from '@/types';

// Create empty translations
const empty = createEmptyMultilingualText();
// { ar: '', en: '', fr: '' }

// Create with initial value
const initial = createMultilingualText('Hello', 'en');
// { ar: '', en: 'Hello', fr: '' }

// Get localized text with fallback
const text = getLocalizedText(translations, 'fr', 'Default');

// Check if translation exists
const hasFrench = hasTranslation(translations, 'fr');

// Get completeness percentage
const percent = getTranslationCompleteness(translations);
// 66 (if 2 of 3 languages are filled)
```

## Troubleshooting

### Translation Not Working

1. **Check Authentication:**
```typescript
const session = getSession();
console.log('Authenticated:', session?.success);
```

2. **Check Edge Function Logs:**
```bash
supabase functions logs translate-text
```

3. **Verify CORS Headers:**
Edge function must return proper CORS headers.

### Content Not Displaying

1. **Check Translation Structure:**
```typescript
console.log('Translations:', announcement.title_translations);
// Should be: { ar: '...', en: '...', fr: '...' }
```

2. **Verify Current Language:**
```typescript
const { language } = useLanguage();
console.log('Current language:', language);
```

### Build Errors

1. **Clear Cache:**
```bash
rm -rf node_modules/.vite
npm run dev
```

2. **Check Import Paths:**
Ensure `@/` alias is properly configured in `vite.config.ts`.

## File Structure

```
src/
├── types/
│   └── index.ts              # All types + utility functions
├── lib/
│   ├── api.ts                # API with translation support
│   ├── translator.ts         # Translation service
│   └── supabase.ts           # Supabase client
├── i18n/
│   ├── LanguageContext.tsx   # Language provider + hooks
│   ├── translations.ts       # Static UI translations
│   └── index.ts              # Exports
└── admin/
    └── pages/
        └── Announcements.tsx # Example implementation

supabase/
├── migrations/
│   └── 20240126_multilingual_content.sql
└── functions/
    └── translate-text/
        └── index.ts          # Edge function
```

## Deployment Checklist

- [ ] Run database migration
- [ ] Deploy Edge Function: `supabase functions deploy translate-text`
- [ ] Set environment variables in Supabase dashboard
- [ ] Test translation on staging
- [ ] Build frontend: `npm run build`
- [ ] Deploy frontend
