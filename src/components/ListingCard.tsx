import Image from 'next/image'
import Link from 'next/link'

interface ListingCardProps {
  id: string
  title: string
  price: number
  category: string
  image_url: string | null
  meetup_location: string | null
  created_at: string
  profiles?: { name: string | null } | null
}

const categoryColors: Record<string, string> = {
  Textbooks: 'bg-blue-50 text-blue-700 border-blue-200',
  Furniture: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Electronics: 'bg-purple-50 text-purple-700 border-purple-200',
  Housing: 'bg-amber-50 text-amber-700 border-amber-200',
  Other: 'bg-gray-50 text-gray-600 border-gray-200',
}

export default function ListingCard({
  id,
  title,
  price,
  category,
  image_url,
  meetup_location,
  created_at,
  profiles,
}: ListingCardProps) {
  const timeAgo = getTimeAgo(new Date(created_at))

  return (
    <Link href={`/listings/${id}`} className="group block">
      <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="aspect-[4/3] relative bg-surface-alt overflow-hidden">
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-alt to-surface-hover">
              <svg className="w-12 h-12 text-text-muted/40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryColors[category] || categoryColors['Other']}`}>
              {category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <span className="text-lg font-bold text-primary whitespace-nowrap">
              ${price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            {meetup_location && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
                {meetup_location}
              </span>
            )}
            <span>{timeAgo}</span>
          </div>
          {profiles?.name && (
            <p className="mt-2 text-xs text-text-muted">
              by {profiles.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
