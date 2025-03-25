import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Multi-tenant metrics data
const tenantsMetricsData = {
  // Microland MSSP tenant
  "1": {
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
  },
  // MLCyber Customer1 tenant (formerly RSM)
  "2": {
    security: {
      incidents: {
        active: 5,
        resolved: 37,
        byType: {
          malware: 8,
          phishing: 17,
          network: 6,
          identity: 11
        }
      },
      alerts: {
        total: 89,
        critical: 14,
        high: 28,
        medium: 43,
        low: 98
      },
      vulnerabilities: {
        open: 156,
        byCategory: {
          critical: 17,
          high: 32,
          medium: 65,
          low: 42
        }
      },
      statuses: {
        endpoint: "good",
        network: "warning",
        cloud: "good"
      },
      mttr: "2.5 days"
    }
  },
  // MLCyber Customer2 tenant (formerly Indorama)
  "3": {
    security: {
      incidents: {
        active: 12,
        resolved: 53,
        byType: {
          malware: 18,
          phishing: 22,
          network: 13,
          identity: 12
        }
      },
      alerts: {
        total: 217,
        critical: 35,
        high: 62,
        medium: 86,
        low: 148
      },
      vulnerabilities: {
        open: 324,
        byCategory: {
          critical: 42,
          high: 78,
          medium: 115,
          low: 89
        }
      },
      statuses: {
        endpoint: "critical",
        network: "warning",
        cloud: "warning"
      },
      mttr: "4.7 days"
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, tenantId, tenantName } = await req.json();
    const tenantIdStr = String(tenantId);

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured in the edge function secrets');
    }

    // Get tenant-specific metrics data
    const metricsData = tenantsMetricsData[tenantIdStr] || tenantsMetricsData["1"];
    
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
            content: `You are an AI assistant for a cybersecurity dashboard. You help users find information from the security metrics data for ${tenantName}. 
            You should answer queries by providing specific metrics from the data. Always be concise and direct.
            If the requested information isn't in the provided data, say so politely.
            Here's the current metrics data for ${tenantName}: ${context}`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    console.log(`Tenant ${tenantName} (ID: ${tenantId}) search query: "${query}"`);

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
