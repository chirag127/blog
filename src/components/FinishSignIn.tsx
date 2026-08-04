/**
 * Deprecated — Firebase email-link finish-sign-in flow.
 * Auth is now handled by Clerk; this component is a no-op stub kept to
 * avoid breaking any stale imports. Remove after confirming no callsite.
 */
export function FinishSignIn() {
  if (typeof window !== 'undefined') {
    window.location.replace('/account/')
  }
  return <p>Redirecting…</p>
}

export default FinishSignIn
