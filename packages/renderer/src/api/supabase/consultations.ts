import { supabase } from '@/lib/supabase'
import type { Consultation } from '@/types'
import { rowsToCamel, rowToCamel, toSnakeCase, handleError } from './helpers'

export const consultationsApi = {
  getAll: async (): Promise<Consultation[]> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('date', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<Consultation>(data!)
  },
  getByContactId: async (contactId: string): Promise<Consultation[]> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('contact_id', contactId)
      .order('date', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<Consultation>(data!)
  },
  getByPropertyId: async (propertyId: string): Promise<Consultation[]> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('property_id', propertyId)
      .order('date', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<Consultation>(data!)
  },
  getById: async (id: string): Promise<Consultation | undefined> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Consultation>(data) : undefined
  },
  create: async (
    consultation: Omit<Consultation, 'id' | 'createdAt'>,
  ): Promise<Consultation> => {
    const { data, error } = await supabase
      .from('consultations')
      .insert(toSnakeCase(consultation as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Consultation>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('consultations').delete().eq('id', id)
    if (error) handleError(error)
  },
}
