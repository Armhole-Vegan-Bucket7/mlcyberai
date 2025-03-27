
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Mock data generators for demonstration purposes
const getRandomLatLng = () => ({
  lat: Math.random() * 180 - 90,
  lng: Math.random() * 360 - 180,
});

const getRandomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

const getRandomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const organizations = [
  'Acme Corp', 'TechGiant', 'FinSecure Bank', 'Healthcare Networks', 'RetailCo', 
  'EduSystems', 'GovServices', 'TransportTech', 'EnergyOne', 'ManufacturingPro'
];

const countries = [
  { name: 'United States', code: 'US', lat: 37.0902, lng: -95.7129 },
  { name: 'United Kingdom', code: 'GB', lat: 55.3781, lng: -3.4360 },
  { name: 'Germany', code: 'DE', lat: 51.1657, lng: 10.4515 },
  { name: 'France', code: 'FR', lat: 46.2276, lng: 2.2137 },
  { name: 'Japan', code: 'JP', lat: 36.2048, lng: 138.2529 },
  { name: 'Australia', code: 'AU', lat: -25.2744, lng: 133.7751 },
  { name: 'Canada', code: 'CA', lat: 56.1304, lng: -106.3468 },
  { name: 'India', code: 'IN', lat: 20.5937, lng: 78.9629 },
  { name: 'Brazil', code: 'BR', lat: -14.2350, lng: -51.9253 },
  { name: 'China', code: 'CN', lat: 35.8617, lng: 104.1954 }
];

const attackVectors = [
  'Phishing', 'Malware', 'Ransomware', 'SQL Injection', 'XSS', 
  'DDoS', 'Insider Threat', 'Zero-Day', 'Social Engineering', 'Credential Stuffing'
];

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Education',
  'Government', 'Transportation', 'Energy', 'Manufacturing', 'Media'
];

const severities = ['critical', 'high', 'medium', 'low', 'info'];

const cves = [
  { id: 'CVE-2023-36884', description: 'Microsoft Office and Windows HTML Remote Code Execution Vulnerability' },
  { id: 'CVE-2023-23397', description: 'Microsoft Outlook Elevation of Privilege Vulnerability' },
  { id: 'CVE-2021-44228', description: 'Apache Log4j Remote Code Execution Vulnerability (Log4Shell)' },
  { id: 'CVE-2022-22965', description: 'Spring Framework Remote Code Execution Vulnerability (Spring4Shell)' },
  { id: 'CVE-2022-26134', description: 'Atlassian Confluence Server Remote Code Execution Vulnerability' }
];

// Generate a mock breach entry
const generateMockBreach = () => {
  const targetCountry = getRandomElement(countries);
  let sourceCountry;
  do {
    sourceCountry = getRandomElement(countries);
  } while (sourceCountry.code === targetCountry.code);

  // Add some randomness to the coordinates
  const targetLat = targetCountry.lat + getRandomFloat(-5, 5);
  const targetLng = targetCountry.lng + getRandomFloat(-5, 5);
  const sourceLat = sourceCountry.lat + getRandomFloat(-5, 5);
  const sourceLng = sourceCountry.lng + getRandomFloat(-5, 5);

  const cve = Math.random() > 0.5 ? getRandomElement(cves) : null;

  return {
    organization: getRandomElement(organizations),
    country: targetCountry.name,
    country_code: targetCountry.code,
    latitude: targetLat,
    longitude: targetLng,
    attack_vector: getRandomElement(attackVectors),
    industry: getRandomElement(industries),
    severity: getRandomElement(severities),
    breach_time: new Date().toISOString(),
    cve_id: cve?.id,
    cve_description: cve?.description,
    source_ip: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    source_country: sourceCountry.name,
    source_latitude: sourceLat,
    source_longitude: sourceLng
  };
};

// Seed the database with initial breach data if needed
const seedInitialData = async (supabase: any) => {
  console.log('Checking if initial seed is needed...');
  
  // Check if we already have data
  const { count, error: countError } = await supabase
    .from('breach_data')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error checking breach data count:', countError);
    return;
  }
  
  // If we have no data, seed with 50 initial breaches
  if (count === 0) {
    console.log('No breach data found, seeding initial data...');
    
    // Generate breach data spanning the last 7 days
    const breaches = [];
    const now = new Date();
    
    for (let i = 0; i < 50; i++) {
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - Math.floor(Math.random() * 7)); // Random day in the last week
      
      const breach = generateMockBreach();
      breach.breach_time = pastDate.toISOString();
      breaches.push(breach);
    }
    
    const { error } = await supabase
      .from('breach_data')
      .insert(breaches);
      
    if (error) {
      console.error('Error seeding initial breach data:', error);
    } else {
      console.log('Successfully seeded initial breach data');
    }
  } else {
    console.log(`Found ${count} existing breach records, skipping initial seed.`);
  }
};

// Generate a new breach
const generateNewBreach = async (supabase: any) => {
  const breach = generateMockBreach();
  
  const { data, error } = await supabase
    .from('breach_data')
    .insert([breach])
    .select();
    
  if (error) {
    console.error('Error inserting new breach:', error);
    return { success: false, error };
  }
  
  console.log('Successfully inserted new breach:', data[0].id);
  return { success: true, data: data[0] };
};

// Set up the Edge Function
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client with service role key (for admin access)
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check for request body parameters
    const { action } = await req.json();
    
    if (action === 'seed') {
      await seedInitialData(supabase);
      return new Response(
        JSON.stringify({ success: true, message: 'Seed process completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'generate') {
      const result = await generateNewBreach(supabase);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Default action is to seed initial data
    await seedInitialData(supabase);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Initial data check completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-breach-data function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
