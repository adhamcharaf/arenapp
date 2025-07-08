"use client"

import { useState, useEffect } from "react"
import { Phone, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/common/LoadingStates"
import { usePayments } from "@/hooks/usePayments"
import { formatCurrency } from "@/lib/utils"
import { PHONE_REGEX } from "@/utils/constants"

interface WavePaymentProps {
  bookingId: string
  amount: number
  onSuccess: () => void
  onCancel: () => void
}

type PaymentStep = 'phone' | 'processing' | 'waiting' | 'success' | 'error'

export function WavePayment({ bookingId, amount, onSuccess, onCancel }: WavePaymentProps) {
  const [step, setStep] = useState<PaymentStep>('phone')
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [checkCount, setCheckCount] = useState(0)
  
  const { initiatePayment, checkPaymentStatus } = usePayments()

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const limited = cleaned.slice(0, 10)
    
    if (limited.length <= 2) return limited
    if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`
    if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`
    if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation du téléphone
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError("Numéro de téléphone invalide")
      return
    }

    setStep('processing')

    try {
      const result = await initiatePayment({
        booking_id: bookingId,
        amount,
        provider: 'wave',
        phone_number: cleanPhone
      })

      if (result.error) {
        setError(result.error)
        setStep('error')
      } else if (result.paymentId) {
        setPaymentId(result.paymentId)
        setStep('waiting')
      }
    } catch (err) {
      setError("Une erreur est survenue")
      setStep('error')
    }
  }

  // Vérifier le statut du paiement périodiquement
  useEffect(() => {
    if (step !== 'waiting' || !paymentId) return

    const checkStatus = async () => {
      try {
        const result = await checkPaymentStatus('wave', paymentId)
        
        if (result.status === 'completed') {
          setStep('success')
          setTimeout(onSuccess, 2000)
        } else if (result.status === 'failed') {
          setError("Le paiement a échoué")
          setStep('error')
        } else {
          // Continuer à vérifier
          setCheckCount(prev => prev + 1)
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du statut:", err)
      }
    }

    // Vérifier toutes les 3 secondes, max 20 fois (1 minute)
    if (checkCount < 20) {
      const timer = setTimeout(checkStatus, 3000)
      return () => clearTimeout(timer)
    } else {
      setError("Délai d'attente dépassé. Veuillez vérifier votre téléphone.")
      setStep('error')
    }
  }, [step, paymentId, checkCount, checkPaymentStatus, onSuccess])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Paiement Wave</CardTitle>
          <div className="h-10 w-10 rounded-full bg-wave flex items-center justify-center">
            <span className="text-white font-bold">W</span>
          </div>
        </div>
        <CardDescription>
          Montant à payer: <span className="font-bold text-primary">{formatCurrency(amount)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Étape 1: Saisie du numéro */}
        {step === 'phone' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro Wave</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <div className="absolute left-10 top-3 text-sm text-muted-foreground">+225</div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07 00 00 00 00"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-20"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Entrez le numéro associé à votre compte Wave
              </p>
            </div>

            <Button type="submit" className="w-full" variant="wave">
              Continuer
            </Button>
          </form>
        )}

        {/* Étape 2: Traitement */}
        {step === 'processing' && (
          <div className="text-center py-8">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-wave" />
            <p className="text-muted-foreground">Initialisation du paiement...</p>
          </div>
        )}

        {/* Étape 3: En attente de confirmation */}
        {step === 'waiting' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Clock className="h-12 w-12 mx-auto mb-4 text-wave animate-pulse" />
              <h3 className="font-semibold mb-2">En attente de confirmation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Veuillez confirmer le paiement sur votre téléphone Wave
              </p>
              <Badge variant="wave" className="mb-4">
                +225 {phoneNumber}
              </Badge>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Instructions:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Ouvrez l'application Wave sur votre téléphone</li>
                <li>Confirmez la demande de paiement de {formatCurrency(amount)}</li>
                <li>Entrez votre code PIN Wave</li>
                <li>Attendez la confirmation ici</li>
              </ol>
            </div>

            <div className="flex items-center justify-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-wave animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Étape 4: Succès */}
        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold text-lg mb-2">Paiement réussi!</h3>
            <p className="text-muted-foreground">
              Votre réservation est confirmée
            </p>
          </div>
        )}

        {/* Étape 5: Erreur */}
        {step === 'error' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <h3 className="font-semibold text-lg mb-2">Paiement échoué</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Annuler
              </Button>
              <Button
                variant="wave"
                className="flex-1"
                onClick={() => {
                  setStep('phone')
                  setError("")
                  setCheckCount(0)
                }}
              >
                Réessayer
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {(step === 'phone' || step === 'waiting') && (
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={onCancel}
          >
            Choisir un autre mode de paiement
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}