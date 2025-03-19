
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
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

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
        <h3 className="dashboard-card-title">AI Metrics Search</h3>
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
      </div>
    </div>
  );
};

export default MetricsSearch;
