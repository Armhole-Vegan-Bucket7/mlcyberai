
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Initialize mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiY3liZXJtb25pdG9yIiwiYSI6ImNsbjUyZXI3ejAxZzAya3BnaDVxNDR1MnEifQ.OBIo_A64nBNaQWk-LQebeQ';

interface AttackData {
  id: string;
  source: [number, number]; // Explicitly typed as tuple
  target: [number, number]; // Explicitly typed as tuple
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
  const [attacks, setAttacks] = useState<AttackData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [30, 15],
      pitch: 45,
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
      
      map.current.setFog({
        color: 'rgb(30, 30, 50)',
        'high-color': 'rgb(10, 10, 40)',
        'horizon-blend': 0.4,
      });

      // Add glow effect
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15,
        }
      });

      // Fetch initial data
      fetchBreachData();
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

    // Auto-rotation
    const secondsPerRevolution = 180;
    let userInteracting = false;

    function spinGlobe() {
      if (!map.current || userInteracting) return;
      
      const center = map.current.getCenter();
      center.lng -= 360 / secondsPerRevolution / 60;
      map.current.easeTo({ center, duration: 0 });
      
      requestAnimationFrame(spinGlobe);
    }

    // Start spinning
    spinGlobe();

    // Interaction handlers
    map.current.on('mousedown', () => {
      userInteracting = true;
    });
    
    map.current.on('mouseup', () => {
      userInteracting = false;
    });

    // Setup interval to fetch new data every 10 minutes
    const intervalId = setInterval(() => {
      refreshData();
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      map.current?.remove();
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

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
        formattedAttacks.forEach(attack => {
          addAttackToMap(attack);
        });
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
    addAttackToMap(attack);
  };

  const addAttackToMap = (attack: AttackData) => {
    if (!map.current) return;

    // Add attack arc animation
    const arcId = `arc-${attack.id}`;
    const pointId = `point-${attack.id}`;
    const sourceId = `source-${attack.id}`;

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
    if (!map.current.getSource(arcId)) {
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

      // Add pulsing effect
      let size = 15;
      const pulsingEffect = () => {
        if (!map.current || !map.current.getLayer(pointId)) return;
        
        size = size === 15 ? 20 : 15;
        map.current.setPaintProperty(pointId, 'circle-radius', size);
        setTimeout(pulsingEffect, 1000);
      };
      
      pulsingEffect();

      // Add a popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      map.current.on('mouseenter', pointId, (e) => {
        if (!map.current || !e.features) return;
        
        map.current.getCanvas().style.cursor = 'pointer';
        
        const feature = e.features[0];
        if (feature && feature.geometry.type === 'Point') {
          const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
          const description = feature.properties?.description;
          
          if (description) {
            popup.setLngLat(coordinates).setHTML(description).addTo(map.current);
          }
        }
      });
      
      map.current.on('mouseleave', pointId, () => {
        if (!map.current) return;
        
        map.current.getCanvas().style.cursor = '';
        popup.remove();
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
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-13rem)] rounded-lg border overflow-hidden bg-slate-950">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyber-blue" />
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
