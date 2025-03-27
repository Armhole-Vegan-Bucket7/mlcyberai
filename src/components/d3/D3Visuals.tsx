
import React, { lazy, Suspense, useState } from 'react';
import FloatingPanel from './FloatingPanel';
import { Activity, AlertCircle, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy load the visualizations
const D3IncidentTimeline = lazy(() => import('./D3IncidentTimeline'));
const D3DetectionTrends = lazy(() => import('./D3DetectionTrends'));
const D3MitreTechniques = lazy(() => import('./D3MitreTechniques'));

interface D3VisualsProps {
  className?: string;
}

export const D3Visuals: React.FC<D3VisualsProps> = ({ className }) => {
  const [activePanels, setActivePanels] = useState<{
    incidents: boolean;
    detections: boolean;
    mitre: boolean;
  }>({
    incidents: false,
    detections: false,
    mitre: false,
  });

  const togglePanel = (panel: keyof typeof activePanels) => {
    setActivePanels(prev => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  const closePanel = (panel: keyof typeof activePanels) => {
    setActivePanels(prev => ({
      ...prev,
      [panel]: false,
    }));
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => togglePanel('incidents')}
        >
          <AlertCircle className="w-4 h-4 text-cyber-red" />
          <span>Incident Timeline</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => togglePanel('detections')}
        >
          <Activity className="w-4 h-4 text-cyber-blue" />
          <span>Detection Trends</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => togglePanel('mitre')}
        >
          <Cpu className="w-4 h-4 text-cyber-purple" />
          <span>MITRE Techniques</span>
        </Button>
      </div>
      
      {activePanels.incidents && (
        <FloatingPanel 
          title="Incident Timeline by Severity" 
          defaultPosition={{ x: 100, y: 100 }}
          defaultSize={{ width: 800, height: 500 }}
          onClose={() => closePanel('incidents')}
        >
          <div className="p-4 h-full">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading visualization...</div>}>
              <D3IncidentTimeline />
            </Suspense>
          </div>
        </FloatingPanel>
      )}
      
      {activePanels.detections && (
        <FloatingPanel 
          title="Detection Volume Trends" 
          defaultPosition={{ x: 150, y: 150 }}
          defaultSize={{ width: 800, height: 500 }}
          onClose={() => closePanel('detections')}
        >
          <div className="p-4 h-full">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading visualization...</div>}>
              <D3DetectionTrends />
            </Suspense>
          </div>
        </FloatingPanel>
      )}
      
      {activePanels.mitre && (
        <FloatingPanel 
          title="MITRE Technique Frequency" 
          defaultPosition={{ x: 200, y: 200 }}
          defaultSize={{ width: 800, height: 500 }}
          onClose={() => closePanel('mitre')}
        >
          <div className="p-4 h-full">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading visualization...</div>}>
              <D3MitreTechniques />
            </Suspense>
          </div>
        </FloatingPanel>
      )}
    </div>
  );
};

export default D3Visuals;
