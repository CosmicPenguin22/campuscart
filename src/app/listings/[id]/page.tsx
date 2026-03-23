import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import MessageSellerButton from './MessageSellerButton'

const categoryColors: Record<string, string> = {
  Textbooks: 'bg-blue-50 text-blue-700 border-blue-200',
  Furniture: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Electronics: 'bg-purple-50 text-purple-700 border-purple-200',
  Housing: 'bg-amber-50 text-amber-700 border-amber-200',
  Other: 'bg-gray-50 text-gray-600 border-gray-200',
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(id, name, email, avatar_url)')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === listing.user_id

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square relative rounded-2xl overflow-hidden bg-surface-alt border border-border">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-alt to-surface-hover">
              <svg className="w-20 h-20 text-text-muted/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[listing.category] || categoryColors['Other']}`}>
                {listing.category}
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-text-primary">
                {listing.title}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                ${Number(listing.price).toFixed(2)}
              </div>
              {listing.status === 'sold' && (
                <span className="inline-block mt-1 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                  SOLD
                </span>
              )}
            </div>
          </div>

          {listing.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Description
              </h2>
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {listing.meetup_location && (
            <div className="mt-6 p-4 rounded-xl bg-surface-alt border border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
                Meetup Location
              </div>
              <p className="mt-1 text-text-secondary">{listing.meetup_location}</p>
            </div>
          )}

          {/* Seller Info */}
          <div className="mt-6 p-4 rounded-xl bg-white border border-border">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Seller
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-sm">
                {listing.profiles?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-text-primary">{listing.profiles?.name || 'Anonymous'}</p>
                <p className="text-xs text-text-muted">{listing.profiles?.email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6">
            {!isOwner && listing.status === 'active' && (
              <MessageSellerButton
                listingId={listing.id}
                sellerId={listing.user_id}
                currentUserId={user?.id}
              />
            )}
            {isOwner && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                This is your listing.
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Posted {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
