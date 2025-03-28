
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { ComplianceAgent, useComplianceAgents } from './ComplianceAgentContext';

interface ComplianceVisualizationProps {
  agents: ComplianceAgent[];
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  r: number;
}

const ComplianceVisualization: React.FC<ComplianceVisualizationProps> = ({ agents }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { toggleAgentExpanded, focusMode, focusedAgent, setFocusedAgent } = useComplianceAgents();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Create D3 visualization
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || agents.length === 0) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;
    
    // Define node size based on screen dimensions
    const baseRadius = Math.min(width, height) * 0.08;
    
    // Create nodes from agents
    const nodes: D3Node[] = agents.map(agent => ({
      ...agent,
      r: baseRadius,
    }));

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(30))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as D3Node).r * 1.5))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Create groups for nodes
    const nodeGroups = svg.selectAll('g')
      .data(nodes, d => (d as D3Node).id)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('data-id', d => d.id)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        const id = d.id;
        toggleAgentExpanded(id);
        if (focusMode) {
          setFocusedAgent(id);
        }
      })
      .on('mouseover', function(event, d) {
        setHoveredNode(d.id);
      })
      .on('mouseout', function() {
        setHoveredNode(null);
      })
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles (main node body)
    nodeGroups.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => getColorByCategory(d.category))
      .attr('fill-opacity', 0.7)
      .attr('stroke', d => d3.color(getColorByCategory(d.category))?.brighter(1.5).toString() || 'white')
      .attr('stroke-width', 2)
      .attr('class', 'node-circle');

    // Add glowing effect
    nodeGroups.append('circle')
      .attr('r', d => d.r * 1.2)
      .attr('fill', 'none')
      .attr('stroke', d => d3.color(getColorByCategory(d.category))?.brighter(1.5).toString() || 'white')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.5)
      .attr('class', 'glow-circle')
      .style('filter', 'blur(3px)');

    // Add pulse animation circles
    nodeGroups.append('circle')
      .attr('r', d => d.r * 1.1)
      .attr('fill', 'none')
      .attr('stroke', d => d3.color(getColorByCategory(d.category))?.brighter(1.5).toString() || 'white')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.7)
      .attr('class', 'pulse-circle')
      .style('animation', 'pulse 2s infinite');

    // Add icons
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('y', -5)
      .style('font-size', `${baseRadius * 0.6}px`)
      .text(d => d.icon);

    // Add labels
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('y', baseRadius * 0.4)
      .attr('class', 'node-label')
      .style('font-size', `${baseRadius * 0.25}px`)
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text(d => d.name);

    // Add tooltips
    nodeGroups.append('title')
      .text(d => d.description);

    // Update node positions on simulation tick
    simulation.on('tick', () => {
      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Helper function to get color based on category
    function getColorByCategory(category: string): string {
      switch(category) {
        case 'Data Privacy':
          return '#4d79ff'; // Blue
        case 'Regulatory':
          return '#ff6b6b'; // Red
        case 'Security Frameworks':
          return '#4acf7f'; // Green
        default:
          return '#9b87f5'; // Purple
      }
    }

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.3;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      simulation.stop();
      document.head.removeChild(style);
    };
  }, [agents, dimensions, toggleAgentExpanded, focusMode, setFocusedAgent]);

  return (
    <div className="w-full h-[500px] relative">
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* D3 will render here */}
      </svg>
      
      {/* Hover tooltip */}
      <AnimatedTooltip 
        hoveredNode={hoveredNode} 
        agents={agents} 
      />
    </div>
  );
};

// Animated tooltip component
const AnimatedTooltip: React.FC<{ 
  hoveredNode: string | null;
  agents: ComplianceAgent[];
}> = ({ hoveredNode, agents }) => {
  const agent = agents.find(a => a.id === hoveredNode);
  
  if (!agent) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute z-10 p-3 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 text-white max-w-xs"
      style={{ 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{agent.icon}</span>
        <h3 className="font-medium">{agent.name}</h3>
      </div>
      <p className="text-sm mt-1 text-gray-300">{agent.description}</p>
    </motion.div>
  );
};

export default ComplianceVisualization;
