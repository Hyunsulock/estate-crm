import { supabase } from '@/lib/supabase'
import type { Task } from '@/types'
import { rowsToCamel, rowToCamel, toSnakeCase, handleError } from './helpers'

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<Task>(data!)
  },
  getByAssignee: async (userId: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true })
    if (error) handleError(error)
    return rowsToCamel<Task>(data!)
  },
  getById: async (id: string): Promise<Task | undefined> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<Task>(data) : undefined
  },
  create: async (
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(toSnakeCase(task as unknown as Record<string, unknown>))
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Task>(data!)
  },
  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update(toSnakeCase(updates as unknown as Record<string, unknown>))
      .eq('id', id)
      .select()
      .single()
    if (error) handleError(error)
    return rowToCamel<Task>(data!)
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) handleError(error)
  },
}
