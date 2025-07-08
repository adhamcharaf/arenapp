"use client"

import { Smartphone, CreditCard, Banknote } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PaymentProvider } from "@/types/database"

interface PaymentMethod {
  id: PaymentProvider | 'cash'
  name: string
  description: string
  icon: React.ReactNode
  color: string
  recommended?: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'wave',
    name: 'Wave Money',
    description: 'Paiement mobile rapide et sécurisé',
    icon: <Smartphone className="h-6 w-6" />,
    color: 'bg-wave text-white',
    recommended: true
  },
  {
    id: 'orange',
    name: 'Orange Money',
    description: 'Payez avec votre compte Orange Money',
    icon: <Smartphone className="h-6 w-6" />,
    color: 'bg-orange-500 text-white'
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    description: 'Payez avec votre compte MTN',
    icon: <Smartphone className="h-6 w-6" />,
    color: 'bg-yellow-400 text-black'
  },
  {
    id: 'cash',
    name: 'Espèces sur place',
    description: 'Payez directement au terrain',
    icon: <Banknote className="h-6 w-6" />,
    color: 'bg-gray-100 text-gray-900'
  }
]

interface PaymentMethodsProps {
  selectedMethod: string | null
  onSelect: (method: string) => void
  amount: number
}

export function PaymentMethods({ selectedMethod, onSelect, amount }: PaymentMethodsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choisir un mode de paiement</CardTitle>
        <CardDescription>
          Sélectionnez votre méthode de paiement préférée
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={cn(
                "relative w-full rounded-lg border p-4 text-left transition-all hover:shadow-md",
                selectedMethod === method.id
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:border-gray-300"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "rounded-lg p-3",
                  method.color
                )}>
                  {method.icon}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{method.name}</h3>
                    {method.recommended && (
                      <Badge variant="ci" className="text-xs">
                        Recommandé
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>

                {selectedMethod === method.id && (
                  <div className="absolute right-4 top-4">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Information sur les frais */}
        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Note:</span> Aucuns frais supplémentaires pour les paiements mobiles. 
            Le montant affiché est le montant final.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}