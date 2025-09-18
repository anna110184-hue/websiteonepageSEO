// React Integration Examples with Supabase
import React, { useState, useEffect } from 'react'
import { supabase, supabaseHelpers } from '../../lib/supabase/client.js'

// Custom hook for authentication
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// Custom hook for real-time data
export function useRealtimeData(table, filter = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let subscription

    const fetchInitialData = async () => {
      const { data: initialData, error: fetchError } = await supabaseHelpers.select(table, '*', filter)

      if (fetchError) {
        setError(fetchError)
      } else {
        setData(initialData || [])
      }
      setLoading(false)
    }

    const setupRealtimeSubscription = () => {
      subscription = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: table
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item =>
              item.id === payload.new.id ? payload.new : item
            ))
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => item.id !== payload.old.id))
          }
        })
        .subscribe()
    }

    fetchInitialData()
    setupRealtimeSubscription()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [table, JSON.stringify(filter)])

  return { data, loading, error }
}

// Login Component
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await supabaseHelpers.signIn(email, password)

    if (loginError) {
      setError(loginError.message)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}

// Data List Component with real-time updates
export function UserList() {
  const { data: users, loading, error } = useRealtimeData('users')
  const [newUserName, setNewUserName] = useState('')
  const [adding, setAdding] = useState(false)

  const addUser = async (e) => {
    e.preventDefault()
    if (!newUserName.trim()) return

    setAdding(true)

    const { error: addError } = await supabaseHelpers.insert('users', {
      name: newUserName,
      email: `${newUserName.toLowerCase().replace(' ', '.')}@example.com`
    })

    if (!addError) {
      setNewUserName('')
    }

    setAdding(false)
  }

  if (loading) return <div>Loading users...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h3>Users (Real-time)</h3>

      <form onSubmit={addUser}>
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Enter user name"
        />
        <button type="submit" disabled={adding}>
          {adding ? 'Adding...' : 'Add User'}
        </button>
      </form>

      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Main App Component
export function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Supabase React App</h1>

      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={() => supabaseHelpers.signOut()}>
            Sign Out
          </button>
          <UserList />
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  )
}

export default App