
import { toast } from "@/hooks/use-toast";
import { Report } from "@/types/report";

// Generate a new report
export const generateNewReport = (
  tenantId: string,
  reportType: string,
  reportCategory: "security" | "compliance" | "vulnerability" | "incident" | "audit"
): Promise<Report> => {
  return new Promise((resolve) => {
    // Simulate API call with timeout
    setTimeout(() => {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const newReport: Report = {
        id: `${tenantId}-REP-${Math.floor(Math.random() * 1000)}`,
        name: reportType,
        description: `${reportType} generated on ${now.toLocaleDateString()}`,
        category: reportCategory,
        status: "ready",
        lastGenerated: now.toISOString(),
        nextScheduled: nextMonth.toISOString(),
        format: "PDF"
      };
      
      toast({
        title: "Report Generated",
        description: `${reportType} has been successfully generated.`,
        variant: "default",
      });
      
      resolve(newReport);
    }, 1500);
  });
};

// Download a report
export const downloadReport = (report: Report): void => {
  // Create a simulated PDF download
  const blob = new Blob(["This is a simulated PDF report content"], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.name.replace(/\s+/g, '_')}_${report.lastGenerated?.split('T')[0] || 'report'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast({
    title: "Report Downloaded",
    description: `${report.name} has been downloaded.`,
    variant: "default",
  });
};
