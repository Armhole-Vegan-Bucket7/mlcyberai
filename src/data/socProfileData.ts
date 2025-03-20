
import { SOCProfileData } from '@/types/socProfile';

export const socProfileData: SOCProfileData = {
  regions: [
    {
      id: 'na',
      name: 'North America',
      color: '#4C8BF5', // Blue
      totalConnectors: 0,
      totalLogTraffic: 0,
      countries: [
        {
          id: 'us',
          name: 'United States',
          connectors: 245,
          logTraffic: 12500,
          coordinates: [-98.5795, 39.8283]
        },
        {
          id: 'ca',
          name: 'Canada',
          connectors: 124,
          logTraffic: 7500,
          coordinates: [-106.3468, 56.1304]
        },
        {
          id: 'mx',
          name: 'Mexico',
          connectors: 78,
          logTraffic: 5200,
          coordinates: [-102.5528, 23.6345]
        }
      ]
    },
    {
      id: 'sa',
      name: 'South America',
      color: '#34A853', // Green
      totalConnectors: 0,
      totalLogTraffic: 0,
      countries: [
        {
          id: 'br',
          name: 'Brazil',
          connectors: 95,
          logTraffic: 6400,
          coordinates: [-51.9253, -14.2350]
        },
        {
          id: 'ar',
          name: 'Argentina',
          connectors: 52,
          logTraffic: 3800,
          coordinates: [-63.6167, -38.4161]
        },
        {
          id: 'co',
          name: 'Colombia',
          connectors: 38,
          logTraffic: 2700,
          coordinates: [-74.2973, 4.5709]
        },
        {
          id: 'cl',
          name: 'Chile',
          connectors: 29,
          logTraffic: 2100,
          coordinates: [-71.5430, -35.6751]
        }
      ]
    },
    {
      id: 'eu',
      name: 'Europe',
      color: '#FBBC04', // Yellow
      totalConnectors: 0,
      totalLogTraffic: 0,
      countries: [
        {
          id: 'uk',
          name: 'United Kingdom',
          connectors: 187,
          logTraffic: 9800,
          coordinates: [-3.4360, 55.3781]
        },
        {
          id: 'fr',
          name: 'France',
          connectors: 143,
          logTraffic: 8200,
          coordinates: [2.2137, 46.2276]
        },
        {
          id: 'de',
          name: 'Germany',
          connectors: 168,
          logTraffic: 9400,
          coordinates: [10.4515, 51.1657]
        },
        {
          id: 'es',
          name: 'Spain',
          connectors: 89,
          logTraffic: 5800,
          coordinates: [-3.7492, 40.4637]
        },
        {
          id: 'it',
          name: 'Italy',
          connectors: 92,
          logTraffic: 6100,
          coordinates: [12.5674, 41.8719]
        }
      ]
    },
    {
      id: 'ap',
      name: 'APAC',
      color: '#EA4335', // Red
      totalConnectors: 0,
      totalLogTraffic: 0,
      countries: [
        {
          id: 'jp',
          name: 'Japan',
          connectors: 156,
          logTraffic: 8900,
          coordinates: [138.2529, 36.2048]
        },
        {
          id: 'au',
          name: 'Australia',
          connectors: 105,
          logTraffic: 6700,
          coordinates: [133.7751, -25.2744]
        },
        {
          id: 'sg',
          name: 'Singapore',
          connectors: 84,
          logTraffic: 5600,
          coordinates: [103.8198, 1.3521]
        },
        {
          id: 'cn',
          name: 'China',
          connectors: 215,
          logTraffic: 11200,
          coordinates: [104.1954, 35.8617]
        },
        {
          id: 'kr',
          name: 'South Korea',
          connectors: 102,
          logTraffic: 6500,
          coordinates: [127.7669, 35.9078]
        }
      ]
    }
  ],
  bengaluruCoordinates: [77.5946, 12.9716] // Bengaluru coordinates [longitude, latitude]
};

// Calculate region totals
socProfileData.regions = socProfileData.regions.map(region => {
  const totalConnectors = region.countries.reduce((sum, country) => sum + country.connectors, 0);
  const totalLogTraffic = region.countries.reduce((sum, country) => sum + country.logTraffic, 0);
  
  return {
    ...region,
    totalConnectors,
    totalLogTraffic
  };
});

// Function to generate random fluctuations in log traffic (±10%)
export function getUpdatedLogTraffic(currentValue: number): number {
  const fluctuation = currentValue * 0.1; // 10% of current value
  const change = Math.random() * fluctuation * 2 - fluctuation; // Random value between -fluctuation and +fluctuation
  return Math.max(Math.round(currentValue + change), 100); // Ensure it doesn't go below 100
}
