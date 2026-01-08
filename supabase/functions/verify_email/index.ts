// Supabase Edge Function: verify-email
// This function handles email verification for user accounts

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
                    error: 'Invalid or expired verification link'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const user = userData.user

        // Check if email is already verified
        if (user.email_confirmed_at) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Email already verified',
                    alreadyVerified: true
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Update user's email verification status
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
                email_confirm: true
            }
        )

        if (updateError) {
            console.error('Error updating user verification:', updateError)
            throw new Error('Failed to verify email')
        }

        // Update the users table to mark email as verified if there's such a column
        await supabaseAdmin
            .from('users')
            .update({
                is_active: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email verified successfully',
                user: {
                    id: user.id,
                    email: user.email
                }
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Email verification error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: 'An unexpected error occurred during verification'
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
