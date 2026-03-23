'use client'

import { useRouter } from 'next/navigation'

interface MessageSellerButtonProps {
  listingId: string
  sellerId: string
  currentUserId?: string
}

export default function MessageSellerButton({ listingId, sellerId, currentUserId }: MessageSellerButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (!currentUserId) {
      router.push(`/auth/login?redirect=/listings/${listingId}`)
      return
    }
    router.push(`/messages/${listingId}/${sellerId}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
      Message Seller
    </button>
  )
}
