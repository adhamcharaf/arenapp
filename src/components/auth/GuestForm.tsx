"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { Spinner } from "@/components/common/LoadingStates"
import { PHONE_REGEX } from "@/utils/constants"

interface GuestFormProps {
  onSwitchToLogin?: () => void
  onSuccess?: () => void
}

export function GuestForm({ onSwitchToLogin, onSuccess }: GuestFormProps) {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const { signInAsGuest } = useAuth()
  const router = useRouter()

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "")
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10)
    
    // Format as XX XX XX XX XX
    if (limited.length <= 2) return limited
    if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`
    if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`
    if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validate phone number
    const cleanPhone = phone.replace(/\D/g, "")
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError("Numéro de téléphone invalide")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signInAsGuest(cleanPhone, name.trim())
      if (error) {
        setError("Une erreur est survenue lors de la connexion")
      } else {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/booking")
        }
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Continuer en tant qu'invité</CardTitle>
        <CardDescription>
          Réservez rapidement sans créer de compte
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <div className="absolute left-10 top-3 text-sm text-muted-foreground">+225</div>
              <Input
                id="phone"
                type="tel"
                placeholder="07 00 00 00 00"
                value={phone}
                onChange={handlePhoneChange}
                className="pl-20"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Format: 07 XX XX XX XX ou 01 XX XX XX XX
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom (optionnel)</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Mode invité</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Réservation rapide sans inscription</li>
              <li>• Historique lié à votre numéro</li>
              <li>• Possibilité de créer un compte plus tard</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" variant="orange" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Connexion...
              </>
            ) : (
              "Continuer en tant qu'invité"
            )}
          </Button>
          
          {onSwitchToLogin && (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={isLoading}
            >
              Déjà un compte ? <span className="font-medium">Se connecter</span>
            </button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}