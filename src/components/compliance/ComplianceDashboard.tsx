
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComplianceAgents } from './ComplianceAgentContext';
import ComplianceFilters from './ComplianceFilters';
import ComplianceVisualization from './ComplianceVisualization';
import ComplianceAgentModal from './ComplianceAgentModal';

const ComplianceDashboard: React.FC = () => {
  const { 
    agents, 
    visibleCategories,
    closeAllAgents,
    focusMode
  } = useComplianceAgents();
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Find the agent that is currently expanded
  const expandedAgent = agents.find(agent => agent.isExpanded);
  
  // Filter agents by visible categories
  const filteredAgents = agents.filter(agent => 
    agent.isActive && visibleCategories.includes(agent.category)
  );

  // Handle click outside of components to close expanded agent
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        closeAllAgents();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeAllAgents]);

  return (
    <div ref={dashboardRef} className="flex flex-col h-full">
      <ComplianceFilters />
      
      <div className="flex-1 relative mt-4 rounded-lg border bg-card">
        <ComplianceVisualization agents={filteredAgents} />
        
        <AnimatePresence>
          {expandedAgent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`absolute ${focusMode ? 'inset-0' : 'bottom-4 right-4 max-w-md'} 
                          z-10 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg 
                          border border-border`}
            >
              <ComplianceAgentModal agent={expandedAgent} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
