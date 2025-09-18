import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication helpers
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Database helpers
  async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    return { data: result, error }
  },

  async select(table, columns = '*', filters = {}) {
    let query = supabase.from(table).select(columns)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value.operator) {
        query = query[value.operator](key, value.value)
      } else {
        query = query.eq(key, value)
      }
    })

    const { data, error } = await query
    return { data, error }
  },

  async update(table, updates, filters) {
    let query = supabase.from(table).update(updates)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query.select()
    return { data, error }
  },

  async delete(table, filters) {
    let query = supabase.from(table).delete()

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query
    return { data, error }
  }
}

export default supabase