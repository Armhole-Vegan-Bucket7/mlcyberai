
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Download, Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as d3 from 'd3';

interface ReportVisualizationProps {
  assessmentData: any;
}

const ReportVisualization: React.FC<ReportVisualizationProps> = ({ assessmentData }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const spiderChartRef = useRef<SVGSVGElement>(null);
  const heatmapRef = useRef<SVGSVGElement>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  // Process assessment data for visualization
  const processData = () => {
    if (!assessmentData?.assessment || !Array.isArray(assessmentData.assessment)) {
      return {
        functions: [],
        categories: [],
        scores: {},
        overallScore: 0
      };
    }

    const functions = assessmentData.assessment.map(f => f.function);
    let allCategories = [];
    let scoresByFunction = {};
    let totalScore = 0;
    let totalCategories = 0;

    for (const func of assessmentData.assessment) {
      let functionTotal = 0;
      for (const cat of func.categories) {
        allCategories.push({
          function: func.function,
          category: cat.category,
          score: cat.score
        });
        functionTotal += cat.score;
        totalScore += cat.score;
        totalCategories++;
      }
      scoresByFunction[func.function] = {
        total: functionTotal,
        avg: functionTotal / func.categories.length,
        categories: func.categories.length
      };
    }

    return {
      functions,
      categories: allCategories,
      scores: scoresByFunction,
      overallScore: Math.round((totalScore / totalCategories) * 10) / 10
    };
  };

  const data = processData();

  // Generate spider chart
  useEffect(() => {
    if (!spiderChartRef.current || !data.functions.length) return;

    const svg = d3.select(spiderChartRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2 - 40;
    
    const functionData = data.functions.map(func => ({
      axis: func,
      value: data.scores[func].avg / 5 // Normalize to 0-1
    }));

    const angleSlice = Math.PI * 2 / functionData.length;
    
    // Create the groups
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Create the circular segments
    const levels = 5;
    const levelFactors = Array.from({length: levels}, (_, i) => (i + 1) / levels);
    
    // Draw the background circles
    levelFactors.forEach(level => {
      g.append("circle")
        .attr("r", radius * level)
        .attr("class", "grid-circle")
        .style("fill", "none")
        .style("stroke", "rgba(255,255,255,0.1)")
        .style("stroke-dasharray", "4 4");
        
      // Add level labels
      g.append("text")
        .attr("x", 0)
        .attr("y", -radius * level)
        .attr("dy", "1em")
        .style("font-size", "10px")
        .style("fill", "rgba(255,255,255,0.6)")
        .style("text-anchor", "middle")
        .text(Math.round(level * 5));
    });
    
    // Draw the axes
    const axes = g.selectAll(".axis")
      .data(functionData)
      .enter()
      .append("g")
      .attr("class", "axis");
    
    axes.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI/2))
      .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI/2))
      .style("stroke", "rgba(255,255,255,0.2)")
      .style("stroke-width", "1px");
      
    // Draw axis labels
    axes.append("text")
      .attr("class", "legend")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => (radius + 20) * Math.cos(angleSlice * i - Math.PI/2))
      .attr("y", (d, i) => (radius + 20) * Math.sin(angleSlice * i - Math.PI/2))
      .style("fill", "white")
      .style("font-size", "12px")
      .text(d => d.axis);
      
    // Draw the radar chart blobs
    const radarLine = d3.lineRadial()
      .radius(d => d * radius)
      .angle((_, i) => i * angleSlice);
      
    // Create the radar areas
    g.append("path")
      .datum(functionData.map(d => d.value))
      .attr("class", "radar-area")
      .attr("d", radarLine)
      .style("fill", "rgba(0, 120, 255, 0.3)")
      .style("stroke", "#0088ff")
      .style("stroke-width", "2px");
      
    // Add dots at each data point
    g.selectAll(".radar-dot")
      .data(functionData)
      .enter()
      .append("circle")
      .attr("class", "radar-dot")
      .attr("r", 6)
      .attr("cx", (d, i) => d.value * radius * Math.cos(angleSlice * i - Math.PI/2))
      .attr("cy", (d, i) => d.value * radius * Math.sin(angleSlice * i - Math.PI/2))
      .style("fill", "#0088ff")
      .style("stroke", "#ffffff");
      
    // Add tooltips to dots
    g.selectAll(".radar-value")
      .data(functionData)
      .enter()
      .append("text")
      .attr("class", "radar-value")
      .attr("x", (d, i) => (d.value * radius + 15) * Math.cos(angleSlice * i - Math.PI/2))
      .attr("y", (d, i) => (d.value * radius + 15) * Math.sin(angleSlice * i - Math.PI/2))
      .text(d => Math.round(d.value * 5 * 10) / 10)
      .style("font-size", "12px")
      .style("fill", "white")
      .style("text-anchor", "middle");
  }, [data]);
  
  // Generate heatmap
  useEffect(() => {
    if (!heatmapRef.current || !data.categories.length) return;
    
    const svg = d3.select(heatmapRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 30, right: 30, bottom: 100, left: 140 };
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Group categories by function
    const categoriesByFunction = {};
    data.functions.forEach(func => {
      categoriesByFunction[func] = data.categories
        .filter(cat => cat.function === func)
        .map(cat => cat.category);
    });
    
    // Create a flat list of all function-category combinations
    const allCombinations = data.categories.map(cat => ({
      function: cat.function,
      category: cat.category,
      score: cat.score
    }));
    
    // Set up scales
    const xScale = d3.scaleBand()
      .domain(data.functions)
      .range([0, width])
      .padding(0.05);
      
    const yGroups = [];
    data.functions.forEach(func => {
      categoriesByFunction[func].forEach(cat => {
        if (!yGroups.includes(cat)) {
          yGroups.push(cat);
        }
      });
    });
    
    const yScale = d3.scaleBand()
      .domain(yGroups)
      .range([0, height])
      .padding(0.05);
      
    const colorScale = d3.scaleLinear<string>()
      .domain([1, 3, 5])
      .range(["#ff4500", "#ffcc00", "#38b000"]);
      
    // Create the SVG container
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
    // Draw x-axis
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "white");
      
    // Draw y-axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "white");
      
    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none");
      
    // Draw heatmap cells
    g.selectAll(".heatmap-cell")
      .data(allCombinations)
      .enter()
      .append("rect")
      .attr("class", "heatmap-cell")
      .attr("x", d => xScale(d.function) || 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .style("fill", d => colorScale(d.score))
      .style("stroke", "white")
      .style("stroke-width", "1px")
      .on("mouseover", function(event, d) {
        tooltip
          .html(`
            <strong>${d.function} - ${d.category}</strong><br>
            Maturity Score: ${d.score}/5
          `)
          .style("visibility", "visible");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
      });
      
    // Add score text to cells
    g.selectAll(".cell-text")
      .data(allCombinations)
      .enter()
      .append("text")
      .attr("class", "cell-text")
      .attr("x", d => (xScale(d.function) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text(d => d.score)
      .style("fill", d => d.score >= 4 ? "black" : "white")
      .style("font-size", "12px")
      .style("font-weight", "bold");
  }, [data]);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    const canvas = await html2canvas(reportRef.current, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#1a1a1a'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`NIST_CSF_Assessment_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Calculate overall maturity level
  const getMaturityLevel = (score: number) => {
    if (score < 1.5) return "Initial";
    if (score < 2.5) return "Developing";
    if (score < 3.5) return "Defined";
    if (score < 4.5) return "Managed";
    return "Optimizing";
  };

  // Generate recommendations based on scores
  const generateRecommendations = () => {
    const recommendations: { [key: string]: string[] } = {};
    
    data.categories.forEach(cat => {
      if (!recommendations[cat.function]) {
        recommendations[cat.function] = [];
      }
      
      if (cat.score < 3) {
        switch(cat.function) {
          case 'Identify':
            recommendations[cat.function].push(`Improve ${cat.category} by documenting critical assets and business processes.`);
            break;
          case 'Protect':
            recommendations[cat.function].push(`Strengthen ${cat.category} by implementing formal controls and regular training.`);
            break;
          case 'Detect':
            recommendations[cat.function].push(`Enhance ${cat.category} capabilities with automated monitoring and alerting.`);
            break;
          case 'Respond':
            recommendations[cat.function].push(`Develop formal ${cat.category} procedures and conduct regular tabletop exercises.`);
            break;
          case 'Recover':
            recommendations[cat.function].push(`Establish comprehensive ${cat.category} processes with regular testing and updates.`);
            break;
        }
      }
    });
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-black p-4 overflow-auto' : ''}`}>
      <div ref={reportRef} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-cyber-blue">NIST Cybersecurity Framework Assessment Report</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullScreen}>
              {isFullScreen ? 
                <><Minimize2 className="mr-2 h-4 w-4" /> Exit Fullscreen</> : 
                <><Maximize2 className="mr-2 h-4 w-4" /> Fullscreen</>
              }
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" onValueChange={setCurrentTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Scores</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-cyber-gray-800 to-cyber-gray-900 border-cyber-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Overall Maturity Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-32">
                    <div className="text-5xl font-bold text-cyber-blue">{data.overallScore}</div>
                    <div className="text-lg text-cyber-gray-300 mt-2">{getMaturityLevel(data.overallScore)}</div>
                    <div className="text-xs text-cyber-gray-400 mt-1">out of 5.0</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2 bg-gradient-to-br from-cyber-gray-800 to-cyber-gray-900 border-cyber-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Function Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {data.functions.map(func => (
                      <div key={func} className="text-center p-2">
                        <div className="text-2xl font-bold text-cyber-blue">
                          {Math.round(data.scores[func].avg * 10) / 10}
                        </div>
                        <div className="text-xs">{func}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-cyber-gray-800 to-cyber-gray-900 border-cyber-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Maturity Spider Chart</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <svg ref={spiderChartRef} width="500" height="500" className="max-w-full"></svg>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-cyber-gray-800 to-cyber-gray-900 border-cyber-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assessmentData.company && (
                      <>
                        <div className="grid grid-cols-2 gap-2 border-b border-cyber-gray-700 pb-2">
                          <div className="text-cyber-gray-400">Company Name</div>
                          <div>{assessmentData.company.companyName || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-cyber-gray-700 pb-2">
                          <div className="text-cyber-gray-400">Industry</div>
                          <div>{assessmentData.company.industry || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-cyber-gray-700 pb-2">
                          <div className="text-cyber-gray-400">Location</div>
                          <div>{assessmentData.company.location || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-b border-cyber-gray-700 pb-2">
                          <div className="text-cyber-gray-400">Company Size</div>
                          <div>{assessmentData.company.employeeCount || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-cyber-gray-400">Security Team</div>
                          <div>{assessmentData.company.hasSecurityTeam === 'yes' 
                            ? `Yes (${assessmentData.company.securityTeamSize || 'size not specified'})` 
                            : assessmentData.company.hasSecurityTeam === 'partial' 
                              ? 'Partial team' 
                              : 'No dedicated team'}</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6 mt-4">
            <Card className="bg-gradient-to-br from-cyber-gray-800 to-cyber-gray-900 border-cyber-blue/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Category Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center overflow-x-auto">
                <svg ref={heatmapRef} width="600" height="500" className="min-w-[600px]"></svg>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              {data.functions.map(func => (
                <Collapsible
                  key={func}
                  open={expandedSections.includes(func)}
                  onOpenChange={() => toggleSection(func)}
                  className="border rounded-lg border-cyber-blue/20 bg-cyber-gray-800/50"
                >
                  <CollapsibleTrigger className="flex justify-between items-center w-full p-4">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-medium">{func}</div>
                      <div className="text-sm text-cyber-gray-400">
                        Avg: {Math.round(data.scores[func].avg * 10) / 10}/5
                      </div>
                    </div>
                    {expandedSections.includes(func) ? 
                      <ChevronUp className="h-5 w-5" /> : 
                      <ChevronDown className="h-5 w-5" />
                    }
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-3">
                      {data.categories
                        .filter(cat => cat.function === func)
                        .map(cat => (
                          <div key={cat.category} className="flex justify-between border-t border-cyber-gray-700 pt-3">
                            <span>{cat.category}</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-16 h-6 rounded flex items-center justify-center text-sm font-medium ${
                                cat.score >= 4 ? 'bg-green-500 text-black' : 
                                cat.score >= 3 ? 'bg-yellow-500 text-black' : 
                                'bg-red-500 text-white'
                              }`}>
                                {cat.score}/5
                              </div>
                              <span className="text-xs text-cyber-gray-400">
                                {cat.score < 1.5 ? "Initial" : 
                                 cat.score < 2.5 ? "Developing" : 
                                 cat.score < 3.5 ? "Defined" : 
                                 cat.score < 4.5 ? "Managed" : "Optimizing"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6 mt-4">
            <Card className="bg-gradient-to-br from-cyber-gray-800 to-cyber-gray-900 border-cyber-blue/20">
              <CardHeader>
                <CardTitle className="text-xl">Improvement Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(recommendations).map(([func, recs]) => (
                  <div key={func} className="space-y-2">
                    <h3 className="text-lg font-semibold text-cyber-blue">{func} Function</h3>
                    {recs.length > 0 ? (
                      <ul className="ml-6 space-y-1 list-disc">
                        {recs.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-cyber-gray-400 italic">No critical improvements needed for {func} function.</p>
                    )}
                  </div>
                ))}
                
                {Object.values(recommendations).every(recs => recs.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-lg text-cyber-green">
                      Great job! Your organization has a mature cybersecurity posture.
                    </p>
                    <p className="text-cyber-gray-400 mt-2">
                      Continue maintaining and improving your security practices.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-cyber-gray-800 to-cyber-gray-900 border-cyber-blue/20">
              <CardHeader>
                <CardTitle className="text-xl">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="ml-6 space-y-3 list-decimal">
                  <li>
                    <div className="font-medium">Prioritize Improvements</div>
                    <p className="text-sm text-cyber-gray-400">Focus on categories with scores below 3 to address critical gaps.</p>
                  </li>
                  <li>
                    <div className="font-medium">Develop an Action Plan</div>
                    <p className="text-sm text-cyber-gray-400">Create a roadmap with specific initiatives for each improvement area.</p>
                  </li>
                  <li>
                    <div className="font-medium">Allocate Resources</div>
                    <p className="text-sm text-cyber-gray-400">Ensure adequate budget and personnel are assigned to security initiatives.</p>
                  </li>
                  <li>
                    <div className="font-medium">Implement Controls</div>
                    <p className="text-sm text-cyber-gray-400">Deploy the necessary technical and administrative controls.</p>
                  </li>
                  <li>
                    <div className="font-medium">Reassess Regularly</div>
                    <p className="text-sm text-cyber-gray-400">Schedule quarterly reviews to track progress and adjust priorities.</p>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportVisualization;
