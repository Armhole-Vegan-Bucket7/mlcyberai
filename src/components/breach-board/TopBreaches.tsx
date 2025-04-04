
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ThreatData {
  id: string;
  organization?: string;
  attack_vector?: string;
  industry?: string;
  timestamp: string;
  severity?: string;
  description?: string;
  cve_id?: string;
}

interface TopBreachesProps {
  breaches: ThreatData[];
  loading: boolean;
}

const severityColors: Record<string, string> = {
  'critical': 'bg-red-500/20 text-red-500 border-red-500/50',
  'high': 'bg-orange-500/20 text-orange-500 border-orange-500/50',
  'medium': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'low': 'bg-green-500/20 text-green-500 border-green-500/50',
  'info': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
};

const TopBreaches: React.FC<TopBreachesProps> = ({ breaches, loading }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <Shield className="w-4 h-4 mr-2 text-cyber-red" />
          Latest Intel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : breaches.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No breach data available</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Target</TableHead>
                <TableHead>Vector</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breaches.map((breach) => (
                <TableRow key={breach.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{breach.organization || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={severityColors[breach.severity || 'medium'] || ''}>
                      {breach.attack_vector || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{breach.industry || 'Technology'}</TableCell>
                  <TableCell className="text-right text-xs flex items-center justify-end">
                    <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                    {formatDistanceToNow(new Date(breach.timestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TopBreaches;
