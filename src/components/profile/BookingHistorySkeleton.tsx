'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function BookingHistorySkeleton() {
  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="pt-4">
        {/* Filtres skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
        
        {/* Réservations skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}