import { supabase } from '@/lib/supabase'
import type { ExternalFeed } from '@/types'
import { rowsToCamel, rowToCamel, handleError } from './helpers'

export const externalFeedsApi = {
  getAll: async (): Promise<ExternalFeed[]> => {
    const { data, error } = await supabase
      .from('external_feeds')
      .select('*')
      .order('synced_at', { ascending: false })
    if (error) handleError(error)
    return rowsToCamel<ExternalFeed>(data!)
  },
  getByComplex: async (complex: string): Promise<ExternalFeed[]> => {
    const { data, error } = await supabase
      .from('external_feeds')
      .select('*')
      .ilike('complex', `%${complex}%`)
    if (error) handleError(error)
    return rowsToCamel<ExternalFeed>(data!)
  },
  getByArticleNo: async (articleNo: string): Promise<ExternalFeed | undefined> => {
    const { data, error } = await supabase
      .from('external_feeds')
      .select('*')
      .eq('article_no', articleNo)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<ExternalFeed>(data) : undefined
  },
  getById: async (id: string): Promise<ExternalFeed | undefined> => {
    const { data, error } = await supabase
      .from('external_feeds')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<ExternalFeed>(data) : undefined
  },
  search: async (query: string): Promise<ExternalFeed[]> => {
    const { data, error } = await supabase
      .from('external_feeds')
      .select('*')
      .or(
        `complex.ilike.%${query}%,article_no.ilike.%${query}%,realtor_name.ilike.%${query}%`,
      )
    if (error) handleError(error)
    return rowsToCamel<ExternalFeed>(data!)
  },
}
