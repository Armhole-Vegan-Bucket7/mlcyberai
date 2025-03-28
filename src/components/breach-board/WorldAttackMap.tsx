
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Initialize mapbox with a default public token - should be replaced with an environment variable in production
mapboxgl.accessToken = 'pk.eyJ1IjoiY3liZXJtb25pdG9yIiwiYSI6ImNsbjUyZXI3ejAxZzAya3BnaDVxNDR1MnEifQ.OBIo_A64nBNaQWk-LQebeQ';

interface AttackData {
  id: string;
  source: [number, number];
  target: [number, number];
  organization: string;
  attack_vector: string;
  severity: string;
  description?: string;
  timestamp?: string;
  cve_id?: string;
}

interface RealtimeThreat {
  id: string;
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

// Define severity colors
const severityColors: Record<string, string> = {
  'critical': '#FF3B30',
  'high': '#FF9500',
  'medium': '#FFCC00',
  'low': '#34C759',
  'info': '#0076FF',
};

const WorldAttackMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapInitAttempt, setMapInitAttempt] = useState(0);
  const [attacks, setAttacks] = useState<AttackData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const pendingAttacks = useRef<AttackData[]>([]);
  const mapInitTimeout = useRef<number | null>(null);
  const mapLoadTimeout = useRef<number | null>(null);
  
  // Function to convert a RealtimeThreat to AttackData
  const threatToAttackData = (threat: RealtimeThreat): AttackData | null => {
    if (!threat.source_lat || !threat.source_lng || !threat.target_lat || !threat.target_lng) {
      return null;
    }
    
    return {
      id: threat.id,
      source: [threat.source_lng, threat.source_lat] as [number, number],
      target: [threat.target_lng, threat.target_lat] as [number, number],
      organization: threat.organization || 'Unknown Organization',
      attack_vector: threat.attack_vector || 'Unknown',
      severity: threat.severity || 'medium',
      description: threat.description,
      timestamp: threat.timestamp,
      cve_id: threat.cve_id,
    };
  };

  // Handle map initialization errors
  const handleMapInitError = () => {
    console.error("Map initialization timeout");
    setLoading(false);
    setLoadError("Map initialization timed out. Please try refreshing the page.");
    
    // Make sure we clean up any incomplete map instance
    if (map.current) {
      try {
        map.current.remove();
        map.current = null;
      } catch (err) {
        console.error("Error cleaning up map instance:", err);
      }
    }
  };

  // Reset the map and try loading again
  const retryMapLoading = () => {
    if (map.current) {
      try {
        map.current.remove();
        map.current = null;
      } catch (err) {
        console.error("Error removing map:", err);
      }
    }
    
    setLoading(true);
    setMapLoaded(false);
    setLoadError(null);
    setStyleLoaded(false);
    setMapInitAttempt(prev => prev + 1);
    
    // Clear any pending timeouts
    if (mapInitTimeout.current) {
      window.clearTimeout(mapInitTimeout.current);
      mapInitTimeout.current = null;
    }
    if (mapLoadTimeout.current) {
      window.clearTimeout(mapLoadTimeout.current);
      mapLoadTimeout.current = null;
    }
  };

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Set a timeout to detect if map initialization takes too long
    mapInitTimeout.current = window.setTimeout(handleMapInitError, 10000); // 10 seconds timeout

    // Set another timeout for the overall map loading including style
    mapLoadTimeout.current = window.setTimeout(() => {
      if (!styleLoaded) {
        console.error("Map style loading timeout");
        setLoadError("Map style loading timed out. Please check your network connection and try again.");
        setLoading(false);
      }
    }, 15000); // 15 seconds timeout for style loading

    try {
      console.log("Initializing map...");
      
      // Initialize map with minimal configuration for faster loading
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        zoom: 1.5,
        center: [30, 15],
        pitch: 45,
        fadeDuration: 0, // Immediate rendering, no fade animations
        attributionControl: false,
        preserveDrawingBuffer: false,
        renderWorldCopies: false,
        maxZoom: 8,
        minZoom: 1,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Disable scroll zoom for smoother experience
      map.current.scrollZoom.disable();

      // Add atmosphere and fog effects
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        console.log('Map style loaded successfully');
        setStyleLoaded(true); // Mark style as loaded
        
        // Clear the timeouts since map loaded successfully
        if (mapInitTimeout.current) {
          clearTimeout(mapInitTimeout.current);
          mapInitTimeout.current = null;
        }
        
        if (mapLoadTimeout.current) {
          clearTimeout(mapLoadTimeout.current);
          mapLoadTimeout.current = null;
        }
        
        try {
          // Add simplified fog for better performance
          map.current.setFog({
            color: 'rgb(30, 30, 50)',
            'high-color': 'rgb(10, 10, 40)',
            'horizon-blend': 0.4,
          });

          // Add glow effect with minimal settings
          map.current.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15,
            }
          });
        } catch (error) {
          console.error('Error setting map fog or sky:', error);
          // Continue without these effects
        }

        // Fetch initial data
        fetchBreachData();
        setLoading(false);
        setMapLoaded(true);
        
        // Process any pending attacks that came in while the style was loading
        if (pendingAttacks.current.length > 0) {
          console.log(`Processing ${pendingAttacks.current.length} pending attacks`);
          pendingAttacks.current.forEach(attack => {
            addAttackToMap(attack);
          });
          pendingAttacks.current = [];
        }
      });

      // Listen for map load completion
      map.current.on('load', () => {
        console.log('Map base loaded');
      });

      // Listen for map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setLoadError(`Map error: ${e.error?.message || 'Unknown error'}`);
        setLoading(false);
      });

      // Start listening for real-time updates
      const channel = supabase
        .channel('realtime-threats-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'realtime_threats'
          },
          handleRealtimeUpdate
        )
        .subscribe();

      // Auto-rotation with simplified logic for better performance
      let userInteracting = false;
      const secondsPerRevolution = 240;

      function spinGlobe() {
        if (!map.current || userInteracting || !styleLoaded) return;
        
        const center = map.current.getCenter();
        center.lng -= 360 / secondsPerRevolution / 60;
        map.current.easeTo({ center, duration: 0 });
        
        requestAnimationFrame(spinGlobe);
      }

      // Start spinning only after style loads to avoid performance issues during loading
      map.current.once('idle', () => {
        if (styleLoaded) {
          spinGlobe();
        }
      });

      // Simplified interaction handlers
      map.current.on('mousedown', () => {
        userInteracting = true;
      });
      
      map.current.on('mouseup', () => {
        userInteracting = false;
      });

      // Setup interval to fetch new data every 10 minutes
      const intervalId = setInterval(() => {
        if (mapLoaded && styleLoaded) {
          refreshData();
        }
      }, 10 * 60 * 1000); // 10 minutes

      return () => {
        if (map.current) {
          map.current.remove();
        }
        supabase.removeChannel(channel);
        clearInterval(intervalId);
        if (mapInitTimeout.current) {
          clearTimeout(mapInitTimeout.current);
        }
        if (mapLoadTimeout.current) {
          clearTimeout(mapLoadTimeout.current);
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
      setLoadError(`Failed to initialize the map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (mapInitTimeout.current) {
        clearTimeout(mapInitTimeout.current);
      }
      if (mapLoadTimeout.current) {
        clearTimeout(mapLoadTimeout.current);
      }
    }
  }, [mapInitAttempt]); // Re-initialize map when retry is attempted

  const fetchBreachData = async () => {
    try {
      const { data, error } = await supabase
        .from('realtime_threats')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedAttacks: AttackData[] = data
          .map(threatToAttackData)
          .filter(Boolean) as AttackData[];

        setAttacks(formattedAttacks);
        
        // Only add attacks to map if style is loaded, otherwise queue them
        if (styleLoaded && map.current) {
          console.log(`Adding ${formattedAttacks.length} attacks to map`);
          formattedAttacks.forEach(attack => {
            addAttackToMap(attack);
          });
        } else {
          console.log(`Queueing ${formattedAttacks.length} attacks until style loads`);
          pendingAttacks.current = [...pendingAttacks.current, ...formattedAttacks];
        }
      } else {
        // If no data exists, trigger the edge function to generate some
        generateInitialData();
      }
    } catch (error) {
      console.error('Error fetching breach data:', error);
      toast({
        title: "Error",
        description: "Failed to load breach data",
        variant: "destructive"
      });
    }
  };

  const generateInitialData = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('fetch-breach-intel', {
        body: { skipRealFetching: true }
      });
      
      if (error) throw error;
      
      toast({
        title: "Data Generated",
        description: `Generated ${data.insertedCount} breach data points for demonstration.`,
      });
      
      // Fetch the newly generated data
      fetchBreachData();
    } catch (error) {
      console.error('Error generating initial data:', error);
      toast({
        title: "Error",
        description: "Failed to generate initial breach data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('fetch-breach-intel', {
        body: { mode: 'force' }
      });
      
      if (error) throw error;
      
      toast({
        title: "Data Refreshed",
        description: `Found ${data.threatCount} threats, added ${data.insertedCount} new ones.`,
      });
      
      // No need to fetch again as realtime subscription will update the UI
    } catch (error) {
      console.error('Error refreshing breach data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh breach data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    console.log('Realtime update received:', payload);
    const newItem = payload.new as RealtimeThreat;
    
    if (!newItem.source_lat || !newItem.source_lng || !newItem.target_lat || !newItem.target_lng) return;
    
    const attack = threatToAttackData(newItem);
    if (!attack) return;

    setAttacks(prev => [...prev, attack]);
    
    // Only add attack to map if style is loaded, otherwise queue it
    if (styleLoaded && map.current) {
      addAttackToMap(attack);
    } else {
      pendingAttacks.current.push(attack);
    }
  };

  const addAttackToMap = (attack: AttackData) => {
    if (!map.current || !styleLoaded) {
      console.log('Map or style not ready, queueing attack:', attack.id);
      pendingAttacks.current.push(attack);
      return;
    }

    try {
      // Add attack arc animation
      const arcId = `arc-${attack.id}`;
      const pointId = `point-${attack.id}`;
      const sourceId = `source-${attack.id}`;

      // Skip if this attack is already on the map
      if (map.current.getSource(arcId)) {
        console.log(`Attack ${attack.id} already on map, skipping`);
        return;
      }

      // Create a curved line between source and target
      const route = {
        'type': 'FeatureCollection' as const,
        'features': [
          {
            'type': 'Feature' as const,
            'geometry': {
              'type': 'LineString' as const,
              'coordinates': [
                attack.source,
                [
                  attack.source[0] + (attack.target[0] - attack.source[0]) / 2,
                  attack.source[1] + (attack.target[1] - attack.source[1]) / 2 + 
                  Math.sqrt(Math.pow(attack.target[0] - attack.source[0], 2) + 
                  Math.pow(attack.target[1] - attack.source[1], 2)) * 0.2
                ],
                attack.target
              ]
            },
            'properties': {}
          }
        ]
      };

      // Add source and layer for arc
      map.current.addSource(arcId, {
        'type': 'geojson',
        'data': route
      });

      // Add the arc layer
      map.current.addLayer({
        'id': arcId,
        'source': arcId,
        'type': 'line',
        'paint': {
          'line-width': 2,
          'line-color': severityColors[attack.severity as keyof typeof severityColors] || '#FF9500',
          'line-opacity': 0.8,
          'line-dasharray': [0, 2, 1]
        }
      });

      // Animate the line
      const dashArraySequence = [
        [0, 2, 1],
        [1, 2, 0],
        [2, 2, 0],
        [0, 0, 2, 1],
        [0, 1, 2, 0],
        [0, 2, 1, 0]
      ];

      let step = 0;
      const animateLine = () => {
        if (!map.current || !map.current.getLayer(arcId)) return;
        
        // Update the dash array
        map.current.setPaintProperty(arcId, 'line-dasharray', dashArraySequence[step]);
        step = (step + 1) % dashArraySequence.length;
        requestAnimationFrame(animateLine);
      };
      
      animateLine();

      // Create point geojson for target
      const pointGeoJson = {
        'type': 'FeatureCollection' as const,
        'features': [
          {
            'type': 'Feature' as const,
            'geometry': {
              'type': 'Point' as const,
              'coordinates': attack.target
            },
            'properties': {
              'description': `
                <strong>${attack.organization}</strong><br/>
                ${attack.description ? `${attack.description}<br/>` : ''}
                ${attack.cve_id ? `CVE: ${attack.cve_id}<br/>` : ''}
                Attack: ${attack.attack_vector}<br/>
                Severity: ${attack.severity}
              `
            }
          }
        ]
      };

      // Add source for target point
      map.current.addSource(pointId, {
        'type': 'geojson',
        'data': pointGeoJson
      });

      // Add the target point layer
      map.current.addLayer({
        'id': pointId,
        'source': pointId,
        'type': 'circle',
        'paint': {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            1, 3,
            6, 12
          ],
          'circle-color': severityColors[attack.severity as keyof typeof severityColors] || '#FF9500',
          'circle-opacity': 0.8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Create source point geojson
      const sourcePointGeoJson = {
        'type': 'FeatureCollection' as const,
        'features': [
          {
            'type': 'Feature' as const,
            'geometry': {
              'type': 'Point' as const,
              'coordinates': attack.source
            },
            'properties': {}
          }
        ]
      };

      // Add source point
      map.current.addSource(sourceId, {
        'type': 'geojson',
        'data': sourcePointGeoJson
      });

      // Add the source point layer
      map.current.addLayer({
        'id': sourceId,
        'source': sourceId,
        'type': 'circle',
        'paint': {
          'circle-radius': 3,
          'circle-color': '#FF3B30',
          'circle-opacity': 0.6
        }
      });
    } catch (error) {
      console.error('Error adding attack to map:', error, attack);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-13rem)] rounded-lg border overflow-hidden bg-slate-950">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-cyber-blue" />
            <p className="text-white text-sm">Loading map data...</p>
          </div>
        </div>
      ) : loadError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950/90 p-6">
          <AlertTriangle className="h-12 w-12 text-cyber-red mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Map Loading Error</h3>
          <p className="text-white text-center mb-6 max-w-md">{loadError}</p>
          <Button 
            variant="outline" 
            onClick={retryMapLoading}
            className="bg-black/60 hover:bg-black/80 text-white border-gray-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Loading Map
          </Button>
          <p className="text-gray-400 text-xs mt-4 text-center max-w-md">
            If this issue persists, please check your network connection or try using a different browser.
          </p>
        </div>
      ) : !mapLoaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950/90">
          <Loader2 className="h-8 w-8 animate-spin text-cyber-blue mb-4" />
          <p className="text-white">Map is taking longer than expected to load...</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={retryMapLoading}
            className="mt-4 bg-black/60 hover:bg-black/80 text-white border-gray-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Loading
          </Button>
        </div>
      ) : null}
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshData}
          disabled={refreshing}
          className="bg-black/60 hover:bg-black/80 text-white border-gray-700"
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Data
        </Button>
      </div>
      <div className="absolute bottom-4 left-4 bg-black/60 p-2 rounded text-xs text-white">
        <div className="flex items-center space-x-2 mb-1">
          <span className="inline-block w-3 h-3 rounded-full bg-cyber-red"></span>
          <span>Critical</span>
        </div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="inline-block w-3 h-3 rounded-full bg-cyber-orange"></span>
          <span>High</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full bg-cyber-yellow"></span>
          <span>Medium</span>
        </div>
      </div>
    </div>
  );
};

export default WorldAttackMap;
