// Supabase Edge Function: update-password
// This function handles updating user passwords securely

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

        // Get the access token from the Authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing or invalid authorization token'
                }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const accessToken = authHeader.replace('Bearer ', '')

        // Parse request body
        const { password } = await req.json()

        if (!password) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'New password is required'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Validate password strength
        if (password.length < 8) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Password must be at least 8 characters long'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Create Supabase admin client
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Verify the token and get user info
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)

        if (userError || !userData.user) {
            console.error('Token verification error:', userError)
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid or expired reset link. Please request a new password reset.'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const user = userData.user

        // Update the user's password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
                password: password
            }
        )

        if (updateError) {
            console.error('Error updating password:', updateError)
            throw new Error('Failed to update password')
        }

        // Update the users table with password change timestamp
        await supabaseAdmin
            .from('users')
            .update({
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Password updated successfully'
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Password update error:', error)
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
