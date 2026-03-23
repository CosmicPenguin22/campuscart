'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'

interface Profile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string | null
  meetup_location: string | null
  status: string
  created_at: string
  user_id: string
  profiles: { name: string | null } | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*, profiles(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (listingsData) setListings(listingsData as Listing[])
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleMarkSold = async (listingId: string) => {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId)
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: 'sold' } : l))
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    await supabase.from('listings').delete().eq('id', listingId)
    setListings(prev => prev.filter(l => l.id !== listingId))
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-surface-alt rounded-full" />
            <div className="space-y-2">
              <div className="h-5 bg-surface-alt rounded w-32" />
              <div className="h-4 bg-surface-alt rounded w-48" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
            {profile?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{profile?.name || 'Anonymous'}</h1>
            <p className="text-text-secondary">{profile?.email}</p>
            <p className="text-xs text-text-muted mt-1">
              Member since {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/listings/new"
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all text-sm"
          >
            + New Listing
          </Link>
          <Link
            href="/messages"
            className="px-5 py-2.5 bg-white text-text-primary font-semibold rounded-xl border border-border hover:border-primary hover:text-primary transition-all text-sm"
          >
            View Messages
          </Link>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Your Listings ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <div className="w-16 h-16 bg-surface-alt rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary">No listings yet</h3>
            <p className="mt-1 text-text-secondary">Start selling by creating your first listing.</p>
            <Link href="/listings/new" className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl">
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <div key={listing.id} className="relative group">
                <ListingCard {...listing} />
                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {listing.status === 'active' && (
                    <button
                      onClick={(e) => { e.preventDefault(); handleMarkSold(listing.id) }}
                      className="px-2.5 py-1.5 bg-white/90 backdrop-blur text-xs font-semibold text-success border border-success/20 rounded-lg hover:bg-success hover:text-white transition-all"
                    >
                      Mark Sold
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(listing.id) }}
                    className="px-2.5 py-1.5 bg-white/90 backdrop-blur text-xs font-semibold text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
