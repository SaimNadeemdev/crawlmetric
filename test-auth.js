// Test script to check Supabase authentication
const { createClient } = require('@supabase/supabase-js')

// Use the hardcoded values from supabase.ts
const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  console.log('Testing Supabase authentication...')
  
  try {
    // Test sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'saimnadeem1011@gmail.com',
      password: 'Saimnadeem1!'
    })
    
    if (error) {
      console.error('Authentication error:', error.message)
      console.error('Error details:', error)
      return
    }
    
    console.log('Authentication successful!')
    console.log('User:', data.user)
    console.log('Session:', data.session)
    
    // Test session
    const { data: sessionData } = await supabase.auth.getSession()
    console.log('Current session:', sessionData)
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testAuth()
