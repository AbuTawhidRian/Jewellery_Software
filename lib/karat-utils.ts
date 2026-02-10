/**
 * Convert purity to karat
 * @param purity - Purity as decimal standard (e.g., 0.9999, 0.9160, 0.7500)
 * @param customMappings - Optional custom karat-to-purity mappings
 * @returns Karat value as string (e.g., "24K", "22K", "18K")
 */
export function purityToKarat(purity: number, customMappings?: Record<string, number>): string {
  const purityNum = Number(purity)
  
  if (customMappings && Object.keys(customMappings).length > 0) {
    // Find closest match in custom mappings
    let closestKarat = ''
    let smallestDiff = 1.0
    
    Object.entries(customMappings).forEach(([karat, karatPurity]) => {
      const diff = Math.abs(Number(karatPurity) - purityNum)
      if (diff < smallestDiff) {
        smallestDiff = diff
        closestKarat = karat
      }
    })
    
    // Only return the custom karat if the difference is very small (e.g., 0.0005)
    // This allows for slight rounding differences in float storage
    if (smallestDiff < 0.0005) {
      // If it's a numeric karat like 22, add K. If it's a standard like 995, leave it as is.
      const isNamedStandard = isNaN(Number(closestKarat)) || Number(closestKarat) > 24
      return isNamedStandard ? closestKarat : `${closestKarat}K`
    }
  }

  // Fallback to standard mappings (decimal values)
  if (purityNum >= 0.999) return '24K'
  if (purityNum >= 0.995) return '995'
  if (purityNum >= 0.916) return '22K'
  if (purityNum >= 0.875) return '21K'
  if (purityNum >= 0.750) return '18K'
  
  return `${Math.round(purityNum * 24)}K`
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
 * @param type - TransactionType
 * @returns Tailwind CSS classes for badge
 */
export function getTransactionTypeColor(type: string): string {
  switch (type) {
    case 'METAL_RECEIPT':
    case 'CASH_RECEIPT':
    case 'METAL_RECEIPT_RETURN':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'METAL_PAYMENT':
    case 'CASH_PAYMENT':
    case 'METAL_SALE':
    case 'METAL_PURCHASE':
    case 'MAKING_CHARGE':
    case 'METAL_PAYMENT_RETURN':
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
    case 'METAL_PURCHASE':
      return 'Metal Purchase'
    case 'METAL_SALE':
      return 'Metal Sale'
    case 'METAL_RECEIPT':
      return 'Metal Receipt'
    case 'METAL_PAYMENT':
      return 'Metal Payment'
    case 'METAL_RECEIPT_RETURN':
      return 'Receipt Return'
    case 'METAL_PAYMENT_RETURN':
      return 'Payment Return'
    case 'CASH_RECEIPT':
      return 'Cash Receipt'
    case 'CASH_PAYMENT':
      return 'Cash Payment'
    case 'ADJUSTMENT':
      return 'Adjustment'
    case 'MAKING_CHARGE':
      return 'Making Charge'
    default:
      return type.replace(/_/g, ' ')
  }
}

