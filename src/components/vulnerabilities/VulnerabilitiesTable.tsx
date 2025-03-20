
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Vulnerability, type SeverityLevel } from '@/data/tenantMetrics';
import { Clock, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VulnerabilitiesTableProps {
  vulnerabilities: Vulnerability[];
}

const VulnerabilitiesTable = ({ vulnerabilities }: VulnerabilitiesTableProps) => {
  // Get severity badge styling
  const getSeverityBadgeClasses = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return "bg-cyber-red/10 text-cyber-red border-cyber-red/30";
      case 'high':
        return "bg-cyber-orange/10 text-cyber-orange border-cyber-orange/30";
      case 'medium':
        return "bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30";
      case 'low':
        return "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30";
    }
  };

  const getStatusBadgeClasses = (status: Vulnerability['status']) => {
    switch (status) {
      case 'new':
        return "bg-cyber-red/10 text-cyber-red border-cyber-red/30";
      case 'in progress':
        return "bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30";
      case 'resolved':
        return "bg-cyber-green/10 text-cyber-green border-cyber-green/30";
      case 'accepted':
        return "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30";
    }
  };

  const getCVSSColor = (score: number) => {
    if (score >= 9.0) return "text-cyber-red";
    if (score >= 7.0) return "text-cyber-orange";
    if (score >= 4.0) return "text-cyber-yellow";
    return "text-cyber-blue";
  };

  return (
    <div className="rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Vulnerability</TableHead>
            <TableHead>CVE</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>CVSS</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Affected Systems</TableHead>
            <TableHead>Discovered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vulnerabilities.length > 0 ? (
            vulnerabilities.map((vulnerability) => (
              <TableRow key={vulnerability.id}>
                <TableCell className="font-medium">{vulnerability.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{vulnerability.name}</div>
                    <div className="text-xs text-cyber-gray-500 mt-1 line-clamp-1">{vulnerability.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {vulnerability.cve ? (
                    <a 
                      href={`https://nvd.nist.gov/vuln/detail/${vulnerability.cve}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-cyber-blue hover:underline"
                    >
                      {vulnerability.cve}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-cyber-gray-500">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getSeverityBadgeClasses(vulnerability.severity)}>
                    {vulnerability.severity.charAt(0).toUpperCase() + vulnerability.severity.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${getCVSSColor(vulnerability.cvss)}`}>
                    {vulnerability.cvss.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClasses(vulnerability.status)}>
                    {vulnerability.status.charAt(0).toUpperCase() + vulnerability.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {vulnerability.affectedSystems.slice(0, 2).map((system, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {system}
                      </Badge>
                    ))}
                    {vulnerability.affectedSystems.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{vulnerability.affectedSystems.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-cyber-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(vulnerability.discoveredAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-cyber-gray-500">
                No vulnerabilities found matching your search
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VulnerabilitiesTable;
