
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import WorldAttackMap from '@/components/breach-board/WorldAttackMap';
import TopBreaches from '@/components/breach-board/TopBreaches';
import BreachTrendChart from '@/components/breach-board/BreachTrendChart';
import SectorBadge from '@/components/breach-board/SectorBadge';
import ThreatVectorChart from '@/components/breach-board/ThreatVectorChart';
import CVEFocus from '@/components/breach-board/CVEFocus';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart2, RefreshCw } from 'lucide-react';
import { format, subDays } from 'date-fns';

const BreachBoard = () => {
  // Generate sample data for demo purposes
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch recent breaches
  const { 
    data: recentBreaches, 
    isLoading: breachesLoading,
    refetch: refetchBreaches
  } = useQuery({
    queryKey: ['recent-breaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('breach_data')
        .select('*')
        .order('breach_time', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch breach trends for the last 7 days
  const { 
    data: trendData, 
    isLoading: trendLoading,
    refetch: refetchTrend
  } = useQuery({
    queryKey: ['breach-trends'],
    queryFn: async () => {
      const days = [];
      const now = new Date();
      
      // Create an array of the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        days.push({
          date: format(date, 'yyyy-MM-dd'),
          start: startOfDay.toISOString(),
          end: endOfDay.toISOString(),
        });
      }
      
      // Fetch counts for each day
      const counts = await Promise.all(
        days.map(async (day) => {
          const { count, error } = await supabase
            .from('breach_data')
            .select('*', { count: 'exact', head: true })
            .gte('breach_time', day.start)
            .lte('breach_time', day.end);
            
          if (error) throw error;
          
          return {
            name: day.date,
            value: count || 0,
          };
        })
      );
      
      return counts;
    }
  });

  // Fetch threat vector distribution
  const { 
    data: vectorData, 
    isLoading: vectorLoading,
    refetch: refetchVectors
  } = useQuery({
    queryKey: ['threat-vectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('threat_vector_counts')
        .select('*');
        
      if (error) throw error;
      
      return (data || []).map(item => ({
        name: item.attack_vector || 'Unknown',
        value: item.count || 0,
      }));
    }
  });

  // Fetch CVE data
  const { 
    data: cveData, 
    isLoading: cveLoading,
    refetch: refetchCVEs
  } = useQuery({
    queryKey: ['cve-focus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('breach_data')
        .select('cve_id, cve_description')
        .not('cve_id', 'is', null)
        .order('breach_time', { ascending: false });
        
      if (error) throw error;
      
      // Group and count CVEs
      const cveMap = new Map();
      
      (data || []).forEach(item => {
        if (!item.cve_id) return;
        
        if (cveMap.has(item.cve_id)) {
          cveMap.get(item.cve_id).count++;
        } else {
          cveMap.set(item.cve_id, {
            id: item.cve_id,
            description: item.cve_description || 'No description available',
            count: 1,
          });
        }
      });
      
      // Convert map to array and sort by count
      return Array.from(cveMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    }
  });

  // Determine user's sector threat level
  const userSector = 'Finance'; // This would come from user profile in a real app
  const sectorThreatLevel = vectorData && vectorData.find(v => 
    v.name.toLowerCase().includes('ransomware') || 
    v.name.toLowerCase().includes('phishing')
  ) ? 'high' : 'medium';

  // Seed initial data when the app loads
  useEffect(() => {
    const seedData = async () => {
      try {
        await supabase.functions.invoke('fetch-breach-data', {
          body: { action: 'seed' }
        });
      } catch (error) {
        console.error('Error seeding breach data:', error);
      }
    };
    
    seedData();
  }, []);

  // Function to generate new breach data for demo purposes
  const generateSampleBreach = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-breach-data', {
        body: { action: 'generate' }
      });
      
      if (error) throw error;
      
      toast({
        title: 'New breach detected',
        description: `${data.data.organization} security incident reported.`,
      });
      
      // Refetch all data
      refetchBreaches();
      refetchTrend();
      refetchVectors();
      refetchCVEs();
    } catch (error) {
      console.error('Error generating breach:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate sample breach data',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportIntelReport = () => {
    toast({
      title: 'Export Initiated',
      description: 'Threat Intelligence Report is being generated.',
    });
    
    // In a real app, this would generate and download a CSV or PDF report
    setTimeout(() => {
      toast({
        title: 'Report Ready',
        description: 'Threat Intelligence Report is ready for download.',
      });
    }, 2000);
  };

  return (
    <PageLayout 
      title="Breach Board" 
      description="Real-time cybersecurity breach intelligence dashboard"
    >
      <div className="flex justify-end space-x-3 mb-4">
        <Button 
          variant="outline" 
          onClick={generateSampleBreach}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Simulate Breach
        </Button>
        
        <Button onClick={exportIntelReport}>
          <BarChart2 className="mr-2 h-4 w-4" />
          View Threat Intel Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main panel with world map */}
        <div className="lg:col-span-2">
          <WorldAttackMap />
        </div>
        
        {/* Side panel with analytics */}
        <div className="space-y-6">
          <TopBreaches 
            breaches={recentBreaches || []} 
            loading={breachesLoading} 
          />
          
          <BreachTrendChart 
            data={trendData || []} 
            loading={trendLoading} 
          />
          
          <SectorBadge 
            sector={userSector} 
            threatLevel={sectorThreatLevel as 'high' | 'medium' | 'low'} 
          />
          
          <ThreatVectorChart 
            data={vectorData || []} 
            loading={vectorLoading} 
          />
          
          <CVEFocus 
            cves={cveData || []} 
            loading={cveLoading} 
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default BreachBoard;
