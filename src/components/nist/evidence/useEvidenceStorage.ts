
import { useState } from 'react';
import { useStorageStatus } from './hooks/useStorageStatus';
import { useFileUpload } from './hooks/useFileUpload';
import { 
  addEvidence, 
  removeEvidence, 
  updateDescription, 
  addFiles, 
  removeFile 
} from './utils/evidenceState';
import { Evidence } from './types';

export const useEvidenceStorage = (onSave: (data: any) => void) => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  
  const { 
    storageError,
    isCheckingStorage,
    bucketExists,
    storageStatus,
    checkStorageBucket
  } = useStorageStatus();
  
  const { uploadingFor, uploadFiles } = useFileUpload(evidence, setEvidence, onSave);

  const handleAddEvidence = (category: string) => {
    setEvidence(prev => addEvidence(prev, category));
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidence(prev => removeEvidence(prev, id));
  };

  const handleDescriptionChange = (id: string, description: string) => {
    setEvidence(prev => updateDescription(prev, id, description));
  };

  const handleFileChange = (id: string, files: FileList | null) => {
    if (!files) return;
    setEvidence(prev => addFiles(prev, id, files));
  };

  const handleRemoveFile = (evidenceId: string, fileIndex: number) => {
    setEvidence(prev => removeFile(prev, evidenceId, fileIndex));
  };

  return {
    evidence,
    uploadingFor,
    storageError,
    isCheckingStorage,
    bucketExists,
    storageStatus,
    checkStorageBucket,
    handleAddEvidence,
    handleRemoveEvidence,
    handleDescriptionChange,
    handleFileChange,
    handleRemoveFile,
    uploadFiles
  };
};
