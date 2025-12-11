/**
 * Badge color mapping utilities
 */

/**
 * Get badge color based on patient status
 * @param status - Patient status ('active' | 'inactive' | 'archived')
 * @returns Badge color string
 */
export function getStatusColor(status: 'active' | 'inactive' | 'archived'): 'green' | 'orange' | 'zinc' {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'orange'
    case 'archived':
      return 'zinc'
    default:
      return 'zinc'
  }
}

/**
 * Get badge color based on activity action type
 * @param actionType - Activity action type from backend (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @returns Badge color string
 */
export function getActionColor(actionType: string): 'green' | 'blue' | 'red' | 'orange' | 'purple' | 'zinc' {
  const upperAction = actionType.toUpperCase()
  switch (upperAction) {
    case 'CREATE':
      return 'green'
    case 'UPDATE':
      return 'blue'
    case 'DELETE':
      return 'red'
    default:
      return 'zinc'
  }
}
