
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Zap, Play, FileJson, MessageSquare, PanelLeftClose, PanelRightClose, ToggleRight, ToggleLeft } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AnalystMini = () => {
  const [asyncActive, setAsyncActive] = useState(false);
  const [syncActive, setSyncActive] = useState(false);
  const [isScenarioActive, setIsScenarioActive] = useState(false);

  return (
    <PageLayout 
      title="Analyst Mini – Async & Sync Mode" 
      description="AI-powered analyst workspace for threat and incident workflow simulation"
      className="bg-gradient-to-br from-cyber-gray-900 to-cyber-gray-800"
    >
      <div className="flex flex-col gap-6">
        {/* Control Panel */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-3 h-3 rounded-full bg-cyber-green animate-pulse-glow"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-cyber-gray-300">System Ready</span>
          </div>
          
          <Button 
            onClick={() => setIsScenarioActive(!isScenarioActive)} 
            className={`gap-2 transition-all duration-300 ${
              isScenarioActive 
                ? "bg-cyber-red hover:bg-cyber-red/80" 
                : "bg-cyber-indigo hover:bg-cyber-indigo/80"
            }`}
          >
            {isScenarioActive ? (
              <>
                <Zap className="w-4 h-4" />
                <span>End Scenario</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Launch Scenario</span>
              </>
            )}
          </Button>
        </div>
        
        {/* Analyst Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Async Analyst */}
          <AnalystTile 
            title="Async Analyst"
            description="For batch processing and detailed analysis"
            isActive={asyncActive}
            setIsActive={setAsyncActive}
            colorClass="from-[#1a1a3a] to-[#0d0d2b] border-[#4242e2]/20"
            glowClass="before:bg-[#4242e2]"
            iconLeft={<PanelLeftClose className="w-5 h-5 text-[#9b87f5]" />}
          />
          
          {/* Sync Analyst */}
          <AnalystTile 
            title="Sync Analyst"
            description="For real-time monitoring and response"
            isActive={syncActive}
            setIsActive={setSyncActive}
            colorClass="from-[#1a3a1a] to-[#0d2b0d] border-[#42e242]/20"
            glowClass="before:bg-[#42e242]"
            iconLeft={<PanelRightClose className="w-5 h-5 text-[#42e242]" />}
          />
        </div>
        
        {/* Visualization Area */}
        <Card className="p-6 border border-cyber-blue/10 bg-cyber-gray-900/80 backdrop-blur-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-cyber-gray-100">Insight Fusion Grid</h3>
            <span className="text-xs text-cyber-gray-400">
              {isScenarioActive ? 'Scenario Active - Processing' : 'Idle - Waiting for input'}
            </span>
          </div>
          
          <div className="h-[200px] flex items-center justify-center">
            {isScenarioActive ? (
              <VisualizationBackground />
            ) : (
              <div className="text-center text-cyber-gray-500">
                <Zap className="w-10 h-10 mx-auto opacity-40 mb-3" />
                <p>Launch a scenario to view real-time insights and correlations</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

// Analyst Tile Component
interface AnalystTileProps {
  title: string;
  description: string;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  colorClass: string;
  glowClass: string;
  iconLeft: React.ReactNode;
}

const AnalystTile: React.FC<AnalystTileProps> = ({ 
  title, 
  description, 
  isActive, 
  setIsActive, 
  colorClass, 
  glowClass,
  iconLeft
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'json'>('text');

  return (
    <motion.div 
      className={`rounded-xl border bg-gradient-to-br ${colorClass} relative overflow-hidden
                 ${isActive ? 'shadow-lg' : 'shadow-md'} transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 opacity-0 ${isActive ? 'opacity-10' : ''} 
                      transition-opacity duration-300 pointer-events-none
                      before:content-[''] before:absolute before:inset-0 ${glowClass} before:blur-3xl before:opacity-30`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {iconLeft}
            <h3 className="font-medium text-white">{title}</h3>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cyber-gray-400">{isActive ? 'Active' : 'Inactive'}</span>
                  <Switch 
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className={`${isActive ? 'bg-cyber-green' : 'bg-cyber-gray-600'}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {title} activation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <p className="text-xs text-cyber-gray-400 mb-4">{description}</p>
        
        {/* Input Mode Selector */}
        <div className="bg-black/30 rounded-lg p-2 flex justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setInputMode('text')}
            className={`${inputMode === 'text' ? 'bg-cyber-gray-800' : ''} text-xs px-3`}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Text Input
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setInputMode('json')}
            className={`${inputMode === 'json' ? 'bg-cyber-gray-800' : ''} text-xs px-3`}
          >
            <FileJson className="w-3 h-3 mr-1" />
            JSON Data
          </Button>
        </div>
        
        {/* Input Area */}
        <div className="mb-4">
          <Textarea 
            placeholder={inputMode === 'text' 
              ? "Enter your analysis request..." 
              : '{\n  "data": "Paste JSON structure here"\n}'
            }
            className="bg-black/30 border-cyber-gray-700 h-24 text-xs font-mono"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <UploadCloud className="w-3 h-3" />
            Upload Data
          </Button>
          <Button 
            size="sm" 
            className={`text-xs gap-1 ${isActive ? 'bg-cyber-blue hover:bg-cyber-blue/80' : 'bg-cyber-gray-700'}`}
            disabled={!isActive}
          >
            <Zap className="w-3 h-3" />
            Process
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Visualization Background Component
const VisualizationBackground = () => {
  return (
    <div className="absolute inset-0 opacity-20 overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4242e2" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Animated Circles */}
        {[...Array(20)].map((_, i) => {
          const size = Math.random() * 50 + 10;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const duration = Math.random() * 20 + 10;
          
          return (
            <motion.circle 
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r={size}
              fill={i % 2 === 0 ? "#4242e2" : "#42e242"}
              initial={{ opacity: 0.1 }}
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          );
        })}
        
        {/* Connection Lines */}
        {[...Array(15)].map((_, i) => {
          const x1 = Math.random() * 100;
          const y1 = Math.random() * 100;
          const x2 = Math.random() * 100;
          const y2 = Math.random() * 100;
          
          return (
            <motion.line 
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke={i % 3 === 0 ? "#42e242" : i % 3 === 1 ? "#4242e2" : "#e24242"}
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
              }}
              transition={{ 
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default AnalystMini;
