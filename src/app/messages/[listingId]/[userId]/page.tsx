'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Message {
  id: string
  listing_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

interface ListingInfo {
  title: string
  id: string
}

export default function ChatPage() {
  const params = useParams()
  const listingId = params.listingId as string
  const userId = params.userId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [listing, setListing] = useState<ListingInfo | null>(null)
  const [otherUserName, setOtherUserName] = useState('...')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      // Fetch listing info
      const { data: listingData } = await supabase
        .from('listings')
        .select('id, title')
        .eq('id', listingId)
        .single()
      if (listingData) setListing(listingData)

      // Fetch other user's name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single()
      if (profile) setOtherUserName(profile.name || 'User')

      // Fetch existing messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', listingId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs)
    }

    init()
  }, [listingId, userId])

  // Subscribe to realtime messages
  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase
      .channel(`messages:${listingId}:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          // Only add if this message is part of our conversation
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === userId) ||
            (newMsg.sender_id === userId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, listingId, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: currentUserId,
      receiver_id: userId,
      content,
    })

    if (error) {
      setNewMessage(content) // Restore message on error
    }
    setSending(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border shrink-0">
        <Link href="/messages" className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
          <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {otherUserName[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-text-primary truncate">{otherUserName}</h2>
          {listing && (
            <Link href={`/listings/${listing.id}`} className="text-xs text-primary hover:underline truncate block">
              Re: {listing.title}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-text-muted py-10">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender_id === currentUserId
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-md'
                  : 'bg-surface-alt text-text-primary border border-border rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${
                msg.sender_id === currentUserId ? 'text-orange-200' : 'text-text-muted'
              }`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-border shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface-alt text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="px-5 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  )
}
