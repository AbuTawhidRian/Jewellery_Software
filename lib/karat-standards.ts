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
      '24': 0.9999,
      '23': 0.958,
      '22': 0.9167,
      '21': 0.875,
      '20': 0.8333,
      '18': 0.750,
      '14': 0.585,
      '10': 0.417,
    }
  },
  {
    id: 'middle_east',
    name: 'Middle East Standard',
    description: 'Common in UAE, Saudi Arabia, Qatar',
    mappings: {
      '24': 0.9999,
      '22': 0.916,
      '21': 0.875,
      '18': 0.750,
    }
  },
  {
    id: 'indian',
    name: 'Indian Standard',
    description: 'Popular in India and South Asia',
    mappings: {
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
  
  Object.entries(mappings).forEach(([karat, purity]) => {
    const k = parseFloat(karat)
    const p = parseFloat(String(purity))
    
    if (isNaN(k) || k <= 0 || k > 24) {
      errors.push(`Invalid karat value: ${karat}. Must be between 0 and 24.`)
    }
    
    if (isNaN(p) || p < 0 || p > 1.0) {
      errors.push(`Invalid purity for ${karat}K: ${purity}. Must be between 0 and 1.0.`)
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
