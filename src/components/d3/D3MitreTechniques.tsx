
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@/hooks/use-theme';
import { mitreTechniqueData } from './mockData';

interface MitreTechniquesProps {
  width?: number;
  height?: number;
  className?: string;
}

export const D3MitreTechniques: React.FC<MitreTechniquesProps> = ({
  width = 800,
  height = 400,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useTheme();
  const [dimensions, setDimensions] = useState({ width, height });

  // Update chart when theme changes
  useEffect(() => {
    const updateChart = () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        
        // Calculate actual dimensions based on parent container
        const containerWidth = svgRef.current.parentElement?.clientWidth || width;
        const containerHeight = svgRef.current.parentElement?.clientHeight || height;
        
        setDimensions({
          width: containerWidth,
          height: containerHeight
        });
        
        createChart(svg, containerWidth, containerHeight);
      }
    };

    // Update chart
    updateChart();

    // Add resize listener
    const handleResize = () => updateChart();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, width, height]);

  const createChart = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, width: number, height: number) => {
    // Set margins
    const margin = { top: 30, right: 100, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Parse dates
    const data = mitreTechniqueData.map(d => ({
      ...d,
      parsedDate: new Date(d.date)
    }));

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.parsedDate) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(
        d.initialAccess, 
        d.execution, 
        d.persistence, 
        d.privilegeEscalation, 
        d.defensiveEvasion
      )) as number * 1.2])
      .nice()
      .range([innerHeight, 0]);

    // Create color scale
    const color = d3.scaleOrdinal<string>()
      .domain(['initialAccess', 'execution', 'persistence', 'privilegeEscalation', 'defensiveEvasion'])
      .range(['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA']);

    // Create the container group with margin
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create grid lines
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(y.ticks(5))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
      .attr('stroke-dasharray', '2,2');

    // Prepare line data
    const categories = ['initialAccess', 'execution', 'persistence', 'privilegeEscalation', 'defensiveEvasion'];
    const categoryNames = ['Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defensive Evasion'];
    
    // Create area generator
    categories.forEach((category, i) => {
      const area = d3.area<any>()
        .x(d => x(d.parsedDate))
        .y0(innerHeight)
        .y1(d => y(d[category]))
        .curve(d3.curveBasis);

      g.append('path')
        .datum(data)
        .attr('fill', color(category))
        .attr('fill-opacity', 0.3)
        .attr('d', area);

      const line = d3.line<any>()
        .x(d => x(d.parsedDate))
        .y(d => y(d[category]))
        .curve(d3.curveBasis);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color(category))
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add dots
      g.selectAll(`.dot-${category}`)
        .data(data)
        .join('circle')
        .attr('class', `dot-${category}`)
        .attr('cx', d => x(d.parsedDate))
        .attr('cy', d => y(d[category]))
        .attr('r', 4)
        .attr('fill', color(category))
        .attr('stroke', theme === 'dark' ? '#1F2937' : '#FFFFFF')
        .attr('stroke-width', 1.5);
    });

    // Add the x-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d3.timeFormat('%b %d') as any))
      .selectAll('text')
      .attr('fill', theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)')
      .attr('dy', '1em');

    // Add the y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y)
        .ticks(5))
      .selectAll('text')
      .attr('fill', theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)');

    // Add axis labels
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${-40}, ${innerHeight/2}) rotate(-90)`)
      .attr('fill', theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)')
      .style('font-size', '12px')
      .text('Technique Count');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${innerWidth/2}, ${innerHeight + 40})`)
      .attr('fill', theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)')
      .style('font-size', '12px')
      .text('Date');

    // Add legend
    const legend = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data(categories.map((c, i) => ({ name: c, displayName: categoryNames[i], color: color(c) })))
      .join('g')
      .attr('transform', (d, i) => `translate(${innerWidth + 10},${i * 20})`);

    legend.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => d.color);

    legend.append('text')
      .attr('x', 18)
      .attr('y', 6)
      .attr('dy', '0.32em')
      .attr('fill', theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)')
      .text(d => d.displayName);
  };

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default D3MitreTechniques;
