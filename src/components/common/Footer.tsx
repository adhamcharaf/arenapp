import Link from "next/link"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ci-green to-ci-orange">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <span className="text-lg font-bold">ARENAPP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme #1 de réservation de terrains sportifs en Côte d'Ivoire. 
              Réservez facilement vos créneaux de padel et football.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-muted-foreground hover:text-primary transition-colors">
                  Réserver un terrain
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="font-semibold mb-4">Nos sports</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-sport-padel" />
                <span className="text-muted-foreground">Padel</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-sport-football" />
                <span className="text-muted-foreground">Football</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Abidjan, Côte d'Ivoire</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">+225 07 00 00 00 00</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">contact@arenapp.ci</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Lun-Dim: 6h00 - 22h00</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2024 ARENAPP. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-8 bg-gradient-to-r from-ci-green via-white to-ci-orange rounded-sm" />
            <span className="text-sm text-muted-foreground">Fait avec ❤️ en Côte d'Ivoire</span>
          </div>
        </div>
      </div>
    </footer>
  )
}