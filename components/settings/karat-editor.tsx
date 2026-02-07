'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Plus, Info } from 'lucide-react'
import { KARAT_STANDARDS } from '@/lib/karat-standards'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface KaratEditorProps {
  value: Record<string, number>
  onChange: (value: Record<string, number>) => void
}

export function KaratEditor({ value, onChange }: KaratEditorProps) {
  const [karatList, setKaratList] = useState(
    Object.entries(value).map(([karat, purity]) => ({
      id: Math.random().toString(36).substr(2, 9),
      karat,
      purity,
    })).sort((a, b) => Number(b.karat) - Number(a.karat))
  )

  const handleUpdate = (updatedList: typeof karatList) => {
    setKaratList(updatedList)
    const newValue: Record<string, number> = {}
    updatedList.forEach((item) => {
      if (item.karat) {
        newValue[item.karat] = item.purity
      }
    })
    onChange(newValue)
  }

  const addKarat = () => {
    const newList = [
      ...karatList,
      { id: Math.random().toString(36).substr(2, 9), karat: '', purity: 0 },
    ]
    setKaratList(newList)
  }

  const removeKarat = (id: string) => {
    const newList = karatList.filter((item) => item.id !== id)
    handleUpdate(newList)
  }

  const updateItem = (id: string, field: 'karat' | 'purity', val: string | number) => {
    const newList = karatList.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: val }
      }
      return item
    })
    handleUpdate(newList)
  }

  const loadPreset = (presetId: string) => {
    const preset = KARAT_STANDARDS.find((s) => s.id === presetId)
    if (preset) {
      const newList = Object.entries(preset.mappings).map(([karat, purity]) => ({
        id: Math.random().toString(36).substr(2, 9),
        karat,
        purity,
      })).sort((a, b) => Number(b.karat) - Number(a.karat))
      handleUpdate(newList)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label>Karat Standards</Label>
          <p className="text-sm text-muted-foreground">
            Configure purity percentage for each karat value
          </p>
        </div>
        <Select onValueChange={loadPreset}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Load Preset" />
          </SelectTrigger>
          <SelectContent>
            {KARAT_STANDARDS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These mappings are used to calculate gold weight across the application.
          Changes will affect future calculations and display.
        </AlertDescription>
      </Alert>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Karat (K)</TableHead>
              <TableHead>Purity (%)</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {karatList.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={item.karat}
                      onChange={(e) => updateItem(item.id, 'karat', e.target.value)}
                      placeholder="22"
                      className="w-20"
                    />
                    <span>K</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.purity}
                    onChange={(e) => updateItem(item.id, 'purity', parseFloat(e.target.value) || 0)}
                    placeholder="91.6"
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKarat(item.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {karatList.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No karat mappings defined. Click add to start.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Button variant="outline" onClick={addKarat} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Karat Mapping
      </Button>
    </div>
  )
}
