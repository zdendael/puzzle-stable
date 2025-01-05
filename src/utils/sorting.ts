export function sortData<T>(data: T[], sortKey: string, direction: 'asc' | 'desc' | null): T[] {
  if (!sortKey || !direction) return data

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortKey)
    const bValue = getNestedValue(b, sortKey)

    if (direction === 'asc') {
      return compareValues(aValue, bValue)
    } else {
      return compareValues(bValue, aValue)
    }
  })
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj)
}

function compareValues(a: any, b: any): number {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b, 'cs')
  }
  if (a === b) return 0
  if (a === null || a === undefined) return -1
  if (b === null || b === undefined) return 1
  return a < b ? -1 : 1
}