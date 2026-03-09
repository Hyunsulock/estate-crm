import { supabase } from '@/lib/supabase'
import type { BuyerRequirement } from '@/types'
import { rowsToCamel, rowToCamel, toSnakeCase, handleError } from './helpers'

export const buyerRequirementsApi = {
  getAll: async (): Promise<BuyerRequirement[]> => {
    const { data, error } = await supabase
      .from('buyer_requirements')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<BuyerRequirement>(data!)
  },
  getByContactId: async (contactId: string): Promise<BuyerRequirement[]> => {
    const { data, error } = await supabase
      .from('buyer_requirements')
      .select('*')
      .eq('contact_id', contactId)
    if (error) handleError(error)
    return rowsToCamel<BuyerRequirement>(data!)
  },
  getById: async (id: string): Promise<BuyerRequirement | undefined> => {
    const { data, error } = await supabase
      .from('buyer_requirements')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<BuyerRequirement>(data) : undefined
  },
  create: async (
    req: Omit<BuyerRequirement, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BuyerRequirement> => {
    const { data, error } = await supabase
      .from('buyer_requirements')
      .insert(toSnakeCase(req as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<BuyerRequirement>(data!)
  },
  update: async (
    id: string,
    updates: Partial<BuyerRequirement>,
  ): Promise<BuyerRequirement> => {
    const { data, error } = await supabase
      .from('buyer_requirements')
      .update(toSnakeCase(updates as unknown as Record<string, unknown>))
      .eq('id', id)
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<BuyerRequirement>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('buyer_requirements')
      .delete()
      .eq('id', id)
    if (error) handleError(error)
  },
}
