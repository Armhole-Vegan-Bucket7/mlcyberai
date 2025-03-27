
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Initialize mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiY3liZXJtb25pdG9yIiwiYSI6ImNsbjUyZXI3ejAxZzAya3BnaDVxNDR1MnEifQ.OBIo_A64nBNaQWk-LQebeQ';

interface AttackData {
  id: string;
  source: [number, number];
  target: [number, number];
  organization: string;
  attack_vector: string;
  severity: string;
}

const severityColors = {
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
      .channel('breach-data-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'breach_data'
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

    return () => {
      map.current?.remove();
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBreachData = async () => {
    try {
      const { data, error } = await supabase
        .from('breach_data')
        .select('*')
        .order('breach_time', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedAttacks = data.map(item => ({
          id: item.id,
          source: [item.source_longitude || 0, item.source_latitude || 0],
          target: [item.longitude || 0, item.latitude || 0],
          organization: item.organization,
          attack_vector: item.attack_vector || 'Unknown',
          severity: item.severity || 'medium',
        }));

        setAttacks(formattedAttacks);
        formattedAttacks.forEach(attack => {
          addAttackToMap(attack);
        });
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

  const handleRealtimeUpdate = (payload: any) => {
    const newItem = payload.new;
    
    if (!newItem.source_longitude || !newItem.longitude) return;
    
    const attack = {
      id: newItem.id,
      source: [newItem.source_longitude, newItem.source_latitude],
      target: [newItem.longitude, newItem.latitude],
      organization: newItem.organization,
      attack_vector: newItem.attack_vector || 'Unknown',
      severity: newItem.severity || 'medium',
    };

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
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
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

      // Add source for target point
      map.current.addSource(pointId, {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': attack.target
              },
              'properties': {
                'description': `
                  <strong>${attack.organization}</strong><br/>
                  Attack: ${attack.attack_vector}<br/>
                  Severity: ${attack.severity}
                `
              }
            }
          ]
        }
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
        if (!map.current) return;
        
        map.current.getCanvas().style.cursor = 'pointer';
        
        const coordinates = e.features?.[0].geometry.coordinates.slice() as [number, number];
        const description = e.features?.[0].properties.description;
        
        popup.setLngLat(coordinates).setHTML(description).addTo(map.current);
      });
      
      map.current.on('mouseleave', pointId, () => {
        if (!map.current) return;
        
        map.current.getCanvas().style.cursor = '';
        popup.remove();
      });

      // Add source point
      map.current.addSource(sourceId, {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': attack.source
              },
              'properties': {}
            }
          ]
        }
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
