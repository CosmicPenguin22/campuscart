'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent">
              CampusCart
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/listings/new" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
                  Sell Item
                </Link>
                <Link href="/messages" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
                  Messages
                </Link>
                <Link href="/profile" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-error hover:bg-red-50 rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
                  Log In
                </Link>
                <Link href="/auth/signup" className="ml-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/listings/new" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
                  Sell Item
                </Link>
                <Link href="/messages" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
                  Messages
                </Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
                  Profile
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-left px-4 py-3 text-sm font-medium text-error hover:bg-red-50 rounded-lg transition-all">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all">
                  Log In
                </Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-lg text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
