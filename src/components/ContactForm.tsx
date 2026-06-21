import { useState } from 'react'

interface Props {
  web3formsKey: string
  fromName?: string
  successMessage?: string
}

export default function ContactForm({
  web3formsKey,
  fromName = 'oriz-blog contact form',
  successMessage = 'Thanks — your message has been sent.',
}: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setBusy(true)

    const fd = new FormData(e.currentTarget)
    if (fd.get('botcheck')) {
      // honeypot tripped
      setBusy(false)
      setDone(true)
      return
    }
    fd.set('access_key', web3formsKey)
    fd.set('from_name', fromName)

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: fd,
      })
      const json = (await res.json()) as { success: boolean; message?: string }
      if (!json.success) throw new Error(json.message ?? 'Send failed')
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <p data-oriz-contact-success role="status">
        {successMessage}
      </p>
    )
  }

  return (
    <form data-oriz-contact onSubmit={onSubmit}>
      <input type="checkbox" name="botcheck" data-oriz-contact-honeypot tabIndex={-1} />

      <label data-oriz-contact-field>
        <span>Your name</span>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label data-oriz-contact-field>
        <span>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label data-oriz-contact-field>
        <span>Message</span>
        <textarea
          name="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      {error && (
        <p data-oriz-contact-error role="alert">
          {error}
        </p>
      )}

      <button type="submit" data-oriz-contact-submit disabled={busy}>
        {busy ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
