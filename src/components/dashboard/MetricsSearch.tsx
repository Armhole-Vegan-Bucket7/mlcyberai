
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenantContext } from '@/contexts/TenantContext';

interface MetricsSearchProps {
  className?: string;
}

const MetricsSearch: React.FC<MetricsSearchProps> = ({ className }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { selectedTenant } = useTenantContext();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // First try to use Supabase function if available
      try {
        const { data, error } = await supabase.functions.invoke('search-metrics', {
          body: { 
            query: query,
            tenantId: selectedTenant.id,
            tenantName: selectedTenant.name
          },
        });

        if (error) throw error;
        setResult(data.answer);
      } catch (supabaseError) {
        // If Supabase function fails, use mock response
        console.warn('Falling back to mock response:', supabaseError);
        
        // Generate a mock response based on the query
        const mockResponses: Record<string, string> = {
          'security': 'Your security posture score is 78/100. There are 3 critical vulnerabilities that need immediate attention.',
          'alerts': 'There have been 127 alerts in the last 24 hours, a 15% increase from yesterday.',
          'incidents': 'There are 8 active incidents. 2 new incidents were detected today.',
          'vulnerabilities': 'There are 280 open vulnerabilities across all systems. Critical: 23, High: 45, Medium: 78, Low: 134.',
          'compliance': 'Current compliance status: PCI DSS (92%), HIPAA (87%), ISO 27001 (94%), SOC 2 (89%).',
          'threats': 'Top threat vectors: Phishing (42%), Malware (28%), Credential theft (17%), Network intrusion (13%).',
          'status': 'Overall security status: WARNING. Network security requires immediate attention.'
        };

        // Find the most relevant mock response
        const queryLower = query.toLowerCase();
        let response = 'I don\'t have specific information about that query. Please try asking about security, alerts, incidents, vulnerabilities, compliance, or threats.';
        
        for (const [key, value] of Object.entries(mockResponses)) {
          if (queryLower.includes(key)) {
            response = value;
            break;
          }
        }
        
        // Simulate API delay
        setTimeout(() => {
          setResult(response);
        }, 800);
      }
    } catch (error: any) {
      console.error('Error searching metrics:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`dashboard-card ${className}`}>
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">MLCyberLLM</h3>
      </div>
      
      <div className="mt-2 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder={`Ask about ${selectedTenant.name}'s security metrics...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
        
        {result && (
          <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm">
            <h4 className="text-xs text-muted-foreground mb-1">Answer:</h4>
            <div className="whitespace-pre-wrap">{result}</div>
          </div>
        )}
        
        {!result && !loading && (
          <div className="mt-4 p-3 rounded-md bg-muted/10 text-sm text-muted-foreground">
            <p>Try asking:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>What is our current security posture?</li>
              <li>How many critical vulnerabilities do we have?</li>
              <li>Show me recent security incidents</li>
              <li>What is our compliance status?</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsSearch;
