'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getTodayMetalRate } from '@/app/actions/metal-rates'
import { updateTodayMetalRate } from '@/app/actions/metal-rates'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

export function MetalRatesEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rates, setRates] = useState({
    gold24k: 0,
    gold22k: 0,
    gold18k: 0,
    silver: 0,
    updatedAt: new Date().toISOString(),
    isOldRate: false
  })

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await getTodayMetalRate()
        if (data) {
          setRates({
            gold24k: data.gold24k,
            gold22k: data.gold22k,
            gold18k: data.gold18k,
            silver: data.silver,
            updatedAt: data.updatedAt.toISOString(),
            isOldRate: !!data.isOldRate
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch rates', error)
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await updateTodayMetalRate({
        gold24k: Number(rates.gold24k),
        gold22k: Number(rates.gold22k),
        gold18k: Number(rates.gold18k),
        silver: Number(rates.silver),
      })
      toast.success('Metal rates updated successfully')
      
      // Refresh local state to update timestamp
      const data = await getTodayMetalRate()
      if (data) {
        setRates({
          gold24k: data.gold24k,
          gold22k: data.gold22k,
          gold18k: data.gold18k,
          silver: data.silver,
          updatedAt: data.updatedAt.toISOString(),
          isOldRate: !!data.isOldRate
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update rates')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Metal Rates</CardTitle>
              <CardDescription>
                Set today's rates ({format(new Date(), 'MMM dd, yyyy')}). Used for valuation and calculations.
              </CardDescription>
            </div>
            {rates.isOldRate && (
              <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200">
                Showing rates from {format(new Date(rates.updatedAt), 'MMM dd')}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gold24k">Gold 24K (per gram)</Label>
              <Input
                id="gold24k"
                type="number"
                step="0.01"
                value={rates.gold24k || ''}
                onChange={(e) => setRates({ ...rates, gold24k: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gold22k">Gold 22K (per gram)</Label>
              <Input
                id="gold22k"
                type="number"
                step="0.01"
                value={rates.gold22k || ''}
                onChange={(e) => setRates({ ...rates, gold22k: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gold18k">Gold 18K (per gram)</Label>
              <Input
                id="gold18k"
                type="number"
                step="0.01"
                value={rates.gold18k || ''}
                onChange={(e) => setRates({ ...rates, gold18k: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="silver">Silver (per gram)</Label>
              <Input
                id="silver"
                type="number"
                step="0.01"
                value={rates.silver || ''}
                onChange={(e) => setRates({ ...rates, silver: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Today's Rates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
