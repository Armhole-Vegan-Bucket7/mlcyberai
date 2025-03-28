
import React, { useRef, useEffect, useState } from 'react';
import { SOCProfileData, RegionCountry } from '@/types/socProfile';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Globe, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface GlobalMapProps {
  data: SOCProfileData;
  selectedCountry: RegionCountry | null;
}

const GlobalMap: React.FC<GlobalMapProps> = ({ data, selectedCountry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapboxRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const [useMapbox, setUseMapbox] = useState(true);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenEntered, setTokenEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Convert geo coordinates to canvas coordinates
  const geoToCanvas = (
    longitude: number, 
    latitude: number, 
    width: number, 
    height: number
  ): [number, number] => {
    // Simple mercator projection
    const x = (longitude + 180) * (width / 360);
    const latRad = latitude * Math.PI / 180;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (height / 2) - (width * mercN / (2 * Math.PI));
    return [x, y];
  };

  // Try to load token from localStorage on first render
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox-token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setTokenEntered(true);
    }
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox-token', mapboxToken);
      setTokenEntered(true);
    }
  };

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapboxRef.current || !tokenEntered || !mapboxToken || !useMapbox) return;
    
    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapboxRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        zoom: 1.5,
        center: [30, 15],
        pitch: 45,
        attributionControl: false,
      });
      
      map.current.on('load', () => {
        if (!map.current) return;
        
        setLoading(false);
        
        // Add fog effect
        map.current.setFog({
          color: 'rgb(10, 10, 40)',
          'high-color': 'rgb(10, 10, 40)',
          'horizon-blend': 0.4,
        });
        
        // Add markers for each country
        data.regions.forEach(region => {
          region.countries.forEach(country => {
            const isSelected = selectedCountry?.id === country.id;
            
            // Create custom marker element
            const el = document.createElement('div');
            el.className = 'country-marker';
            el.style.width = isSelected ? '15px' : '8px';
            el.style.height = isSelected ? '15px' : '8px';
            el.style.borderRadius = '50%';
            el.style.background = region.color;
            el.style.boxShadow = `0 0 ${isSelected ? '10px' : '5px'} ${region.color}`;
            el.style.border = '1px solid white';
            el.style.cursor = 'pointer';
            
            // Add popup for each country
            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 15,
              className: 'country-popup'
            })
            .setHTML(`
              <div style="color: white; text-align: center; min-width: 100px;">
                <strong>${country.name}</strong>
                <div>${country.connectors} Connectors</div>
                <div>${country.logTraffic} KB/s</div>
              </div>
            `);
            
            // Create marker
            const marker = new mapboxgl.Marker(el)
              .setLngLat(country.coordinates)
              .setPopup(popup);
              
            // Show popup for selected country
            if (isSelected) {
              marker.togglePopup();
            }
            
            marker.addTo(map.current!);
          });
        });
        
        // Add Bengaluru marker
        const bengaluruEl = document.createElement('div');
        bengaluruEl.className = 'bengaluru-marker';
        bengaluruEl.style.width = '18px';
        bengaluruEl.style.height = '18px';
        bengaluruEl.style.borderRadius = '50%';
        bengaluruEl.style.background = '#9b87f5';
        bengaluruEl.style.boxShadow = '0 0 15px #9b87f5';
        bengaluruEl.style.border = '2px solid white';
        
        const bengaluruPopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 20,
          className: 'bengaluru-popup'
        })
        .setHTML(`
          <div style="color: white; text-align: center; min-width: 150px;">
            <strong>Microland Bengaluru</strong>
            <div>Global Command Center</div>
          </div>
        `);
        
        new mapboxgl.Marker(bengaluruEl)
          .setLngLat(data.bengaluruCoordinates)
          .setPopup(bengaluruPopup)
          .addTo(map.current);
        
        // Add pulse animation to Bengaluru marker
        bengaluruEl.style.animation = 'pulse 2s infinite';
        
        // Add connecting lines from countries to Bengaluru
        data.regions.forEach(region => {
          region.countries.forEach(country => {
            const isSelected = selectedCountry?.id === country.id;
            
            // Only draw lines for selected country or if none is selected
            if (!selectedCountry || isSelected) {
              // Add a line between the country and Bengaluru
              map.current!.addSource(`line-${country.id}`, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      country.coordinates,
                      data.bengaluruCoordinates
                    ]
                  }
                }
              });
              
              map.current!.addLayer({
                id: `line-${country.id}`,
                type: 'line',
                source: `line-${country.id}`,
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': region.color,
                  'line-width': isSelected ? 3 : 1.5,
                  'line-opacity': isSelected ? 0.8 : 0.5,
                  'line-dasharray': [2, 2]
                }
              });
            }
          });
        });
      });
      
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(e.error?.message || 'Error loading map');
        setLoading(false);
        fallbackToCanvas();
      });
      
      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
      setMapError('Failed to initialize map');
      setLoading(false);
      fallbackToCanvas();
    }
  }, [data, selectedCountry, tokenEntered, mapboxToken, useMapbox]);
  
  const fallbackToCanvas = () => {
    setUseMapbox(false);
  };
  
  // Canvas fallback implementation
  useEffect(() => {
    if (useMapbox || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const containerHeight = canvas.parentElement?.clientHeight || 500;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      drawMap();
    };
    
    const drawMap = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle world map outline (simplified)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Simplified world outline - just some continents outlines for effect
      const worldOutline = [
        // North America rough outline
        [-125, 49], [-100, 60], [-85, 50], [-80, 25], [-100, 20], [-125, 49],
        // South America rough outline
        [-80, 10], [-60, 5], [-55, -35], [-75, -40], [-80, 10],
        // Europe/Africa rough outline
        [0, 50], [25, 60], [30, 40], [20, 5], [-15, 15], [0, 50],
        // Asia/Australia rough outline
        [35, 40], [100, 60], [140, 40], [115, 0], [140, -25], [110, -20], [80, 10], [35, 40]
      ];
      
      worldOutline.forEach(([lon, lat], index) => {
        const [x, y] = geoToCanvas(lon, lat, canvas.width, canvas.height);
        if (index === 0 || index === 6 || index === 11 || index === 17) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw glowing dots for each country
      data.regions.forEach(region => {
        region.countries.forEach(country => {
          const [x, y] = geoToCanvas(
            country.coordinates[0], 
            country.coordinates[1], 
            canvas.width, 
            canvas.height
          );
          
          const isSelected = selectedCountry?.id === country.id;
          
          // Glow effect
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, isSelected ? 15 : 8);
          gradient.addColorStop(0, isSelected ? region.color : `${region.color}AA`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(x, y, isSelected ? 15 : 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Center dot
          ctx.beginPath();
          ctx.fillStyle = isSelected ? '#FFFFFF' : region.color;
          ctx.arc(x, y, isSelected ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Country name if selected
          if (isSelected) {
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(country.name, x, y - 20);
            
            // Display metrics
            ctx.font = '10px Arial';
            ctx.fillText(`${country.connectors} Connectors`, x, y + 20);
            ctx.fillText(`${country.logTraffic} KB/s`, x, y + 35);
          }
        });
      });
      
      // Draw Bengaluru command center
      const [bengX, bengY] = geoToCanvas(
        data.bengaluruCoordinates[0], 
        data.bengaluruCoordinates[1], 
        canvas.width, 
        canvas.height
      );
      
      // Command center glow
      const cmdGradient = ctx.createRadialGradient(bengX, bengY, 0, bengX, bengY, 20);
      cmdGradient.addColorStop(0, '#9b87f5');
      cmdGradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.fillStyle = cmdGradient;
      ctx.arc(bengX, bengY, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Command center dot
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.arc(bengX, bengY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Command center label
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('Microland Bengaluru', bengX, bengY - 25);
      ctx.fillText('Global Command Center', bengX, bengY - 10);
      
      // Draw connection lines from selected country (or all countries if none selected)
      const drawConnections = selectedCountry 
        ? [selectedCountry] 
        : data.regions.flatMap(r => r.countries);
      
      drawConnections.forEach(country => {
        const [countryX, countryY] = geoToCanvas(
          country.coordinates[0], 
          country.coordinates[1], 
          canvas.width, 
          canvas.height
        );
        
        // Find the region this country belongs to
        const region = data.regions.find(r => 
          r.countries.some(c => c.id === country.id)
        );
        
        if (!region) return;
        
        // Draw animated connection line
        const currentTime = Date.now() / 1000;
        const speed = 1; // Animation speed
        const dashLength = 5; // Length of dash
        
        ctx.beginPath();
        ctx.strokeStyle = region.color;
        ctx.lineWidth = 2;
        
        // Create dashed line with animation
        ctx.setLineDash([dashLength, dashLength]);
        ctx.lineDashOffset = -currentTime * speed * 10;
        
        // Draw line from country to Bengaluru
        ctx.moveTo(countryX, countryY);
        ctx.lineTo(bengX, bengY);
        ctx.stroke();
        
        // Reset dash
        ctx.setLineDash([]);
        
        // Data packets animation
        const packetCount = 3; // Number of data packets on the line
        for (let i = 0; i < packetCount; i++) {
          // Position along the line (0 to 1)
          const pos = (currentTime * speed / 2 + i / packetCount) % 1;
          
          // Calculate position
          const packetX = countryX + (bengX - countryX) * pos;
          const packetY = countryY + (bengY - countryY) * pos;
          
          // Draw data packet
          ctx.beginPath();
          ctx.fillStyle = '#FFFFFF';
          ctx.arc(packetX, packetY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };
    
    // Initial draw
    resizeCanvas();
    
    // Set up animation
    let animationFrameId: number;
    const animate = () => {
      drawMap();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    
    // Add resize listener
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [data, selectedCountry, useMapbox]);

  // Token entry form
  if (useMapbox && !tokenEntered) {
    return (
      <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
        <Card className="w-[400px] max-w-[90%]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyber-blue" />
              Mapbox API Token Required
            </CardTitle>
            <CardDescription>
              Please enter your Mapbox public token to display the global map.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleTokenSubmit}>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  You need to create a free account at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-cyber-blue hover:underline">Mapbox.com</a> and get your public token.
                </p>
                <Input
                  placeholder="Enter your Mapbox public token"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full">
                Save Token & Load Map
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={fallbackToCanvas}>
                Use Basic Map Instead
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  if (useMapbox && loading) {
    return (
      <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyber-blue" />
          <p className="text-white">Loading map...</p>
        </div>
      </div>
    );
  }

  if (useMapbox && mapError) {
    return (
      <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
        <Card className="w-[400px] max-w-[90%]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyber-red">
              <AlertTriangle className="h-5 w-5" />
              Map Error
            </CardTitle>
            <CardDescription>
              There was an error loading the Mapbox map: {mapError}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => setTokenEntered(false)} className="w-full">
              Change Mapbox Token
            </Button>
            <Button onClick={fallbackToCanvas} variant="outline" className="w-full">
              Use Basic Map Instead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {useMapbox ? (
        <div className="absolute inset-0">
          <div ref={mapboxRef} className="w-full h-full"></div>
          <div className="absolute top-2 right-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTokenEntered(false)}
              className="bg-black/60 hover:bg-black/80 text-white border-gray-700 text-xs"
            >
              Change Token
            </Button>
          </div>
        </div>
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0" />
      )}
    </div>
  );
};

export default GlobalMap;
