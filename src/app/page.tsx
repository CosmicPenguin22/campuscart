'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'

const CATEGORIES = ['All', 'Textbooks', 'Furniture', 'Electronics', 'Housing', 'Other']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
]

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

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const supabase = createClient()

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, profiles(name)')
      .eq('status', 'active')

    if (category !== 'All') {
      query = query.eq('category', category)
    }

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'price_low') {
      query = query.order('price', { ascending: true })
    } else if (sort === 'price_high') {
      query = query.order('price', { ascending: false })
    }

    const { data } = await query
    setListings((data as Listing[]) || [])
    setLoading(false)
  }, [category, search, sort])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchListings()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchListings])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-orange-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Buy & Sell on Campus
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-orange-100 leading-relaxed">
              The marketplace made for Longhorns. Find textbooks, furniture, electronics, and more from fellow UT Austin students.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/signup" className="px-6 py-3 bg-white text-primary-dark font-semibold rounded-xl hover:bg-orange-50 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Get Started — It&apos;s Free
              </Link>
              <a href="#listings" className="px-6 py-3 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                Browse Listings
              </a>
            </div>
          </div>
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            <div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-orange-200">Free to use</div>
            </div>
            <div>
              <div className="text-2xl font-bold">UT</div>
              <div className="text-sm text-orange-200">Students only</div>
            </div>
            <div>
              <div className="text-2xl font-bold">🤘</div>
              <div className="text-sm text-orange-200">Hook &apos;em!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Listings */}
      <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white text-text-secondary border border-border hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-surface-alt" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-surface-alt rounded w-3/4" />
                  <div className="h-4 bg-surface-alt rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-surface-alt rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary">No listings found</h3>
            <p className="mt-1 text-text-secondary">
              {search || category !== 'All' ? 'Try adjusting your filters.' : 'Be the first to post!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
