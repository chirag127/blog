import { ClerkProvider } from '@clerk/clerk-react'
import BookmarksListInner from './BookmarksList'

export default function BookmarksIsland() {
  const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined
  return (
    <ClerkProvider publishableKey={publishableKey ?? ''}>
      <BookmarksListInner />
    </ClerkProvider>
  )
}
