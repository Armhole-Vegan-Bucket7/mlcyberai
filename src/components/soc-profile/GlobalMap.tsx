
import React, { useRef, useEffect } from 'react';
import { SOCProfileData, RegionCountry } from '@/types/socProfile';

interface GlobalMapProps {
  data: SOCProfileData;
  selectedCountry: RegionCountry | null;
}

const GlobalMap: React.FC<GlobalMapProps> = ({ data, selectedCountry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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

  useEffect(() => {
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
  }, [data, selectedCountry]);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default GlobalMap;
