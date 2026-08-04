/**
 * Wraps ClerkProvider around AccountPanel for the static Astro site.
 * Mount with client:load — this is the single React island entry point
 * for auth on the account page.
 */
import { ClerkProvider } from '@clerk/clerk-react'
import { AccountPanel } from './AccountPanel'

interface Props {
  siteName?: string
}

export default function AccountIsland({ siteName }: Props) {
  const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

  return (
    <ClerkProvider publishableKey={publishableKey ?? ''}>
      <AccountPanel siteName={siteName} signOutRedirectUrl="/" />
    </ClerkProvider>
  )
}
