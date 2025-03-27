
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { totp } from 'https://esm.sh/otplib@12.0.1'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const body = await req.json();
    const { action } = body;

    // Handle different actions
    if (action === 'generate') {
      // Generate a new TOTP secret
      const secret = totp.generateSecret()
      const otpauth = totp.keyuri(user.email || user.id, 'CyberShield', secret)
      
      return new Response(
        JSON.stringify({ secret, otpauth }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'verify') {
      const { secret, verificationCode } = body;
      
      // Verify the provided code
      const isValid = totp.verify({
        token: verificationCode,
        secret
      });
      
      if (isValid) {
        // If valid, save the secret to the user's profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            totp_secret: secret,
            totp_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        if (updateError) {
          console.error('Error saving TOTP secret:', updateError)
          return new Response(
            JSON.stringify({ error: 'Could not save TOTP secret' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid verification code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } 
    else if (action === 'validate') {
      const { code } = body;
      
      // Get the user's TOTP secret
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('totp_secret, totp_enabled')
        .eq('id', user.id)
        .single()
      
      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: 'Could not retrieve user profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (!profile.totp_enabled || !profile.totp_secret) {
        return new Response(
          JSON.stringify({ error: 'TOTP is not enabled for this user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Verify the provided code against the stored secret
      const isValid = totp.verify({ 
        token: code, 
        secret: profile.totp_secret 
      });
      
      return new Response(
        JSON.stringify({ valid: isValid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    else if (action === 'disable') {
      // Disable TOTP for the user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          totp_secret: null,
          totp_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error disabling TOTP:', updateError)
        return new Response(
          JSON.stringify({ error: 'Could not disable TOTP' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    else if (action === 'status') {
      // Get the current TOTP status for the user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('totp_enabled')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error('Error getting TOTP status:', profileError)
        return new Response(
          JSON.stringify({ error: 'Could not retrieve TOTP status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ enabled: profile?.totp_enabled || false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('TOTP function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
