'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/booking', label: 'Réserver' },
  { href: '/profile', label: 'Profil' },
]

export default function Header() {
  const pathname = usePathname()
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-ci-orange">
          🏟️ ARENAPP
        </Link>
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
        </ul>
      </nav>
    </header>
  )
}