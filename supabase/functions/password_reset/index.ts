// Supabase Edge Function: password_reset
// This function triggers Supabase's built-in password reset email
// Email templates are configured in Supabase Dashboard > Authentication > Emails

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Production redirect URL for password reset
const RESET_PASSWORD_URL = 'https://lyceepma.vercel.app/admin/reset-password'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('[password_reset] Starting password reset request')

    if (!supabaseUrl) {
      console.error('[password_reset] Missing SUPABASE_URL')
      throw new Error('Missing SUPABASE_URL environment variable')
    }

    if (!supabaseServiceKey) {
      console.error('[password_reset] Missing SUPABASE_SERVICE_ROLE_KEY')
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request body
    const { email } = await req.json()
    console.log('[password_reset] Request for email:', email?.substring(0, 3) + '***')

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email is required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase()

    // Check if user exists in our users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', normalizedEmail)
      .single()

    // Always return success to prevent email enumeration
    // Even if user doesn't exist, we don't reveal that
    if (!userData || userError) {
      console.log('[password_reset] User not found or error:', userError?.message)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'If an account exists with this email, a reset link has been sent.'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[password_reset] User found, sending reset email using Supabase templates')

    // Use Supabase's built-in password reset
    // This uses the email template configured in Supabase Dashboard > Authentication > Emails
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: RESET_PASSWORD_URL
      }
    )

    if (resetError) {
      console.error('[password_reset] Error sending reset email:', resetError.message)
      throw new Error(`Failed to send reset email: ${resetError.message}`)
    }

    console.log('[password_reset] Reset email sent successfully to:', normalizedEmail)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset email sent successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[password_reset] Error:', errorMessage)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        details: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
