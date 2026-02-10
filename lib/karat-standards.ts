/**
 * Karat/Purity standards and presets
 * Admins can select a preset as a starting point, then customize all values
 */

export interface KaratMapping {
  karat: number
  purity: number
}

export interface KaratStandard {
  id: string
  name: string
  description: string
  mappings: Record<string, number> // karat -> purity
}

export const KARAT_STANDARDS: KaratStandard[] = [
  {
    id: 'dubai',
    name: 'Dubai/GCC Standard',
    description: 'Standard for Middle East (999, 995, TT Bar)',
    mappings: {
      '999': 0.9990,
      '995': 0.9950,
      'TT Bar': 0.9990,
      '24': 0.9999,
      '22': 0.916,
      '21': 0.875,
      '18': 0.750,
    }
  },
]

export const DEFAULT_KARAT_MAPPINGS = KARAT_STANDARDS[0].mappings

/**
 * Get karat standard by ID
 */
export function getKaratStandard(id: string): KaratStandard | undefined {
  return KARAT_STANDARDS.find(s => s.id === id)
}

/**
 * Validate karat mappings
 */
export function validateKaratMappings(mappings: Record<string, number>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  Object.entries(mappings).forEach(([label, purity]) => {
    // Label can be anything now (995, TT Bar, etc.)
    if (!label || label.trim().length === 0) {
      errors.push(`Standard label cannot be empty.`)
    }
    
    const p = parseFloat(String(purity))
    if (isNaN(p) || p < 0 || p > 1.0) {
      errors.push(`Invalid purity for ${label}: ${purity}. Must be between 0 and 1.0.`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get purity for a given karat using company's custom mappings
 */
export function getPurityForKarat(
  karat: number,
  customMappings?: Record<string, number>
): number {
  const mappings = customMappings || DEFAULT_KARAT_MAPPINGS
  const karatStr = karat.toString()
  
  if (mappings[karatStr]) {
    return mappings[karatStr]
  }
  
  // Fallback: calculate based on 24K = 1.0 purity
  return karat / 24
}

/**
 * Get karat for a given purity using company's custom mappings
 */
export function getKaratForPurity(
  purity: number,
  customMappings?: Record<string, number>
): string {
  const mappings = customMappings || DEFAULT_KARAT_MAPPINGS
  
  // Find closest match
  let closestKarat = '24'
  let smallestDiff = 1.0
  
  Object.entries(mappings).forEach(([karat, karatPurity]) => {
    const diff = Math.abs(karatPurity - purity)
    if (diff < smallestDiff) {
      smallestDiff = diff
      closestKarat = karat
    }
  })
  
  return `${closestKarat}K`
}
