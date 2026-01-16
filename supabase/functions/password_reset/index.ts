// Supabase Edge Function: password_reset
// This function handles sending password reset emails with custom templates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email templates for each language
const getEmailTemplate = (locale: string, resetLink: string) => {
  const templates = {
    ar: {
      subject: 'إعادة تعيين كلمة المرور - ثانوية الأمير مولاي عبد الله',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>إعادة تعيين كلمة المرور</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ثانوية الأمير مولاي عبد الله</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">جريدة المدرسة الإلكترونية</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h2>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 30px;">
                لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذه الرسالة.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                  إعادة تعيين كلمة المرور
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                ملاحظة: هذا الرابط صالح لمدة ساعة واحدة فقط.
              </p>
            </div>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ثانوية الأمير مولاي عبد الله. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    fr: {
      subject: 'Réinitialisation du mot de passe - Lycée Prince Moulay Abdellah',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation du mot de passe</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Lycée Prince Moulay Abdellah</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Journal scolaire en ligne</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Réinitialisation du mot de passe</h2>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 30px;">
                Nous avons reçu une demande de réinitialisation du mot de passe de votre compte. Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                  Réinitialiser le mot de passe
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Remarque: Ce lien est valide pendant une heure seulement.
              </p>
            </div>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Lycée Prince Moulay Abdellah. Tous droits réservés.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    en: {
      subject: 'Password Reset - PMA High School',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">PMA High School</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">School Online Newspaper</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 30px;">
                We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Note: This link is valid for one hour only.
              </p>
            </div>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} PMA High School. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  return templates[locale as keyof typeof templates] || templates.en;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    // FIXED: Correct site URL (no hyphen)
    const siteUrl = Deno.env.get('SITE_URL') || 'https://lyceepma.vercel.app'

    console.log('[password_reset] Starting password reset request')
    console.log('[password_reset] Site URL:', siteUrl)

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
    const { email, locale = 'ar' } = await req.json()
    console.log('[password_reset] Request for email:', email?.substring(0, 3) + '***', 'locale:', locale)

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

    console.log('[password_reset] User found, generating reset link')

    // Use Supabase's built-in password reset which handles email sending
    // This sends Supabase's default email template (configured in Dashboard > Auth > Email Templates)
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${siteUrl}/admin/reset-password`
      }
    )

    if (resetError) {
      console.error('[password_reset] Error sending reset email:', resetError.message)
      throw new Error(`Failed to send reset email: ${resetError.message}`)
    }

    console.log('[password_reset] Reset email sent successfully')

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
