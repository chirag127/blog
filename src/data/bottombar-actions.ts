import type { BottomBarAction } from '~/components/chrome/BottomBar.astro'

export const bottomBarActions: BottomBarAction[] = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'read', label: 'Latest', href: '/blog/' },
  { icon: 'series', label: 'Series', href: '/series/' },
  { icon: 'find', label: 'Search', href: '/search/' },
  { icon: 'menu', label: 'Menu', href: '#sb-toggle' },
]
