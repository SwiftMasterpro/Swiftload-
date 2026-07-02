import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function createFallbackClient() {
  const fallbackChannel = {
    on: () => fallbackChannel,
    subscribe: () => ({ unsubscribe() {} }),
  }

  const makeQueryBuilder = () => ({
    select: () => makeQueryBuilder(),
    eq: () => makeQueryBuilder(),
    order: () => makeQueryBuilder(),
    limit: async () => ({ data: [], error: null }),
    single: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
    update: () => makeQueryBuilder(),
    delete: () => makeQueryBuilder(),
  })

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: () => makeQueryBuilder(),
    channel: () => fallbackChannel,
    removeChannel: () => undefined,
  }
}

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return createFallbackClient() as any
  }

  return createClientComponentClient() as any
}
