
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, FileText, RefreshCw, Upload } from 'lucide-react';
import { Evidence } from './types';
import FilePreview from './FilePreview';

interface EvidenceItemProps {
  item: Evidence;
  uploadingFor: string | null;
  storageStatus: 'checking' | 'ready' | 'error';
  onDescriptionChange: (id: string, description: string) => void;
  onFileChange: (id: string, files: FileList | null) => void;
  onRemoveFile: (evidenceId: string, fileIndex: number) => void;
  onRemoveEvidence: (id: string) => void;
  onUploadFiles: (evidenceId: string) => void;
}

const EvidenceItem: React.FC<EvidenceItemProps> = ({
  item,
  uploadingFor,
  storageStatus,
  onDescriptionChange,
  onFileChange,
  onRemoveFile,
  onRemoveEvidence,
  onUploadFiles
}) => {
  return (
    <Card className="mb-4 bg-cyber-gray-800/70">
      <CardContent className="pt-4">
        <div className="flex justify-between mb-2">
          <Label>Description</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemoveEvidence(item.id)}
            className="h-6 px-2 text-cyber-red hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Textarea
          placeholder="Describe this evidence..."
          className="mb-4"
          value={item.description}
          onChange={(e) => onDescriptionChange(item.id, e.target.value)}
        />
        
        <Label className="mb-2 block">Upload Files</Label>
        <div className="flex items-center gap-4 mb-4">
          <Input
            type="file"
            multiple
            onChange={(e) => onFileChange(item.id, e.target.files)}
            className="flex-1"
            disabled={uploadingFor === item.id || storageStatus !== 'ready'}
          />
          <Button
            variant="secondary"
            onClick={() => onUploadFiles(item.id)}
            disabled={item.files.length === 0 || uploadingFor === item.id || storageStatus !== 'ready'}
          >
            {uploadingFor === item.id ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
        
        {item.files.length > 0 && (
          <div className="mb-4">
            <Label className="mb-2 block">Files to upload:</Label>
            <div className="space-y-2">
              {item.files.map((file, index) => (
                <FilePreview 
                  key={index} 
                  file={file} 
                  onRemove={() => onRemoveFile(item.id, index)} 
                />
              ))}
            </div>
          </div>
        )}
        
        {item.uploadedFiles.length > 0 && (
          <div>
            <Label className="mb-2 block">Uploaded files:</Label>
            <div className="space-y-2">
              {item.uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center bg-cyber-gray-700/50 p-2 rounded text-sm">
                  <FileText className="h-4 w-4 mr-2 text-cyber-green" />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvidenceItem;
