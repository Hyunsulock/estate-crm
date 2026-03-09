import { supabase } from '@/lib/supabase'
import type { Ownership } from '@/types'
import { rowsToCamel, rowToCamel, toSnakeCase, handleError } from './helpers'

export const ownershipsApi = {
  getAll: async (): Promise<Ownership[]> => {
    const { data, error } = await supabase.from('ownerships').select('*')
    if (error) handleError(error)
    return rowsToCamel<Ownership>(data!)
  },
  getByUnitId: async (unitId: string): Promise<Ownership[]> => {
    const { data, error } = await supabase
      .from('ownerships')
      .select('*')
      .eq('unit_id', unitId)
      .eq('status', 'active')
    if (error) handleError(error)
    return rowsToCamel<Ownership>(data!)
  },
  getByContactId: async (contactId: string): Promise<Ownership[]> => {
    const { data, error } = await supabase
      .from('ownerships')
      .select('*')
      .eq('contact_id', contactId)
    if (error) handleError(error)
    return rowsToCamel<Ownership>(data!)
  },
  getById: async (id: string): Promise<Ownership | undefined> => {
    const { data, error } = await supabase
      .from('ownerships')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Ownership>(data) : undefined
  },
  create: async (
    ownership: Omit<Ownership, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Ownership> => {
    const { data, error } = await supabase
      .from('ownerships')
      .insert(toSnakeCase(ownership as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Ownership>(data!)
  },
  update: async (id: string, updates: Partial<Ownership>): Promise<Ownership> => {
    const { data, error } = await supabase
      .from('ownerships')
      .update(toSnakeCase(updates as unknown as Record<string, unknown>))
      .eq('id', id)
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Ownership>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('ownerships').delete().eq('id', id)
    if (error) handleError(error)
  },
}
