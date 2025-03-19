
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportCategory } from '@/types/report';
import { Label } from '@/components/ui/label';
import { generateNewReport } from '@/utils/ReportUtils';
import { useTenantContext } from '@/contexts/TenantContext';
import { FileBarChart } from 'lucide-react';

type GenerateReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportGenerated: (report: any) => void;
};

const REPORT_TYPES = [
  { name: "Monthly Security Summary", category: "security" as ReportCategory },
  { name: "Vulnerability Scan Results", category: "vulnerability" as ReportCategory },
  { name: "Compliance Dashboard", category: "compliance" as ReportCategory },
  { name: "Incident Response Summary", category: "incident" as ReportCategory },
  { name: "User Access Audit", category: "audit" as ReportCategory },
  { name: "Executive Security Brief", category: "security" as ReportCategory },
];

const GenerateReportDialog: React.FC<GenerateReportDialogProps> = ({
  open,
  onOpenChange,
  onReportGenerated,
}) => {
  const { selectedTenant } = useTenantContext();
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedReportType) return;
    
    setIsGenerating(true);
    
    const reportInfo = REPORT_TYPES.find(rt => rt.name === selectedReportType);
    
    if (reportInfo) {
      try {
        const newReport = await generateNewReport(
          selectedTenant.id, 
          selectedReportType, 
          reportInfo.category
        );
        onReportGenerated(newReport);
        onOpenChange(false);
      } catch (error) {
        console.error("Error generating report:", error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate New Report</DialogTitle>
          <DialogDescription>
            Select a report type to generate for {selectedTenant.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select
              value={selectedReportType}
              onValueChange={setSelectedReportType}
            >
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Reports</SelectLabel>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={!selectedReportType || isGenerating}
            className="flex items-center gap-2"
          >
            <FileBarChart className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateReportDialog;
