import { supabase } from '@/lib/supabase'
import type { Property, PropertyFull } from '@/types'
import { rowsToCamel, rowToCamel, toSnakeCase, handleError } from './helpers'

export const propertiesApi = {
  getAll: async (): Promise<Property[]> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<Property>(data!)
  },
  getAllFull: async (): Promise<PropertyFull[]> => {
    const { data, error } = await supabase
      .from('properties_full')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<PropertyFull>(data!)
  },
  getById: async (id: string): Promise<Property | undefined> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Property>(data) : undefined
  },
  getByIdFull: async (id: string): Promise<PropertyFull | undefined> => {
    const { data, error } = await supabase
      .from('properties_full')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<PropertyFull>(data) : undefined
  },
  create: async (
    property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .insert(toSnakeCase(property as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Property>(data!)
  },
  update: async (id: string, updates: Partial<Property>): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .update(toSnakeCase(updates as unknown as Record<string, unknown>))
      .eq('id', id)
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Property>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) handleError(error)
  },
}
