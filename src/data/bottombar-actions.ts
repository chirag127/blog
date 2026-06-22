import type { BottomBarAction } from '@chirag127/astro-chrome/BottomBar.astro'

export const bottomBarActions: BottomBarAction[] = [
  { icon: '⌂', label: 'Home', href: '/' },
  { icon: '✎', label: 'Latest', href: '/blog/' },
  { icon: '⇉', label: 'Series', href: '/series/' },
  { icon: '⌕', label: 'Search', href: '/search/' },
  { icon: '☰', label: 'Menu', href: '#sb-toggle' },
]
