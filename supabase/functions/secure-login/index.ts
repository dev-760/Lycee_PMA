// Supabase Edge Function: secure-login
// This function handles user authentication securely on the server side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Create Supabase admin client (with service role key for elevated permissions)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request body
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email and password are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.trim().toLowerCase()

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    })

    if (authError || !authData.user) {
      // Don't reveal whether email exists or password is wrong (security best practice)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email or password' 
        }),
        { 
          status: 200, // Return 200 even on error to prevent user enumeration
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's role from the users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username, name, email, role, is_active')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user data:', userError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User account not found. Please contact administrator.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user account is active
    if (!userData.is_active) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Your account has been deactivated. Please contact administrator.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update last login timestamp
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id)

    // Get the session (contains access_token)
    const session = authData.session

    if (!session || !session.access_token) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create session' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success response with user data and session token
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role || 'user'
        },
        access_token: session.access_token,
        expires_at: session.expires_at || Math.floor(Date.now() / 1000) + 3600
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Login error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

