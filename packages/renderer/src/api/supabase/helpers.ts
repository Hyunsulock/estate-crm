// snake_case ↔ camelCase 변환 헬퍼

/** camelCase 객체를 snake_case로 변환 (1단계만) */
export function toSnakeCase<T extends Record<string, unknown>>(
  obj: T,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
    result[snakeKey] = value
  }
  return result
}

/** snake_case 객체를 camelCase로 변환 (1단계만) */
export function toCamelCase<T extends Record<string, unknown>>(
  obj: T,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = value
  }
  return result
}

/** DB 행 배열을 camelCase로 변환 */
export function rowsToCamel<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((row) => toCamelCase(row) as T)
}

/** DB 행 하나를 camelCase로 변환 */
export function rowToCamel<T>(row: Record<string, unknown>): T {
  return toCamelCase(row) as T
}

/** Supabase 에러 처리 */
export function handleError(error: { message: string; code?: string }): never {
  throw new Error(`Supabase error: ${error.message}`)
}
