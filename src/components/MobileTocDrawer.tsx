/**
 * MobileTocDrawer — floating "Contents" button + vaul bottom-sheet TOC.
 *
 * Renders only on mobile/tablet (<1024px). Auto-hides while at the top of the
 * post hero; reveals once scrolled past 320px. Tapping a section smooth-scrolls
 * to the heading and closes the drawer.
 *
 * Props mirror Astro MarkdownHeading entries filtered to depth 2 + 3.
 */
import { useEffect, useState } from 'react'
import { Drawer } from 'vaul'

export interface TocItem {
  slug: string
  text: string
  depth: number
}

interface Props {
  items: TocItem[]
}

const SHOW_AT = 320

export default function MobileTocDrawer({ items }: Props): JSX.Element | null {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = (): void => {
      setVisible(window.scrollY > SHOW_AT)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (items.length === 0) return null

  const jumpTo = (slug: string): void => {
    setOpen(false)
    requestAnimationFrame(() => {
      const el = document.getElementById(slug)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className={`mtd-fab${visible ? ' is-visible' : ''}`}
          aria-label="Open table of contents"
        >
          <span aria-hidden="true">≡</span>
          <span>Contents</span>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="mtd-overlay" />
        <Drawer.Content className="mtd-sheet">
          <div className="mtd-handle" aria-hidden="true" />
          <Drawer.Title className="mtd-title">On this page</Drawer.Title>
          <Drawer.Description className="mtd-desc">
            Jump to a section
          </Drawer.Description>
          <ol className="mtd-list">
            {items.map((h) => (
              <li key={h.slug} className={`mtd-item mtd-d${h.depth}`}>
                <button type="button" onClick={() => jumpTo(h.slug)}>
                  {h.text}
                </button>
              </li>
            ))}
          </ol>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
