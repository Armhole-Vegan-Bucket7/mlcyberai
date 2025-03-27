
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { corsHeaders } from "../_shared/cors.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Import types
interface OTXIndicator {
  indicator: string;
  type: string;
  description?: string;
  created?: string;
  content?: string;
}

interface CISAVulnerability {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  notes: string;
}

interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

interface RealtimeThreat {
  timestamp: string;
  source_country?: string;
  source_lat?: number;
  source_lng?: number;
  target_country?: string;
  target_lat?: number;
  target_lng?: number;
  organization?: string;
  industry?: string;
  region?: string;
  severity?: string;
  attack_vector?: string;
  cve_id?: string;
  description?: string;
}

// Function to get geolocation from IP address
async function getGeoLocationFromIP(ip: string): Promise<GeoLocation | null> {
  try {
    // IP-API allows up to 45 requests per minute for free
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    if (!response.ok) {
      console.error(`Failed to get geolocation for IP ${ip}: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error getting geolocation for IP ${ip}:`, error);
    return null;
  }
}

// Function to get country geolocation
async function getCountryLocation(countryCode: string): Promise<[number, number] | null> {
  // Simple mapping of some common country codes to coordinates
  const countryCoordinates: Record<string, [number, number]> = {
    'US': [37.0902, -95.7129],
    'GB': [55.3781, -3.4360],
    'DE': [51.1657, 10.4515],
    'FR': [46.2276, 2.2137],
    'JP': [36.2048, 138.2529],
    'CN': [35.8617, 104.1954],
    'RU': [61.5240, 105.3188],
    'IN': [20.5937, 78.9629],
    'BR': [-14.2350, -51.9253],
    'AU': [-25.2744, 133.7751],
  };

  if (countryCode && countryCoordinates[countryCode]) {
    return countryCoordinates[countryCode];
  }

  // For unknown country codes, return null (will be filled with random coordinates later)
  return null;
}

// Function to fetch data from AlienVault OTX
async function fetchAlienVaultData(): Promise<RealtimeThreat[]> {
  try {
    // OTX API requires an API key, but for demonstration, we're using a more basic approach
    // In production, you should use your OTX API key: 'X-OTX-API-KEY'
    const response = await fetch('https://otx.alienvault.com/api/v1/pulses/subscribed');
    if (!response.ok) {
      console.error(`Failed to fetch AlienVault data: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const threats: RealtimeThreat[] = [];

    // Process the most recent pulses (limit to 20)
    for (const pulse of data.results.slice(0, 20)) {
      // Extract indicators (typically IPs, domains, etc.)
      for (const indicator of pulse.indicators.slice(0, 3)) {
        let sourceLoc = null;
        
        // Get geolocation for IP indicators
        if (indicator.type === 'IPv4' || indicator.type === 'IPv6') {
          sourceLoc = await getGeoLocationFromIP(indicator.indicator);
        }

        // Generate random target location if we have source location
        let targetLocation: [number, number] | null = null;
        if (Math.random() > 0.5) {
          // Get a random country for the target
          const targetCountryCode = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'][
            Math.floor(Math.random() * 10)
          ];
          targetLocation = await getCountryLocation(targetCountryCode);
        }

        const threat: RealtimeThreat = {
          timestamp: pulse.created || new Date().toISOString(),
          source_country: sourceLoc?.country,
          source_lat: sourceLoc?.lat,
          source_lng: sourceLoc?.lon,
          target_country: targetLocation ? ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Russia', 'India', 'Brazil', 'Australia'][
            ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'].indexOf(targetLocation[0].toString())
          ] : undefined,
          target_lat: targetLocation?.[0],
          target_lng: targetLocation?.[1],
          organization: pulse.author_name || 'Unknown Organization',
          industry: pulse.industries?.[0] || 'Technology',
          region: sourceLoc?.regionName,
          severity: pulse.TLP === 'RED' ? 'critical' : pulse.TLP === 'AMBER' ? 'high' : 'medium',
          attack_vector: indicator.type || 'Unknown',
          description: pulse.description || indicator.description || 'No description available',
        };

        threats.push(threat);
      }
    }

    return threats;
  } catch (error) {
    console.error('Error fetching AlienVault data:', error);
    return [];
  }
}

// Function to fetch data from CISA's Known Exploited Vulnerabilities
async function fetchCISAVulnerabilities(): Promise<RealtimeThreat[]> {
  try {
    const response = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
    if (!response.ok) {
      console.error(`Failed to fetch CISA data: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const threats: RealtimeThreat[] = [];

    // Process the most recent vulnerabilities (limit to 30)
    for (const vuln of data.vulnerabilities.slice(0, 30)) {
      // Generate random source location
      const sourceCountryCode = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'][
        Math.floor(Math.random() * 10)
      ];
      const sourceLocation = await getCountryLocation(sourceCountryCode);

      // Generate random target location
      let targetCountryCode;
      do {
        targetCountryCode = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'][
          Math.floor(Math.random() * 10)
        ];
      } while (targetCountryCode === sourceCountryCode);
      
      const targetLocation = await getCountryLocation(targetCountryCode);

      const countryNames = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Russia', 'India', 'Brazil', 'Australia'];
      const countryCodes = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'];

      const threat: RealtimeThreat = {
        timestamp: vuln.dateAdded || new Date().toISOString(),
        source_country: countryNames[countryCodes.indexOf(sourceCountryCode)],
        source_lat: sourceLocation?.[0],
        source_lng: sourceLocation?.[1],
        target_country: countryNames[countryCodes.indexOf(targetCountryCode)],
        target_lat: targetLocation?.[0],
        target_lng: targetLocation?.[1],
        organization: vuln.vendorProject || 'Unknown Vendor',
        industry: 'Technology',
        region: 'Global',
        severity: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium',
        attack_vector: 'Vulnerability Exploit',
        cve_id: vuln.cveID,
        description: vuln.shortDescription || `${vuln.vulnerabilityName} affecting ${vuln.product}`,
      };

      threats.push(threat);
    }

    return threats;
  } catch (error) {
    console.error('Error fetching CISA data:', error);
    return [];
  }
}

// Main function to fetch and process all threat data
async function fetchAllThreatData(): Promise<RealtimeThreat[]> {
  const [alienVaultData, cisaData] = await Promise.all([
    fetchAlienVaultData(),
    fetchCISAVulnerabilities(),
  ]);

  // Combine all data sources
  const allThreats = [...alienVaultData, ...cisaData];

  // Sort by timestamp (newest first)
  allThreats.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Limit to the most recent 50 unique threats
  const uniqueThreats: Record<string, RealtimeThreat> = {};
  
  for (const threat of allThreats) {
    // Create a key based on essential properties to identify duplicates
    const key = `${threat.cve_id || ''}_${threat.description?.substring(0, 30) || ''}_${threat.organization || ''}`;
    
    if (!uniqueThreats[key]) {
      uniqueThreats[key] = threat;
    }
    
    // Stop once we have 50 unique threats
    if (Object.keys(uniqueThreats).length >= 50) {
      break;
    }
  }

  return Object.values(uniqueThreats);
}

// Function to save threats to Supabase
async function saveThreatDataToSupabase(threats: RealtimeThreat[]): Promise<number> {
  if (threats.length === 0) return 0;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let insertedCount = 0;

  try {
    // Insert threats in batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < threats.length; i += batchSize) {
      const batch = threats.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('realtime_threats')
        .insert(batch)
        .select();
      
      if (error) {
        console.error('Error inserting threats:', error);
      } else {
        insertedCount += data.length;
        console.log(`Successfully inserted ${data.length} threats (batch ${i/batchSize + 1})`);
      }
    }
    
    return insertedCount;
  } catch (error) {
    console.error('Error saving threats to Supabase:', error);
    return 0;
  }
}

