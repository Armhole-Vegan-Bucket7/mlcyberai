
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile } from '../utils/storageUtils';
import { Evidence } from '../types';

export const useFileUpload = (
  evidence: Evidence[], 
  setEvidence: React.Dispatch<React.SetStateAction<Evidence[]>>,
  onSave: (data: any) => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const uploadFiles = async (evidenceId: string) => {
    const evidenceItem = evidence.find(e => e.id === evidenceId);
    if (!evidenceItem || !user) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: !user ? "You must be logged in to upload files." : "Evidence item not found.",
      });
      return;
    }
    
    setUploadingFor(evidenceId);
    
    try {
      const uploadedPaths = [];
      
      for (const file of evidenceItem.files) {
        const { error, data } = await uploadFile(user.id, evidenceItem.category, file);
          
        if (error) {
          console.error('File upload error:', error);
          throw error;
        }
        
        console.log('Upload successful:', data);
        uploadedPaths.push({
          path: `${user.id}/${evidenceItem.category}/${file.name}`,
          name: file.name
        });
      }
      
      setEvidence(prev => 
        prev.map(e => {
          if (e.id === evidenceId) {
            return {
              ...e,
              uploadedFiles: [...e.uploadedFiles, ...uploadedPaths],
              files: [] // Clear local files after upload
            };
          }
          return e;
        })
      );
      
      toast({
        title: "Files uploaded successfully",
        description: `Uploaded ${evidenceItem.files.length} files for ${evidenceItem.category}`,
      });
      
      onSave(evidence);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "There was an error uploading your files. Please try again.",
      });
    } finally {
      setUploadingFor(null);
    }
  };

  return {
    uploadingFor,
    uploadFiles
  };
};
