// Basic Supabase Usage Examples
// Import the configured Supabase client
import { supabase, supabaseHelpers } from '../../lib/supabase/client.js'

// Example 1: Authentication
async function authenticationExamples() {
  console.log('=== Authentication Examples ===')

  // Sign up a new user
  const { data: signUpData, error: signUpError } = await supabaseHelpers.signUp(
    'user@example.com',
    'securepassword123',
    { name: 'John Doe', role: 'user' }
  )

  if (signUpError) {
    console.error('Sign up error:', signUpError)
  } else {
    console.log('User signed up:', signUpData.user?.email)
  }

  // Sign in existing user
  const { data: signInData, error: signInError } = await supabaseHelpers.signIn(
    'user@example.com',
    'securepassword123'
  )

  if (signInError) {
    console.error('Sign in error:', signInError)
  } else {
    console.log('User signed in:', signInData.user?.email)
  }

  // Get current user
  const { user, error: userError } = await supabaseHelpers.getCurrentUser()
  if (userError) {
    console.error('Get user error:', userError)
  } else {
    console.log('Current user:', user?.email)
  }
}

// Example 2: Database Operations
async function databaseExamples() {
  console.log('=== Database Examples ===')

  // Create a simple table first (you would do this in Supabase dashboard)
  // Table: users (id, name, email, created_at)

  // Insert data
  const { data: insertData, error: insertError } = await supabaseHelpers.insert('users', {
    name: 'Jane Smith',
    email: 'jane@example.com'
  })

  if (insertError) {
    console.error('Insert error:', insertError)
  } else {
    console.log('Inserted user:', insertData)
  }

  // Select all users
  const { data: allUsers, error: selectError } = await supabaseHelpers.select('users')

  if (selectError) {
    console.error('Select error:', selectError)
  } else {
    console.log('All users:', allUsers)
  }

  // Select with filters
  const { data: filteredUsers, error: filterError } = await supabaseHelpers.select(
    'users',
    'name, email',
    { email: 'jane@example.com' }
  )

  if (filterError) {
    console.error('Filter error:', filterError)
  } else {
    console.log('Filtered users:', filteredUsers)
  }

  // Update user
  const { data: updateData, error: updateError } = await supabaseHelpers.update(
    'users',
    { name: 'Jane Doe' },
    { email: 'jane@example.com' }
  )

  if (updateError) {
    console.error('Update error:', updateError)
  } else {
    console.log('Updated user:', updateData)
  }
}

// Example 3: Advanced Queries
async function advancedQueryExamples() {
  console.log('=== Advanced Query Examples ===')

  // Complex query with multiple conditions
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      posts (
        id,
        title,
        content
      )
    `)
    .eq('active', true)
    .gte('created_at', '2024-01-01')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Advanced query error:', error)
  } else {
    console.log('Advanced query result:', data)
  }

  // Real-time subscription
  const subscription = supabase
    .channel('users_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users'
    }, (payload) => {
      console.log('Real-time update:', payload)
    })
    .subscribe()

  // Don't forget to unsubscribe when done
  // subscription.unsubscribe()
}

// Example 4: File Storage
async function storageExamples() {
  console.log('=== Storage Examples ===')

  // Upload file
  const file = new File(['Hello World'], 'hello.txt', { type: 'text/plain' })

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload('hello.txt', file)

  if (uploadError) {
    console.error('Upload error:', uploadError)
  } else {
    console.log('File uploaded:', uploadData)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl('hello.txt')

  console.log('Public URL:', urlData.publicUrl)

  // List files
  const { data: listData, error: listError } = await supabase.storage
    .from('documents')
    .list()

  if (listError) {
    console.error('List error:', listError)
  } else {
    console.log('Files:', listData)
  }
}

// Run examples (uncomment to test)
// authenticationExamples()
// databaseExamples()
// advancedQueryExamples()
// storageExamples()

export {
  authenticationExamples,
  databaseExamples,
  advancedQueryExamples,
  storageExamples
}