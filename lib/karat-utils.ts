/**
 * Convert purity to karat
 * @param purity - Purity as decimal standard (e.g., 0.9999, 0.9160, 0.7500)
 * @param customMappings - Optional custom karat-to-purity mappings
 * @returns Karat value as string (e.g., "24K", "22K", "18K")
 */
export function purityToKarat(purity: number, customMappings?: Record<string, number>): string {
  if (customMappings && Object.keys(customMappings).length > 0) {
    // Find closest match in custom mappings
    let closestKarat = '24'
    let smallestDiff = 1.0
    
    Object.entries(customMappings).forEach(([karat, karatPurity]) => {
      const diff = Math.abs(karatPurity - purity)
      if (diff < smallestDiff) {
        smallestDiff = diff
        closestKarat = karat
      }
    })
    
    // Only return the custom karat if the difference is small enough (e.g., 0.005)
    if (smallestDiff < 0.005) {
      return `${closestKarat}K`
    }
  }

  // Fallback to standard mappings (decimal values)
  if (purity >= 0.990) return '24K'
  if (purity >= 0.958) return '23K'
  if (purity >= 0.916) return '22K'
  if (purity >= 0.875) return '21K'
  if (purity >= 0.833) return '20K'
  if (purity >= 0.792) return '19K'
  if (purity >= 0.750) return '18K'
  if (purity >= 0.585) return '14K'
  if (purity >= 0.417) return '10K'
  return `${Math.round(purity * 24)}K`
}

/**
 * Convert karat to purity decimal
 * @param karat - Karat value (e.g., 24, 22, 18)
 * @returns Purity as decimal
 */
export function karatToPurity(karat: number): number {
  return karat / 24
}

/**
 * Format purity for display with karat equivalent
 * @param purity - Purity as decimal
 * @param customMappings - Optional custom karat-to-purity mappings
 * @returns Formatted string (e.g., "0.9999 (24K)")
 */
export function formatPurity(purity: number, customMappings?: Record<string, number>): string {
  const purityStr = Number(purity).toFixed(4)
  const karat = purityToKarat(purity, customMappings)
  return `${purityStr} (${karat})`
}


/**
 * Get color class for transaction type badge
 * @param type - GoldTransactionType
 * @returns Tailwind CSS classes for badge
 */
export function getTransactionTypeColor(type: string): string {
  switch (type) {
    case 'RECEIVE':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'PAY':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'ADJUSTMENT':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Format transaction type for display
 * @param type - TransactionType
 * @returns Human-readable transaction type
 */
export function formatTransactionType(type: string): string {
  switch (type) {
    case 'RECEIVE':
      return 'Receive'
    case 'PAY':
      return 'Pay'
    case 'ADJUSTMENT':
      return 'Adjustment'
    default:
      return type
  }
}
