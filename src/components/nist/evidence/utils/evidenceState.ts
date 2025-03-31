
import { Evidence } from '../types';

export const addEvidence = (
  prevEvidence: Evidence[],
  category: string
): Evidence[] => {
  const newEvidence: Evidence = {
    id: crypto.randomUUID(),
    category,
    description: '',
    files: [],
    uploadedFiles: []
  };
  
  return [...prevEvidence, newEvidence];
};

export const removeEvidence = (
  prevEvidence: Evidence[],
  id: string
): Evidence[] => {
  return prevEvidence.filter(e => e.id !== id);
};

export const updateDescription = (
  prevEvidence: Evidence[],
  id: string,
  description: string
): Evidence[] => {
  return prevEvidence.map(e => 
    e.id === id ? { ...e, description } : e
  );
};

export const addFiles = (
  prevEvidence: Evidence[],
  id: string,
  files: FileList
): Evidence[] => {
  return prevEvidence.map(e => {
    if (e.id === id) {
      const fileArray = Array.from(files);
      return { 
        ...e, 
        files: [...e.files, ...fileArray] 
      };
    }
    return e;
  });
};

export const removeFile = (
  prevEvidence: Evidence[],
  evidenceId: string,
  fileIndex: number
): Evidence[] => {
  return prevEvidence.map(e => {
    if (e.id === evidenceId) {
      const updatedFiles = [...e.files];
      updatedFiles.splice(fileIndex, 1);
      return { ...e, files: updatedFiles };
    }
    return e;
  });
};

export const updateUploadedFiles = (
  prevEvidence: Evidence[],
  evidenceId: string,
  uploadedPaths: { path: string; name: string }[]
): Evidence[] => {
  return prevEvidence.map(e => {
    if (e.id === evidenceId) {
      return {
        ...e,
        uploadedFiles: [...e.uploadedFiles, ...uploadedPaths],
        files: [] // Clear local files after upload
      };
    }
    return e;
  });
};
