
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type SOCRole = {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  experience: number;
  shiftHours: string;
  certifications: string[];
  region: string;
  responsibilities: string;
  sopLink?: string;
}

const DEFAULT_ROLES = [
  'Incident Commander',
  'SOC Tier 1 Analyst',
  'SOC Tier 2 Analyst',
  'SOC Manager',
  'Threat Hunter',
  'Forensic Analyst',
  'Security Engineer',
  'Vulnerability Manager'
];

const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Asia',
  'Australia/Oceania'
];

const CERTIFICATIONS = [
  'CISSP', 'CISM', 'CEH', 'CISA', 'OSCP', 'Security+', 
  'CySA+', 'PenTest+', 'GIAC', 'CCSP', 'AWS Security'
];

const SHIFT_HOURS = [
  '08:00-16:00', '16:00-00:00', '00:00-08:00',
  '09:00-17:00', '17:00-01:00', '01:00-09:00',
  'Flexible'
];

const CommandCenterTable: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<SOCRole[]>([
    {
      id: '1',
      role: 'SOC Manager',
      firstName: 'John',
      lastName: 'Doe',
      experience: 8,
      shiftHours: '09:00-17:00',
      certifications: ['CISSP', 'CISM'],
      region: 'North America',
      responsibilities: 'Overall SOC management, escalation point for major incidents'
    }
  ]);

  const [tempCertification, setTempCertification] = useState<string>('');

  const addTeamMember = () => {
    const newMember: SOCRole = {
      id: crypto.randomUUID(),
      role: '',
      firstName: '',
      lastName: '',
      experience: 0,
      shiftHours: '',
      certifications: [],
      region: '',
      responsibilities: ''
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  const updateTeamMember = (id: string, field: keyof SOCRole, value: any) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const addCertification = (id: string, cert: string) => {
    if (!cert) return;
    
    setTeamMembers(teamMembers.map(member => {
      if (member.id === id) {
        // Don't add duplicates
        if (!member.certifications.includes(cert)) {
          return { ...member, certifications: [...member.certifications, cert] };
        }
      }
      return member;
    }));
    
    setTempCertification('');
  };

  const removeCertification = (id: string, cert: string) => {
    setTeamMembers(teamMembers.map(member => {
      if (member.id === id) {
        return { 
          ...member, 
          certifications: member.certifications.filter(c => c !== cert) 
        };
      }
      return member;
    }));
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">SOC Team Members</h3>
          <Button onClick={addTeamMember} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Experience (Years)</TableHead>
                <TableHead>Shift Hours</TableHead>
                <TableHead>Certifications</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Responsibilities</TableHead>
                <TableHead>SOP Link</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    No team members added yet. Click "Add Team Member" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateTeamMember(member.id, 'role', value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_ROLES.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Input
                          placeholder="First"
                          value={member.firstName}
                          onChange={(e) => updateTeamMember(member.id, 'firstName', e.target.value)}
                          className="w-[100px]"
                        />
                        <Input
                          placeholder="Last"
                          value={member.lastName}
                          onChange={(e) => updateTeamMember(member.id, 'lastName', e.target.value)}
                          className="w-[100px]"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={member.experience}
                        onChange={(e) => updateTeamMember(member.id, 'experience', parseInt(e.target.value) || 0)}
                        className="w-[80px]"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={member.shiftHours}
                        onValueChange={(value) => updateTeamMember(member.id, 'shiftHours', value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Shift hours" />
                        </SelectTrigger>
                        <SelectContent>
                          {SHIFT_HOURS.map(shift => (
                            <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {member.certifications.map(cert => (
                          <span key={cert} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            {cert}
                            <button 
                              onClick={() => removeCertification(member.id, cert)}
                              className="hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Add Certification
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {CERTIFICATIONS.map(cert => (
                            <DropdownMenuItem 
                              key={cert}
                              onClick={() => addCertification(member.id, cert)}
                              disabled={member.certifications.includes(cert)}
                            >
                              {cert}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={member.region}
                        onValueChange={(value) => updateTeamMember(member.id, 'region', value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONS.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        placeholder="Primary responsibilities"
                        value={member.responsibilities}
                        onChange={(e) => updateTeamMember(member.id, 'responsibilities', e.target.value)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="SOP URL (optional)"
                          value={member.sopLink || ''}
                          onChange={(e) => updateTeamMember(member.id, 'sopLink', e.target.value)}
                          className="w-[120px]"
                        />
                        {member.sopLink && (
                          <a 
                            href={member.sopLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeTeamMember(member.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandCenterTable;
