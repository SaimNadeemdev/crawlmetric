// Test script for browser authentication
console.log('Testing Supabase authentication in browser environment...');

// Use hardcoded Supabase credentials
const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg';

// Function to test authentication
async function testAuth() {
  try {
    // Create a Supabase client
    const { createClient } = supabase;
    const client = createClient(supabaseUrl, supabaseKey);
    
    // Test sign in
    const { data, error } = await client.auth.signInWithPassword({
      email: 'saimnadeem1011@gmail.com',
      password: 'Saimnadeem1!'
    });
    
    if (error) {
      console.error('Authentication error:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('Authentication successful!');
    console.log('User:', data.user);
    console.log('Session:', data.session);
    
    // Store session in localStorage
    localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
    
    // Test session
    const { data: sessionData } = await client.auth.getSession();
    console.log('Current session:', sessionData);
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Add a button to the page to test authentication
document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button');
  button.textContent = 'Test Authentication';
  button.style.padding = '10px 20px';
  button.style.margin = '20px';
  button.style.backgroundColor = '#4f46e5';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  
  button.addEventListener('click', testAuth);
  
  document.body.appendChild(button);
});
