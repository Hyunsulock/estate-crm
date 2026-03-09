import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import { rowsToCamel, rowToCamel, handleError } from './helpers'

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*')
    if (error) handleError(error)
    return rowsToCamel<User>(data!)
  },
  getById: async (id: string): Promise<User | undefined> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) handleError(error)
    return data ? rowToCamel<User>(data) : undefined
  },
  getCurrent: async (): Promise<User> => {
    // TODO: auth.getUser()로 실제 인증 사용자 가져오기
    // 현재는 첫 번째 사용자 반환
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single()
    if (error) handleError(error)
    return rowToCamel<User>(data!)
  },
}
