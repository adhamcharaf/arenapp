'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import clsx from 'clsx'
import AuthButton from './AuthButton'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/booking', label: 'Réserver' },
]

export default function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/ARENA_couleur.svg"
            alt="ARENA Logo"
            width={120}
            height={40}
            className="h-18 w-auto"
          />
        </Link>
        
        <div className="flex items-center gap-6">
          <ul className="flex space-x-6">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    'text-sm font-medium hover:text-ci-orange transition-colors',
                    pathname === href ? 'text-ci-orange' : 'text-gray-700'
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <Link
                  href="/profile"
                  className={clsx(
                    'text-sm font-medium hover:text-ci-orange transition-colors',
                    pathname === '/profile' ? 'text-ci-orange' : 'text-gray-700'
                  )}
                >
                  Profil
                </Link>
              </li>
            )}
          </ul>
          
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}