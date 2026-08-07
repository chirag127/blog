import { complete } from '@chirag127/oz-ai'
import { useRef, useState } from 'react'

type Mode = 'tldr' | 'eli5'

const PROMPTS: Record<Mode, { system: string; label: string }> = {
  tldr: {
    label: 'TL;DR',
    system:
      'You are an editor. Summarize the article in 3-4 tight sentences. No preamble, no "this article". Plain prose.',
  },
  eli5: {
    label: 'Explain like I am 5',
    system:
      'Explain the article so a curious 10-year-old gets it. Short, warm, concrete analogies. 4-6 sentences. No jargon.',
  },
}

/** Grab the rendered article text (capped) from the sibling .post-body. */
function articleText(root: HTMLElement | null): string {
  const body =
    root?.closest('.post-main')?.querySelector('.post-body') ??
    document.querySelector('.post-body')
  const text = (body?.textContent ?? '').replace(/\s+/g, ' ').trim()
  return text.slice(0, 12000)
}

export default function PostAI({ title }: { title: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode | null>(null)
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  async function run(next: Mode) {
    if (loading) return
    if (mode === next && out) {
      setMode(null)
      return
    }
    setMode(next)
    setOut('')
    setLoading(true)
    setFailed(false)
    try {
      const text = articleText(rootRef.current)
      const { system } = PROMPTS[next]
      const answer = await complete(`Title: ${title}\n\nArticle:\n${text}`, { system })
      const clean = answer.trim()
      if (!clean) throw new Error('empty')
      setOut(clean)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  if (failed && !out) return null

  return (
    <div className="post-ai" ref={rootRef}>
      <p className="post-ai-h mono">Read it faster</p>
      <div className="post-ai-actions">
        {(Object.keys(PROMPTS) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            className="post-ai-btn"
            aria-pressed={mode === m}
            disabled={loading}
            onClick={() => run(m)}
          >
            {PROMPTS[m].label}
          </button>
        ))}
      </div>
      {loading && <p className="post-ai-status">Thinking…</p>}
      {!loading && out && (
        <div className="post-ai-out" aria-live="polite">
          {out}
        </div>
      )}
      <style>{`
        .post-ai {
          margin: 2.5rem 0 0;
          padding: 1.25rem 1.25rem 1.375rem;
          border: 1px solid var(--rule);
          border-left: 3px solid var(--brand);
          background: color-mix(in oklab, var(--paper-2) 60%, transparent);
        }
        .post-ai-h {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--ink-mute);
          margin: 0 0 0.75rem;
        }
        .post-ai-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .post-ai-btn {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.04em;
          padding: 0.375rem 0.75rem;
          background: transparent;
          border: 1px solid var(--rule);
          color: var(--ink);
          cursor: pointer;
          transition: color 120ms ease, border-color 120ms ease, background-color 120ms ease;
        }
        .post-ai-btn:hover:not(:disabled) {
          color: var(--brand);
          border-color: color-mix(in oklab, var(--brand) 50%, var(--rule));
          background: var(--brand-soft);
        }
        .post-ai-btn[aria-pressed='true'] {
          color: var(--brand);
          border-color: var(--brand);
          background: var(--brand-soft);
        }
        .post-ai-btn:disabled { opacity: 0.55; cursor: default; }
        .post-ai-status {
          margin: 0.875rem 0 0;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--ink-mute);
        }
        .post-ai-out {
          margin-top: 0.875rem;
          font-family: var(--font-body);
          font-size: 0.9375rem;
          line-height: 1.6;
          color: var(--ink);
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  )
}
