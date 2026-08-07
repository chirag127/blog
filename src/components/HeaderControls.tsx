/**
 * Header controls — the right side of the v2 60px header.
 *
 *   search · rss · more
 *
 * - ⌘K opens the Pagefind search modal (`/`, ⌘K, Ctrl+K)
 * - rss is a plain link
 * - ··· opens an overflow menu with /about, /now, /series and a theme toggle
 *
 * No accent picker: the editorial identity owns one signal color. No theme
 * picker in the header chrome — it lives behind the ··· overflow per the
 * brief.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react'

type Theme = 'auto' | 'light' | 'dark' | 'sepia' | 'hc'

export default function HeaderControls() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('auto')
  const mountRef = useRef<HTMLDivElement>(null)
  const searchPanelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const id = useId()

  const applyTheme = useCallback((next: Theme, persist = true) => {
    if (next === 'auto') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', next)
    }
    if (persist) localStorage.setItem('oriz:theme', next)
    setTheme(next)
  }, [])

  useEffect(() => {
    const storedValue = localStorage.getItem('oriz:theme') as Theme | null
    const stored: Theme = storedValue && ['auto', 'light', 'dark', 'sepia', 'hc'].includes(storedValue) ? storedValue : 'auto'
    setTheme(stored)
    applyTheme(stored, false)

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === '/') {
        const tag = (e.target as HTMLElement | null)?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault()
          setSearchOpen(true)
        }
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setMenuOpen(false)
      }
    }
    const closeTransientUi = () => {
      setSearchOpen(false)
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('astro:before-preparation', closeTransientUi)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('astro:before-preparation', closeTransientUi)
    }
  }, [applyTheme])

  useEffect(() => {
    if (!searchOpen) return
    previousFocusRef.current = document.activeElement as HTMLElement | null
    const focusSearch = () => {
      const firstFocusable = searchPanelRef.current?.querySelector<HTMLElement>('input, button, a, [tabindex]:not([tabindex="-1"])')
      firstFocusable?.focus()
    }
    const frame = window.requestAnimationFrame(focusSearch)
    const onDialogKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !searchPanelRef.current) return
      const focusable = Array.from(
        searchPanelRef.current.querySelectorAll<HTMLElement>('input, button, a, [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onDialogKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onDialogKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    if (!searchOpen || !mountRef.current) return
    let cancelled = false
    const load = async () => {
      try {
        const [{ PagefindUI }] = await Promise.all([
          // @ts-expect-error — runtime import; types not bundled
          import('@pagefind/default-ui'),
          import('@pagefind/default-ui/css/ui.css'),
        ])
        if (cancelled || !mountRef.current) return
        mountRef.current.innerHTML = ''
        new PagefindUI({
          element: mountRef.current,
          showImages: false,
          showSubResults: true,
          resetStyles: false,
          autofocus: true,
          translations: {
            placeholder: 'Search posts…',
            zero_results: 'No matches for "[SEARCH_TERM]". Try fewer / different words.',
          },
        })
        // Pagefind adds its input after construction; focus again after its DOM settles.
        window.requestAnimationFrame(() => {
          mountRef.current?.querySelector<HTMLElement>('input, button, a, [tabindex]:not([tabindex="-1"])')?.focus()
        })
      } catch (e) {
        if (mountRef.current) {
          mountRef.current.innerHTML =
            '<p style="padding:1.25rem;color:var(--ink-mute)">Search isn\'t available yet. Run <code>pnpm build</code> to generate the index, then try again.</p>'
        }
        // eslint-disable-next-line no-console
        console.error('Pagefind UI failed to load', e)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [searchOpen])

  return (
    <>
      <div className="hc">
        <button
          type="button"
          className="hc-trigger"
          onClick={() => setSearchOpen(true)}
          aria-label="Search the blog (⌘K)"
        >
          <span className="hc-kbd mono">⌘K</span>
        </button>
        <a className="hc-link" href="/rss.xml" aria-label="RSS feed">
          rss
        </a>
        <button
          type="button"
          className="hc-trigger hc-overflow"
          aria-label="More"
          aria-expanded={menuOpen}
          aria-controls={`${id}-menu`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          ···
        </button>

        {menuOpen && (
          <div className="hc-menu" id={`${id}-menu`} role="menu">
            <a href="/about/" role="menuitem">
              about
            </a>
            <a href="/now/" role="menuitem">
              now
            </a>
            <a href="/series/" role="menuitem">
              series
            </a>
            <a href="/archive/" role="menuitem">
              archive
            </a>
            <a href="/account/" role="menuitem">
              account
            </a>
            <hr />
            <p className="hc-menu-h mono">theme</p>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={theme === 'auto'}
              onClick={() => applyTheme('auto')}
              className={theme === 'auto' ? 'is-active' : ''}
            >
              auto
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={theme === 'light'}
              onClick={() => applyTheme('light')}
              className={theme === 'light' ? 'is-active' : ''}
            >
              light
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={theme === 'dark'}
              onClick={() => applyTheme('dark')}
              className={theme === 'dark' ? 'is-active' : ''}
            >
              dark
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={theme === 'sepia'}
              onClick={() => applyTheme('sepia')}
              className={theme === 'sepia' ? 'is-active' : ''}
            >
              sepia
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={theme === 'hc'}
              onClick={() => applyTheme('hc')}
              className={theme === 'hc' ? 'is-active' : ''}
            >
              high contrast
            </button>
          </div>
        )}
      </div>

      {searchOpen && (
        <div
          className="search-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSearchOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search the blog"
          tabIndex={-1}
        >
          <div className="search-panel" ref={searchPanelRef}>
            <div ref={mountRef} className="pagefind-mount" />
            <div className="search-foot mono">
              <span>
                <kbd>↵</kbd> open
              </span>
              <span>
                <kbd>esc</kbd> close
              </span>
              <a href="/search/" className="search-foot-link">
                Open dedicated search →
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hc {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          font-family: var(--font-sans, 'Inter Tight', system-ui, sans-serif);
          font-size: 13px;
          color: var(--ink-mute);
        }
        .hc-trigger {
          background: transparent;
          border: 0;
          padding: 0.375rem 0.5rem;
          color: var(--ink-mute);
          cursor: pointer;
          font: inherit;
          letter-spacing: 0.04em;
        }
        .hc-trigger:hover { color: var(--accent); }
        .hc-trigger:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .hc-link {
          color: var(--ink-mute);
          text-decoration: none;
          padding: 0.375rem 0.25rem;
        }
        .hc-link:hover { color: var(--accent); }
        .hc-kbd {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          border: 1px solid var(--rule);
          color: var(--ink-mute);
          font-family: var(--font-mono);
          font-size: 11px;
        }
        .hc-trigger:hover .hc-kbd { border-color: var(--accent); color: var(--accent); }
        .hc-overflow { font-size: 16px; line-height: 1; padding: 0.25rem 0.5rem; letter-spacing: 0.1em; }

        .hc-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 180px;
          background: var(--paper);
          border: 1px solid var(--rule);
          padding: 0.5rem 0;
          z-index: 60;
          display: flex;
          flex-direction: column;
        }
        .hc-menu a, .hc-menu button {
          background: transparent;
          border: 0;
          padding: 0.375rem 1rem;
          color: var(--ink);
          font: inherit;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
        }
        .hc-menu a:hover, .hc-menu button:hover { background: var(--paper-2); color: var(--accent); }
        .hc-menu .is-active { color: var(--accent); }
        .hc-menu hr { height: 1px; border: 0; background: var(--rule); margin: 0.5rem 0; }
        .hc-menu-h {
          padding: 0 1rem 0.25rem;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-mute);
          margin: 0;
        }

        .search-backdrop {
          position: fixed; inset: 0;
          background: color-mix(in oklab, var(--ink) 55%, transparent);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 12vh;
          padding-inline: 1rem;
        }
        .search-panel {
          width: 100%;
          max-width: 720px;
          background: var(--paper);
          border: 1px solid var(--rule);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.18);
          overflow: hidden;
        }
        .pagefind-mount { padding: 1rem; min-height: 320px; max-height: 70vh; overflow-y: auto; }
        .search-foot {
          display: flex;
          gap: 1rem;
          padding: 0.625rem 1rem;
          background: var(--paper-2);
          border-top: 1px solid var(--rule);
          color: var(--ink-mute);
          font-size: 11px;
        }
        .search-foot kbd {
          padding: 0.125rem 0.375rem;
          border: 1px solid var(--rule);
          color: var(--ink-mute);
          font-family: var(--font-mono);
          font-size: 10px;
          margin-right: 0.25rem;
        }
        .search-foot-link { margin-left: auto; color: var(--ink-mute); text-decoration: underline; text-underline-offset: 3px; }
        .search-foot-link:hover { color: var(--accent); }
      `}</style>
    </>
  )
}
