
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@/hooks/use-theme';
import { incidentTimelineData } from './mockData';

interface IncidentTimelineProps {
  width?: number;
  height?: number;
  className?: string;
}

export const D3IncidentTimeline: React.FC<IncidentTimelineProps> = ({
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
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Parse dates
    const data = incidentTimelineData.map(d => ({
      ...d,
      parsedDate: new Date(d.date)
    }));

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.parsedDate) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.critical + d.high + d.medium + d.low) as number])
      .nice()
      .range([innerHeight, 0]);

    // Create color scale
    const color = d3.scaleOrdinal<string>()
      .domain(['critical', 'high', 'medium', 'low'])
      .range(['#FF3B30', '#FF9500', '#FFCC00', '#5AC8FA']);

    // Stack generator
    const stack = d3.stack<any>()
      .keys(['critical', 'high', 'medium', 'low'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(data);

    // Create area generator
    const area = d3.area<d3.SeriesPoint<any>>()
      .x(d => x(data[d.data.index].parsedDate))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveMonotoneX);

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

    // Add the areas
    data.forEach((d, i) => {
      d.index = i;
    });

    g.selectAll('.area')
      .data(series)
      .join('path')
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', (d, i) => color(d.key))
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
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
      .text('Incident Count');

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
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(['Low', 'Medium', 'High', 'Critical'].reverse())
      .join('g')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);

    legend.append('rect')
      .attr('x', innerWidth - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', d => color(d.toLowerCase()));

    legend.append('text')
      .attr('x', innerWidth - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .attr('fill', theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)')
      .text(d => d);
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

export default D3IncidentTimeline;
