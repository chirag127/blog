import { ClerkProvider, useClerk } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

function SignOutButton() {
  const { signOut } = useClerk()
  return (
    <button
      type="button"
      className="signout-btn"
      onClick={() => signOut(() => { window.location.href = '/' })}
    >
      Sign out
    </button>
  )
}

/**
 * Sign-out control as a Clerk React island (matches the rest of the blog's
 * Clerk auth). Avoids the standalone @clerk/clerk-js dependency.
 */
export default function SignOutIsland() {
  if (!PUBLISHABLE_KEY) {
    return (
      <button
        type="button"
        className="signout-btn"
        onClick={() => { window.location.href = '/' }}
      >
        Sign out
      </button>
    )
  }
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <SignOutButton />
    </ClerkProvider>
  )
}
