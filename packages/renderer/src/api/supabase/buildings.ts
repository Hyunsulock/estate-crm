import { supabase } from '@/lib/supabase'
import type { Building, Dong, Unit } from '@/types'
import { rowsToCamel, rowToCamel, toSnakeCase, handleError } from './helpers'

export const buildingsApi = {
  getAll: async (): Promise<Building[]> => {
    const { data, error } = await supabase.from('buildings').select('*')
    if (error) handleError(error)
    return rowsToCamel<Building>(data!)
  },
  getById: async (id: string): Promise<Building | undefined> => {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Building>(data) : undefined
  },
  search: async (query: string): Promise<Building[]> => {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
    if (error) handleError(error)
    return rowsToCamel<Building>(data!)
  },
  create: async (
    building: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Building> => {
    const { data, error } = await supabase
      .from('buildings')
      .insert(toSnakeCase(building as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Building>(data!)
  },
  update: async (id: string, updates: Partial<Building>): Promise<Building> => {
    const { data, error } = await supabase
      .from('buildings')
      .update(toSnakeCase(updates as unknown as Record<string, unknown>))
      .eq('id', id)
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Building>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('buildings').delete().eq('id', id)
    if (error) handleError(error)
  },
}

export const dongsApi = {
  getAll: async (): Promise<Dong[]> => {
    const { data, error } = await supabase.from('dongs').select('*')
    if (error) handleError(error)
    return rowsToCamel<Dong>(data!)
  },
  getByBuildingId: async (buildingId: string): Promise<Dong[]> => {
    const { data, error } = await supabase
      .from('dongs')
      .select('*')
      .eq('building_id', buildingId)
    if (error) handleError(error)
    return rowsToCamel<Dong>(data!)
  },
  getById: async (id: string): Promise<Dong | undefined> => {
    const { data, error } = await supabase
      .from('dongs')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Dong>(data) : undefined
  },
  create: async (dong: Omit<Dong, 'id' | 'createdAt'>): Promise<Dong> => {
    const { data, error } = await supabase
      .from('dongs')
      .insert(toSnakeCase(dong as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Dong>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('dongs').delete().eq('id', id)
    if (error) handleError(error)
  },
}

export const unitsApi = {
  getAll: async (): Promise<Unit[]> => {
    const { data, error } = await supabase.from('units').select('*')
    if (error) handleError(error)
    return rowsToCamel<Unit>(data!)
  },
  getByDongId: async (dongId: string): Promise<Unit[]> => {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('dong_id', dongId)
    if (error) handleError(error)
    return rowsToCamel<Unit>(data!)
  },
  getByBuildingId: async (buildingId: string): Promise<Unit[]> => {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('building_id', buildingId)
    if (error) handleError(error)
    return rowsToCamel<Unit>(data!)
  },
  getById: async (id: string): Promise<Unit | undefined> => {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Unit>(data) : undefined
  },
  create: async (
    unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Unit> => {
    const { data, error } = await supabase
      .from('units')
      .insert(toSnakeCase(unit as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Unit>(data!)
  },
  update: async (id: string, updates: Partial<Unit>): Promise<Unit> => {
    const { data, error } = await supabase
      .from('units')
      .update(toSnakeCase(updates as unknown as Record<string, unknown>))
      .eq('id', id)
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Unit>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('units').delete().eq('id', id)
    if (error) handleError(error)
  },
}
