/**
 * Utility functions for converting between purity percentage and karat values
 */

/**
 * Convert purity percentage to karat
 * @param purity - Purity as percentage (e.g., 99.99, 91.60, 75.00)
 * @param customMappings - Optional custom karat-to-purity mappings
 * @returns Karat value as string (e.g., "24K", "22K", "18K")
 */
export function purityToKarat(purity: number, customMappings?: Record<string, number>): string {
  if (customMappings && Object.keys(customMappings).length > 0) {
    // Find closest match in custom mappings
    let closestKarat = '24'
    let smallestDiff = 100
    
    Object.entries(customMappings).forEach(([karat, karatPurity]) => {
      const diff = Math.abs(karatPurity - purity)
      if (diff < smallestDiff) {
        smallestDiff = diff
        closestKarat = karat
      }
    })
    
    // Only return the custom karat if the difference is small enough (e.g., 0.5%)
    if (smallestDiff < 0.5) {
      return `${closestKarat}K`
    }
  }

  // Fallback to standard mappings
  if (purity >= 99.0) return '24K'
  if (purity >= 95.8) return '23K'
  if (purity >= 91.6) return '22K'
  if (purity >= 87.5) return '21K'
  if (purity >= 83.3) return '20K'
  if (purity >= 79.2) return '19K'
  if (purity >= 75.0) return '18K'
  if (purity >= 58.5) return '14K'
  if (purity >= 41.7) return '10K'
  return `${Math.round((purity / 100) * 24)}K`
}

/**
 * Convert karat to purity percentage
 * @param karat - Karat value (e.g., 24, 22, 18)
 * @returns Purity as percentage
 */
export function karatToPurity(karat: number): number {
  return (karat / 24) * 100
}

/**
 * Format purity for display with karat equivalent
 * @param purity - Purity as percentage
 * @param customMappings - Optional custom karat-to-purity mappings
 * @returns Formatted string (e.g., "99.99% (24K)")
 */
export function formatPurity(purity: number, customMappings?: Record<string, number>): string {
  const purityStr = Number(purity).toFixed(2)
  const karat = purityToKarat(purity, customMappings)
  return `${purityStr}% (${karat})`
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
