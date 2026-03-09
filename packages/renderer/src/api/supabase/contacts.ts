import { supabase } from '@/lib/supabase'
import type { Contact } from '@/types'
import { rowsToCamel, rowToCamel, toSnakeCase, handleError } from './helpers'

export const contactsApi = {
  getAll: async (): Promise<Contact[]> => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<Contact>(data!)
  },
  getById: async (id: string): Promise<Contact | undefined> => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Contact>(data) : undefined
  },
  search: async (query: string): Promise<Contact[]> => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    if (error) handleError(error)
    return rowsToCamel<Contact>(data!)
  },
  create: async (
    contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Contact> => {
    const { data, error } = await supabase
      .from('contacts')
      .insert(toSnakeCase(contact as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Contact>(data!)
  },
  update: async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    const { data, error } = await supabase
      .from('contacts')
      .update(toSnakeCase(updates as unknown as Record<string, unknown>))
      .eq('id', id)
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Contact>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) handleError(error)
  },
}
