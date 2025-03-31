
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import CategorySection from './CategorySection';
import { Evidence } from './types';

interface FunctionTabProps {
  functionName: string;
  categories: any[];
  evidence: Evidence[];
  uploadingFor: string | null;
  storageStatus: 'checking' | 'ready' | 'error';
  onAddEvidence: (category: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onFileChange: (id: string, files: FileList | null) => void;
  onRemoveFile: (evidenceId: string, fileIndex: number) => void;
  onRemoveEvidence: (id: string) => void;
  onUploadFiles: (evidenceId: string) => void;
}

const FunctionTab: React.FC<FunctionTabProps> = ({
  functionName,
  categories,
  evidence,
  uploadingFor,
  storageStatus,
  onAddEvidence,
  onDescriptionChange,
  onFileChange,
  onRemoveFile,
  onRemoveEvidence,
  onUploadFiles
}) => {
  return (
    <TabsContent key={functionName} value={functionName} className="mt-0">
      <div className="space-y-4">
        {categories.map(category => (
          <CategorySection
            key={category.category}
            category={category}
            evidence={evidence}
            uploadingFor={uploadingFor}
            storageStatus={storageStatus}
            onAddEvidence={onAddEvidence}
            onDescriptionChange={onDescriptionChange}
            onFileChange={onFileChange}
            onRemoveFile={onRemoveFile}
            onRemoveEvidence={onRemoveEvidence}
            onUploadFiles={onUploadFiles}
          />
        ))}
      </div>
    </TabsContent>
  );
};

export default FunctionTab;
