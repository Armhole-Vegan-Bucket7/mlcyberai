
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { incidentTimelineData } from './mockData';
import { useTenantContext } from '@/contexts/TenantContext';

const D3IncidentTimeline: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { selectedTenant } = useTenantContext();
  const [data, setData] = useState(incidentTimelineData);
  
  // Parse the dates once
  const parsedData = data.map(d => ({
    ...d,
    parsedDate: new Date(d.date)
  }));

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleTime()
      .domain(d3.extent(parsedData, d => d.parsedDate) as [Date, Date])
      .range([0, width]);

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(parsedData, d => d.critical + d.high + d.medium + d.low) as number])
      .range([height, 0]);

    // Stack the data
    const keys = ["critical", "high", "medium", "low"];
    const stack = d3.stack<(typeof parsedData)[0]>().keys(keys);
    const stackedData = stack(parsedData);

    // Color scale
    const color = d3.scaleOrdinal<string>()
      .domain(keys)
      .range(["#FF3B30", "#FF9500", "#FFCC00", "#34C759"]);

    // Area generator
    const area = d3.area<d3.SeriesPoint<(typeof parsedData)[0]>>()
      .x(d => x(parsedData[d.data.parsedDate ? parsedData.findIndex(p => p.parsedDate === d.data.parsedDate) : 0].parsedDate))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveMonotoneX);

    // Add the areas
    svg.selectAll(".area")
      .data(stackedData)
      .join("path")
      .attr("class", "area")
      .attr("fill", (d, i) => color(keys[i]))
      .attr("d", area)
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 1);
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "1";
          tooltipRef.current.style.visibility = "visible";
        }
      })
      .on("mousemove", function(event, d) {
        if (!tooltipRef.current) return;
        
        const [mouseX, mouseY] = d3.pointer(event);
        const xDate = x.invert(mouseX);
        
        // Find the closest data point
        const bisect = d3.bisector((d: {parsedDate: Date}) => d.parsedDate).left;
        const index = bisect(parsedData, xDate, 1);
        const dataPoint = parsedData[index - 1];
        
        if (!dataPoint) return;
        
        const key = d.key as keyof typeof dataPoint;
        const value = dataPoint[key];
        
        tooltipRef.current.innerHTML = `
          <div class="font-medium">${d.key}: ${value}</div>
          <div class="text-xs opacity-75">${dataPoint.date}</div>
        `;
        
        tooltipRef.current.style.left = `${event.pageX + 10}px`;
        tooltipRef.current.style.top = `${event.pageY - 20}px`;
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.8);
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0";
          tooltipRef.current.style.visibility = "hidden";
        }
      });

    // Add the X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %Y") as any));

    // Add the Y Axis
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Add legend
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", color);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d.charAt(0).toUpperCase() + d.slice(1));

  }, [data]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="text-sm text-cyber-gray-500 mb-2">
        Showing {data.length} incidents over time for {selectedTenant.name}
      </div>
      <div className="flex-1 relative">
        <svg ref={svgRef} width="100%" height="100%" />
        <div 
          ref={tooltipRef}
          className="absolute opacity-0 visibility-hidden bg-background border border-border rounded p-2 shadow-lg text-sm pointer-events-none z-10 transition-opacity" 
          style={{ 
            opacity: 0, 
            visibility: 'hidden',
            maxWidth: '200px',
            whiteSpace: 'nowrap'
          }}
        ></div>
      </div>
    </div>
  );
};

export default D3IncidentTimeline;
