import { supabase } from '@/lib/supabase'
import type { Insight, InsightStatus } from '@/types'
import { rowsToCamel, rowToCamel, toSnakeCase, handleError } from './helpers'

export const insightsApi = {
  getAll: async (): Promise<Insight[]> => {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<Insight>(data!)
  },
  getPending: async (): Promise<Insight[]> => {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<Insight>(data!)
  },
  getById: async (id: string): Promise<Insight | undefined> => {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Insight>(data) : undefined
  },
  updateStatus: async (
    id: string,
    status: InsightStatus,
    reason?: string,
  ): Promise<Insight> => {
    const updates: Record<string, unknown> = { status }
    if (reason) updates.dismissed_reason = reason
    const { data, error } = await supabase
      .from('insights')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Insight>(data!)
  },
  create: async (
    insight: Omit<Insight, 'id' | 'createdAt'>,
  ): Promise<Insight> => {
    const { data, error } = await supabase
      .from('insights')
      .insert(toSnakeCase(insight as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Insight>(data!)
  },
}
