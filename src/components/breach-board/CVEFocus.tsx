
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, ExternalLink } from 'lucide-react';

interface CVE {
  id: string;
  description: string;
  count: number;
}

interface CVEFocusProps {
  cves: CVE[];
  loading: boolean;
}

const CVEFocus: React.FC<CVEFocusProps> = ({ cves, loading }) => {
  const openCveDetails = (cveId: string) => {
    window.open(`https://nvd.nist.gov/vuln/detail/${cveId}`, '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <Bug className="w-4 h-4 mr-2 text-cyber-yellow" />
          CVEs in Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-2 text-center text-muted-foreground">Loading CVE data...</div>
        ) : cves.length === 0 ? (
          <div className="py-2 text-center text-muted-foreground">No CVE data available</div>
        ) : (
          <div className="space-y-3">
            {cves.map((cve) => (
              <div key={cve.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <button 
                    className="text-sm font-mono font-medium group-hover:text-cyber-blue transition-colors flex items-center"
                    onClick={() => openCveDetails(cve.id)}
                  >
                    {cve.id}
                    <ExternalLink className="ml-1 h-3 w-3 opacity-70" />
                  </button>
                  <span className="text-xs px-1.5 py-0.5 bg-muted rounded-sm">
                    {cve.count} {cve.count === 1 ? 'instance' : 'instances'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {cve.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CVEFocus;
