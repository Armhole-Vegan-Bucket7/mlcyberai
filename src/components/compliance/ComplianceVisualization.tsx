
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { ComplianceAgent, useComplianceAgents } from './ComplianceAgentContext';
import { Shield, Lock, FileCheck, FileWarning, FileText, FileCode, BarChart4, Database } from 'lucide-react';

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
        d3.select(this).transition()
          .duration(200)
          .attr('transform', `translate(${d.x},${d.y}) scale(1.05)`);
      })
      .on('mouseout', function(event, d) {
        setHoveredNode(null);
        d3.select(this).transition()
          .duration(200)
          .attr('transform', `translate(${d.x},${d.y}) scale(1)`);
      })
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Dark background base circle
    nodeGroups.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => getDarkBackground(d.id))
      .attr('class', 'node-circle');

    // Add glowing effect
    nodeGroups.append('circle')
      .attr('r', d => d.r * 1.2)
      .attr('fill', 'none')
      .attr('stroke', d => getGlowColor(d.id))
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.7)
      .attr('class', 'glow-circle')
      .style('filter', 'blur(4px)');

    // Add pulse animation circles
    nodeGroups.append('circle')
      .attr('r', d => d.r * 1.1)
      .attr('fill', 'none')
      .attr('stroke', d => getGlowColor(d.id))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.5)
      .attr('class', 'pulse-circle')
      .style('animation', 'pulse 3s infinite ease-in-out');

    // Add icons based on agent ID
    nodeGroups.append('g')
      .attr('class', 'icon-container')
      .attr('transform', 'translate(0, -5)')
      .each(function(d) {
        const iconContainer = d3.select(this);
        iconContainer.append('path')
          .attr('d', getIconPath(d.id))
          .attr('fill', '#ffffff')
          .attr('transform', 'scale(0.04) translate(-256, -256)'); // Center 512x512 icons
      });

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

    // Helper function to get dark background color based on agent ID
    function getDarkBackground(id: string): string {
      switch(id) {
        case 'pci':
          return '#3A0E1B'; // Deep red
        case 'gdpr':
          return '#0B1A36'; // Midnight blue
        case 'hipaa':
          return '#3A1512'; // Dark salmon
        case 'iso27001':
          return '#1A2C32'; // Deep teal
        case 'nist':
          return '#1A1A1A'; // Charcoal
        case 'ccpa':
          return '#1F1A33'; // Deep purple
        case 'sox':
          return '#1A2D1A'; // Forest green
        case 'cmmc':
          return '#2D1A2D'; // Dark magenta
        default:
          return '#1F2937'; // Default dark
      }
    }

    // Helper function to get glow color based on agent ID
    function getGlowColor(id: string): string {
      switch(id) {
        case 'pci':
          return '#FF1493'; // Neon pink
        case 'gdpr':
          return '#4169E1'; // Cobalt blue
        case 'hipaa':
          return '#40E0D0'; // Aqua
        case 'iso27001':
          return '#4CD3C2'; // Turquoise
        case 'nist':
          return '#00FF7F'; // Bright green
        case 'ccpa':
          return '#9370DB'; // Medium purple
        case 'sox':
          return '#ADFF2F'; // Yellow green
        case 'cmmc':
          return '#FF6EC7'; // Hot pink
        default:
          return '#60A5FA'; // Default blue
      }
    }

    // Helper function to get SVG paths for icons
    function getIconPath(id: string): string {
      switch(id) {
        case 'pci':
          return 'M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM384 160c0 8.8-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16zM288 96c8.8 0 16 7.2 16 16s-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16zM224 160c0 8.8-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16zM144 96c8.8 0 16 7.2 16 16s-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16zM80 160c0 8.8-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16zM384 352c0 8.8-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16zM288 288c8.8 0 16 7.2 16 16s-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16zM224 352c0 8.8-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16zM144 288c8.8 0 16 7.2 16 16s-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16zM80 352c0 8.8-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16zM311.9 419.7c-1.5-3.6-5-6-8.9-5.9c-1.1 0-2.2 .2-3.2 .6c-.8 .3-1.6 .8-2.3 1.3c-1.4 1.1-2.5 2.5-3.1 4.1c-.6 1.6-.8 3.4-.5 5.1c.8 4.1 4.8 6.9 8.9 6.1c1-.2 1.9-.5 2.8-1.1c1.7-.9 3-2.5 3.6-4.3s.6-3.8 0-5.7c-.3-.9-.8-1.7-1.4-2.4c-1.1-1.4-2.6-2.5-4.3-3c-1.6-.4-3.3-.4-4.9 .1c-3.2 1-5.5 3.9-5.7 7.3c-.1 1.7 .3 3.4 1.1 4.9c.8 1.4 2.1 2.6 3.5 3.3c.7 .4 1.5 .6 2.3 .8c.9 .1 1.8 .1 2.7 0c1.8-.3 3.4-1.2 4.7-2.4c1.2-1.3 2.1-2.9 2.3-4.7c.1-.9 .1-1.8 0-2.7c-.3-1.8-1.2-3.4-2.4-4.7c-1.3-1.2-2.9-2.1-4.7-2.3c-.4-.1-.9-.1-1.4-.1h-.3c-3.6 .3-6.7 2.7-7.8 6.2'; // Credit card
        case 'gdpr':
          return 'M243.4 2.6l-224 96c-14 6-21.8 21-18.7 35.8S16.8 160 32 160v8c0 13.3 10.7 24 24 24H456c13.3 0 24-10.7 24-24v-8c15.2 0 28.3-10.7 31.3-25.6s-4.8-29.9-18.7-35.8l-224-96c-8.1-3.4-17.2-3.4-25.2 0zM128 224H64V420.3c-.6 .3-1.2 .7-1.8 1.1l-48 32c-11.7 7.8-17 22.4-12.9 35.9S17.9 512 32 512H480c14.1 0 26.5-9.2 30.6-22.7s-1.1-28.1-12.9-35.9l-48-32c-.6-.4-1.2-.7-1.8-1.1V224H384V416H344V224H280V416H232V224H168V416H128V224zm128-96c-8.8 0-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16s-7.2 16-16 16z'; // Government building
        case 'hipaa':
          return 'M256 0c53 0 96 43 96 96v47.6 32.4V192h.3c-.2 5.4-.3 10.8-.3 16.3 0 65.5 15.5 97.1 33.2 121.5 3.8 5.3 7.5 10.7 10.8 16.3 5.5 9.5 5.6 21 .4 30.7S385 400 374.8 400H265.3 246.7 137.2c-10.2 0-19.6-5.3-24.8-14c-5.3-8.7-5.6-19.4-1-28.3 3.4-6.5 7.8-12.7 11.9-18.6C137.8 317.3 144 287.9 144 256.3c0-.5 0 0 0 0l-.1-16.8-.3-.2h.4c0-16.1 1.6-47.1 1.6-47.1V128 96 96c0-53 43-96 96-96zM206.5 128h99.1V96c0-23.7-18.5-42.3-41.9-42.3H248.4c-23.7 0-41.9 18.5-41.9 42.3v32zm153 48l-.4 .4H153l-.4-.4c.5 16.3 1.3 28.2 1.5 32.6 0 0 0-.1 0 0v16C154 325.1 129 367.6 96.7 410.9l-.4 .7H415.7l-.2-.3C384.2 367.4 358 325.3 358 256.3v-16c0-21.9-.7-42.5-1.9-64.3H359.5zM432 512c0 8.8-7.2 16-16 16H96c-8.8 0-16-7.2-16-16s7.2-16 16-16H416c8.8 0 16 7.2 16 16z'; // Hospital
        case 'iso27001':
          return 'M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z'; // Lock
        case 'nist':
          return 'M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8l0 0z'; // Shield
        case 'ccpa':
          return 'M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V240c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V336c0 1.5 0 3.1 .1 4.6L67.6 283c-16-15.2-41.3-14.6-56.6 1.4s-14.6 41.3 1.4 56.6L124.8 448c43.1 41.1 100.4 64 160 64H304c97.2 0 176-78.8 176-176V128c0-17.7-14.3-32-32-32s-32 14.3-32 32V240c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V240c0 8.8-7.2 16-16 16s-16-7.2-16-16V32z'; // Privacy
        case 'sox':
          return 'M160 48c0-26.5 21.5-48 48-48s48 21.5 48 48V96h64c26.5 0 48 21.5 48 48v48h32c26.5 0 48 21.5 48 48v96c0 53-43 96-96 96H304 256 208c-53 0-96-43-96-96V240c0-26.5 21.5-48 48-48h32V144c0-26.5 21.5-48 48-48h64V48zM48 240v96c0 88.4 71.6 160 160 160h48 48 48c88.4 0 160-71.6 160-160V240c0-61.9-50.1-112-112-112H368 256 144C82.1 128 32 178.1 32 240v96c0 26.5 21.5 48 48 48h32V240c0-8.8-7.2-16-16-16s-16 7.2-16 16v80c0 44.2-35.8 80-80 80v32h64c61.9 0 112-50.1 112-112V240c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 44.2-35.8 80-80 80v32h64c61.9 0 112-50.1 112-112V240c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 44.2-35.8 80-80 80v32h64c61.9 0 112-50.1 112-112V240c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 44.2-35.8 80-80 80v32h64c61.9 0 112-50.1 112-112V240c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 0z'; // Chart
        case 'cmmc':
          return 'M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H448V352v32zm-192 96c0 17.7 14.3 32 32 32H352c17.7 0 32-14.3 32-32V448H256v32zM64 416v32c0 17.7 14.3 32 32 32h96c0-17.7 0-32 0-32V448H64zm0-64V224H32c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32H64z'; // Systems
        default:
          return 'M304 384H16c-8.8 0-16-7.2-16-16V80c0-8.8 7.2-16 16-16H304c8.8 0 16 7.2 16 16V368c0 8.8-7.2 16-16 16zM16 64C7.2 64 0 71.2 0 80V368c0 8.8 7.2 16 16 16H304c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16H16zM96 240c-8.8 0-16-7.2-16-16s7.2-16 16-16H208c8.8 0 16 7.2 16 16s-7.2 16-16 16H96zM80 272v48H224V272H80z'; // Default
      }
    }

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.3;
        }
        100% {
          transform: scale(1);
          opacity: 0.8;
        }
      }
      
      .node-group:hover .node-circle {
        filter: brightness(1.2);
        transform: scale(1.05);
        transition: all 0.2s ease-in-out;
      }
      
      .node-group:hover .glow-circle {
        filter: blur(6px);
        opacity: 0.9;
        transition: all 0.2s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      simulation.stop();
      document.head.removeChild(style);
    };
  }, [agents, dimensions, toggleAgentExpanded, focusMode, setFocusedAgent]);

  return (
    <div className="w-full h-[500px] relative bg-cyber-gray-900/70 rounded-lg">
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
  
  // Helper function to get tooltip color based on agent ID
  const getTooltipColor = (id: string): string => {
    switch(id) {
      case 'pci':
        return 'border-pink-500 bg-gradient-to-br from-red-900/90 to-pink-900/90';
      case 'gdpr':
        return 'border-blue-500 bg-gradient-to-br from-blue-900/90 to-indigo-900/90';
      case 'hipaa':
        return 'border-teal-500 bg-gradient-to-br from-red-800/90 to-teal-900/90';
      case 'iso27001':
        return 'border-teal-500 bg-gradient-to-br from-teal-900/90 to-cyan-900/90';
      case 'nist':
        return 'border-green-500 bg-gradient-to-br from-gray-900/90 to-green-900/90';
      case 'ccpa':
        return 'border-purple-500 bg-gradient-to-br from-purple-900/90 to-indigo-900/90';
      case 'sox':
        return 'border-lime-500 bg-gradient-to-br from-green-900/90 to-lime-900/90';
      case 'cmmc':
        return 'border-pink-500 bg-gradient-to-br from-purple-900/90 to-pink-900/90';
      default:
        return 'border-blue-500 bg-gradient-to-br from-gray-900/90 to-blue-900/90';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={`absolute z-10 p-3 backdrop-blur-sm rounded-lg shadow-lg border-2 text-white max-w-xs ${getTooltipColor(agent.id)}`}
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
