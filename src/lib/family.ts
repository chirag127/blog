export const FAMILY = {
  brand: 'oriz',
  rootOrigin: 'https://oriz.in',
  authDomain: 'auth.oriz.in',
  firebaseProjectId: 'oriz-app',
  operator: {
    name: 'Chirag Singhal',
    email: 'whyiswhen@gmail.com',
    address: 'Bhubaneswar, Odisha, India 751001',
    githubHandle: 'chirag127',
  },
  jurisdiction: { country: 'India', state: 'Odisha', city: 'Bhubaneswar' },
  legalUpdated: '2026-06-19',
} as const

export interface FamilySite {
  slug: string
  name: string
  url: string
  tagline: string
  category: 'reading' | 'tools' | 'finance' | 'personal'
}

export const FAMILY_SITES: FamilySite[] = [
  {
    slug: 'home',
    name: 'oriz',
    url: 'https://oriz.in',
    tagline: 'The hub for the oriz family',
    category: 'personal',
  },
  {
    slug: 'me',
    name: 'Me',
    url: 'https://me.oriz.in',
    tagline: 'Chirag Singhal profile',
    category: 'personal',
  },
  {
    slug: 'blog',
    name: 'Blog',
    url: 'https://blog.oriz.in',
    tagline: 'Long-form writing',
    category: 'reading',
  },
  {
    slug: 'books',
    name: 'Books',
    url: 'https://books.oriz.in',
    tagline: 'NCERT textbook directory',
    category: 'reading',
  },
  {
    slug: 'book-lore',
    name: 'Book Lore',
    url: 'https://book-lore.oriz.in',
    tagline: 'Structured book commentary',
    category: 'reading',
  },
  {
    slug: 'journal',
    name: 'Journal',
    url: 'https://journal.oriz.in',
    tagline: 'Privacy-first PWA journal',
    category: 'personal',
  },
]
