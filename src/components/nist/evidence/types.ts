
export interface Evidence {
  id: string;
  category: string;
  description: string;
  files: File[];
  uploadedFiles: { path: string; name: string }[];
}

export interface EvidenceUploadProps {
  assessmentData: any;
  onSave: (data: any) => void;
}
