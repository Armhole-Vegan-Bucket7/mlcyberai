
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { authenticator } from 'https://esm.sh/otpauth@9.1.5'

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

    console.log(`Processing ${action} request for user ${user.id}`);

    // Handle different actions
    if (action === 'generate') {
      try {
        // Generate a new TOTP secret
        const secret = await generateSecureRandom();
        const issuer = 'CyberShield';
        const label = user.email || user.id;
        
        // Create a new TOTP object
        const totp = new authenticator.TOTP({
          issuer: issuer,
          label: label,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: authenticator.Secret.fromBase32(secret)
        });
        
        // Get the otpauth URL for QR code generation
        const otpauth = totp.toString();
        
        console.log(`TOTP secret generated successfully for user ${user.id}`);
        
        return new Response(
          JSON.stringify({ secret, otpauth }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error generating TOTP:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Could not generate TOTP secret', 
            details: error.message,
            stack: error.stack
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } 
    else if (action === 'verify') {
      const { secret, verificationCode } = body;
      
      if (!secret || !verificationCode) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      try {
        // Create a TOTP object with the provided secret
        const totp = new authenticator.TOTP({
          issuer: 'CyberShield',
          label: user.email || user.id,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: authenticator.Secret.fromBase32(secret)
        });
        
        // Verify the provided code
        const delta = totp.validate({ token: verificationCode });
        const isValid = delta !== null;
        
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
              JSON.stringify({ error: 'Could not save TOTP secret', details: updateError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          console.log(`TOTP verified and enabled for user ${user.id}`);
          
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
      } catch (error) {
        console.error('Error verifying TOTP:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Could not verify TOTP code', 
            details: error.message,
            stack: error.stack
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } 
    else if (action === 'validate') {
      const { code } = body;
      
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Missing verification code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      try {
        // Get the user's TOTP secret
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('totp_secret, totp_enabled')
          .eq('id', user.id)
          .single()
        
        if (profileError || !profile) {
          console.error('Profile error:', profileError)
          return new Response(
            JSON.stringify({ error: 'Could not retrieve user profile', details: profileError?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        if (!profile.totp_enabled || !profile.totp_secret) {
          return new Response(
            JSON.stringify({ error: 'TOTP is not enabled for this user' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Create a TOTP object with the stored secret
        const totp = new authenticator.TOTP({
          issuer: 'CyberShield',
          label: user.email || user.id,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: authenticator.Secret.fromBase32(profile.totp_secret)
        });
        
        // Verify the provided code
        const delta = totp.validate({ token: code });
        const isValid = delta !== null;
        
        return new Response(
          JSON.stringify({ valid: isValid }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error validating TOTP:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Could not validate TOTP code', 
            details: error.message,
            stack: error.stack
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    else if (action === 'disable') {
      try {
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
            JSON.stringify({ error: 'Could not disable TOTP', details: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        console.log(`TOTP disabled for user ${user.id}`);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error disabling TOTP:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Could not disable TOTP', 
            details: error.message,
            stack: error.stack 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    else if (action === 'status') {
      try {
        // Get the current TOTP status for the user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('totp_enabled')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.error('Error getting TOTP status:', profileError)
          // Check if it's a "not found" error
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: createError } = await supabase
              .from('profiles')
              .insert({ 
                id: user.id,
                email: user.email,
                totp_enabled: false,
                updated_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              })
            
            if (createError) {
              console.error('Error creating profile:', createError)
              return new Response(
                JSON.stringify({ error: 'Could not create user profile', details: createError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }
            
            // Return default status
            return new Response(
              JSON.stringify({ enabled: false }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          return new Response(
            JSON.stringify({ error: 'Could not retrieve TOTP status', details: profileError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        console.log(`TOTP status for user ${user.id}: ${profile?.totp_enabled ? 'enabled' : 'disabled'}`);
        
        return new Response(
          JSON.stringify({ enabled: profile?.totp_enabled || false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error checking TOTP status:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Could not check TOTP status', 
            details: error.message,
            stack: error.stack 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('TOTP function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to generate a secure random Base32 secret
async function generateSecureRandom() {
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);
  
  // Convert to Base32
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let base32Secret = '';
  
  for (let i = 0; i < randomValues.length; i += 5) {
    const buffer = randomValues.slice(i, i + 5);
    const bitLength = buffer.length * 8;
    
    // Process each 5-byte chunk
    let bits = 0;
    let value = 0;
    
    for (let j = 0; j < buffer.length; j++) {
      value = (value << 8) | buffer[j];
      bits += 8;
      
      while (bits >= 5) {
        bits -= 5;
        base32Secret += base32Chars[(value >>> bits) & 31];
      }
    }
    
    // Handle remaining bits if the buffer is not a multiple of 5 bytes
    if (bits > 0) {
      base32Secret += base32Chars[(value << (5 - bits)) & 31];
    }
  }
  
  return base32Secret;
}
