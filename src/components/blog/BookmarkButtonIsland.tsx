import { ClerkProvider } from '@clerk/clerk-react'
import BookmarkButtonInner from './BookmarkButton'

interface Props {
  slug: string
  url: string
  title: string
  description?: string
  category?: string
  pubDate?: string
}

export default function BookmarkButtonIsland(props: Props) {
  const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined
  return (
    <ClerkProvider publishableKey={publishableKey ?? ''}>
      <BookmarkButtonInner {...props} />
    </ClerkProvider>
  )
}
