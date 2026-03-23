'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Thread {
  listing_id: string
  other_user_id: string
  listing_title: string
  other_user_name: string
  last_message: string
  last_message_at: string
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchThreads = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all messages involving this user
      const { data: messages } = await supabase
        .from('messages')
        .select('*, listings(title), sender:profiles!messages_sender_id_fkey(name), receiver:profiles!messages_receiver_id_fkey(name)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!messages) {
        setLoading(false)
        return
      }

      // Group by listing + other user
      const threadMap = new Map<string, Thread>()
      for (const msg of messages) {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        const otherUserName = msg.sender_id === user.id
          ? (msg.receiver as { name: string | null })?.name || 'Unknown'
          : (msg.sender as { name: string | null })?.name || 'Unknown'
        const key = `${msg.listing_id}_${otherUserId}`

        if (!threadMap.has(key)) {
          threadMap.set(key, {
            listing_id: msg.listing_id,
            other_user_id: otherUserId,
            listing_title: (msg.listings as { title: string })?.title || 'Unknown Listing',
            other_user_name: otherUserName,
            last_message: msg.content,
            last_message_at: msg.created_at,
          })
        }
      }

      setThreads(Array.from(threadMap.values()))
      setLoading(false)
    }

    fetchThreads()
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Messages</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-alt rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-alt rounded w-1/3" />
                  <div className="h-3 bg-surface-alt rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Messages</h1>

      {threads.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-surface-alt rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">No messages yet</h3>
          <p className="mt-1 text-text-secondary">Browse listings and message a seller to get started.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map(thread => (
            <Link
              key={`${thread.listing_id}_${thread.other_user_id}`}
              href={`/messages/${thread.listing_id}/${thread.other_user_id}`}
              className="block bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {thread.other_user_name[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                      {thread.other_user_name}
                    </h3>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {new Date(thread.last_message_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium truncate">{thread.listing_title}</p>
                  <p className="text-sm text-text-secondary truncate mt-0.5">{thread.last_message}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
