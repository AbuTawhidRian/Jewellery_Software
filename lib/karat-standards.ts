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
    id: 'international',
    name: 'International Standard',
    description: 'Commonly used worldwide',
    mappings: {
      '24': 99.9,
      '23': 95.8,
      '22': 91.67,
      '21': 87.5,
      '20': 83.33,
      '18': 75.0,
      '14': 58.5,
      '10': 41.7,
    }
  },
  {
    id: 'middle_east',
    name: 'Middle East Standard',
    description: 'Common in UAE, Saudi Arabia, Qatar',
    mappings: {
      '24': 99.9,
      '22': 91.6,
      '21': 87.5,
      '18': 75.0,
    }
  },
  {
    id: 'indian',
    name: 'Indian Standard',
    description: 'Popular in India and South Asia',
    mappings: {
      '24': 99.9,
      '22': 91.6,
      '21': 87.5,
      '18': 75.0,
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
  
  Object.entries(mappings).forEach(([karat, purity]) => {
    const k = parseFloat(karat)
    const p = parseFloat(String(purity))
    
    if (isNaN(k) || k <= 0 || k > 24) {
      errors.push(`Invalid karat value: ${karat}. Must be between 0 and 24.`)
    }
    
    if (isNaN(p) || p < 0 || p > 100) {
      errors.push(`Invalid purity for ${karat}K: ${purity}. Must be between 0 and 100.`)
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
  
  // Fallback: calculate based on 24K = 100% purity
  return (karat / 24) * 100
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
  let smallestDiff = 100
  
  Object.entries(mappings).forEach(([karat, karatPurity]) => {
    const diff = Math.abs(karatPurity - purity)
    if (diff < smallestDiff) {
      smallestDiff = diff
      closestKarat = karat
    }
  })
  
  return `${closestKarat}K`
}
