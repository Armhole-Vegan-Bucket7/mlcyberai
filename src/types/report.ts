
export type ReportStatus = 'ready' | 'scheduled' | 'generating';
export type ReportCategory = 'security' | 'compliance' | 'vulnerability' | 'incident' | 'audit';

export interface Report {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  lastGenerated?: string;
  nextScheduled?: string;
  format: 'PDF' | 'XLSX' | 'JSON' | 'HTML';
}
