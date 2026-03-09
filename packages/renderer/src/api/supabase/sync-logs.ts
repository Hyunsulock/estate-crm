import { supabase } from '@/lib/supabase'
import type { SyncLog } from '@/types'
import { rowsToCamel, handleError } from './helpers'

export const syncLogsApi = {
  getAll: async (): Promise<SyncLog[]> => {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('synced_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<SyncLog>(data!)
  },
  getRecent: async (limit = 10): Promise<SyncLog[]> => {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(limit)
    if (error) handleError(error)
    return rowsToCamel<SyncLog>(data!)
  },
}
