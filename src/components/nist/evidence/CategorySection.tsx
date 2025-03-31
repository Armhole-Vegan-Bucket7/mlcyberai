
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import EvidenceItem from './EvidenceItem';
import { Evidence } from './types';

interface CategorySectionProps {
  category: any;
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

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
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
  const categoryEvidence = evidence.filter(e => e.category === category.category);

  return (
    <div key={category.category} className="border-t border-cyber-blue/10 pt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{category.category}</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAddEvidence(category.category)}
                  disabled={storageStatus !== 'ready'}
                >
                  Add Evidence
                </Button>
              </div>
            </TooltipTrigger>
            {storageStatus !== 'ready' && (
              <TooltipContent>
                <p>Evidence upload requires storage to be configured properly</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {categoryEvidence.map(item => (
        <EvidenceItem
          key={item.id}
          item={item}
          uploadingFor={uploadingFor}
          storageStatus={storageStatus}
          onDescriptionChange={onDescriptionChange}
          onFileChange={onFileChange}
          onRemoveFile={onRemoveFile}
          onRemoveEvidence={onRemoveEvidence}
          onUploadFiles={onUploadFiles}
        />
      ))}
      
      {!categoryEvidence.length && (
        <p className="text-sm text-cyber-gray-400 italic p-2">
          No evidence added yet for this category.
        </p>
      )}
    </div>
  );
};

export default CategorySection;
