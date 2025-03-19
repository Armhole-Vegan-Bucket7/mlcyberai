
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sample metrics data - in a real implementation, this would come from your database
const metricsData = {
  security: {
    incidents: {
      active: 8,
      resolved: 42,
      byType: {
        malware: 12,
        phishing: 15,
        network: 9,
        identity: 14
      }
    },
    alerts: {
      total: 127,
      critical: 23,
      high: 45,
      medium: 78,
      low: 134
    },
    vulnerabilities: {
      open: 280,
      byCategory: {
        critical: 23,
        high: 45,
        medium: 78,
        low: 134
      }
    },
    statuses: {
      endpoint: "warning",
      network: "critical",
      cloud: "good"
    },
    mttr: "3.2 days"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured in the edge function secrets');
    }

    // Create context for the AI by formatting the metrics data
    const context = JSON.stringify(metricsData, null, 2);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an AI assistant for a cybersecurity dashboard. You help users find information from the security metrics data. 
            You should answer queries by providing specific metrics from the data. Always be concise and direct.
            If the requested information isn't in the provided data, say so politely.
            Here's the current metrics data: ${context}`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-metrics function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
