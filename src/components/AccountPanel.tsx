import { UserButton, useUser } from '@clerk/clerk-react'
import { useClerk } from '@clerk/clerk-react'

export interface AccountPanelProps {
  siteName?: string
  signInRedirectUrl?: string
  signOutRedirectUrl?: string
}

export function AccountPanel({
  siteName = 'oriz / blog',
  signInRedirectUrl,
  signOutRedirectUrl = '/',
}: AccountPanelProps) {
  const { isLoaded, isSignedIn, user } = useUser()
  const { openSignIn } = useClerk()

  if (!isLoaded) {
    return (
      <div data-oriz-account data-oriz-account-state="loading">
        <span data-oriz-account-spinner aria-hidden="true">
          ⟳
        </span>
        <p>Loading…</p>
      </div>
    )
  }

  if (isSignedIn && user) {
    return (
      <div data-oriz-account data-oriz-account-state="signed-in">
        <div data-oriz-account-me>
          <UserButton afterSignOutUrl={signOutRedirectUrl} />
          <div>
            <p data-oriz-account-name>
              {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? 'Signed in'}
            </p>
            {user.primaryEmailAddress && (
              <p data-oriz-account-email>{user.primaryEmailAddress.emailAddress}</p>
            )}
          </div>
        </div>
        <p data-oriz-account-note>
          You are signed in across every oriz site. Visit any subdomain and your session is already
          there.
        </p>
      </div>
    )
  }

  return (
    <div data-oriz-account data-oriz-account-state="signed-out">
      <h2 data-oriz-account-heading>Sign in to {siteName}</h2>
      <p data-oriz-account-note>
        Sign-in is optional. It is only used to sync your bookmarks across devices. The full blog
        is readable without an account.
      </p>
      <button
        type="button"
        data-oriz-account-action="sign-in"
        onClick={() => openSignIn({ redirectUrl: signInRedirectUrl ?? window.location.href })}
      >
        Sign in
      </button>
    </div>
  )
}

export default AccountPanel