// Main Edge Function handler
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Extract request parameters if any
    const params = await req.json().catch(() => ({}));
    const mode = params.mode || 'auto';  // 'auto', 'force', or 'cron'
    
    // Check if we should skip real fetching for testing/development
    const skipRealFetching = params.skipRealFetching === true;
    let threats: RealtimeThreat[] = [];
    
    if (skipRealFetching) {
      console.log('Skipping real data fetching, using mock data instead');
      
      // Generate 10 random mock threats for testing
      threats = Array(10).fill(null).map(() => {
        const sourceCountryCode = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'][
          Math.floor(Math.random() * 10)
        ];
        const targetCountryCode = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'][
          Math.floor(Math.random() * 10)
        ];
        
        return {
          timestamp: new Date().toISOString(),
          source_country: ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Russia', 'India', 'Brazil', 'Australia'][
            ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'].indexOf(sourceCountryCode)
          ],
          source_lat: Math.random() * 75 * (Math.random() > 0.5 ? 1 : -1),
          source_lng: Math.random() * 180 * (Math.random() > 0.5 ? 1 : -1),
          target_country: ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Russia', 'India', 'Brazil', 'Australia'][
            ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR', 'AU'].indexOf(targetCountryCode)
          ],
          target_lat: Math.random() * 75 * (Math.random() > 0.5 ? 1 : -1),
          target_lng: Math.random() * 180 * (Math.random() > 0.5 ? 1 : -1),
          organization: ['Acme Corp', 'TechGiant', 'FinSecure Bank', 'Healthcare Systems', 'RetailCo'][Math.floor(Math.random() * 5)],
          industry: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Energy'][Math.floor(Math.random() * 5)],
          region: 'Global',
          severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          attack_vector: ['Phishing', 'Malware', 'Ransomware', 'Zero-day', 'Supply Chain'][Math.floor(Math.random() * 5)],
          cve_id: Math.random() > 0.5 ? `CVE-${2022 + Math.floor(Math.random() * 3)}-${1000 + Math.floor(Math.random() * 9000)}` : undefined,
          description: `Mock threat description ${Math.floor(Math.random() * 1000)}`,
        };
      });
    } else {
      // Fetch real threat data
      console.log('Fetching real threat data...');
      threats = await fetchAllThreatData();
    }
    
    // Save threats to Supabase
    console.log(`Saving ${threats.length} threats to Supabase...`);
    const insertedCount = await saveThreatDataToSupabase(threats);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${threats.length} threats and inserted ${insertedCount} new records`,
        mode,
        threatCount: threats.length,
        insertedCount,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in fetch-breach-intel function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
