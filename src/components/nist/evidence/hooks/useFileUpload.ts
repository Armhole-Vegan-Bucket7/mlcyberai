
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
        description: !user 
          ? "You must be logged in to upload files. Please sign in and try again." 
          : "Evidence item not found.",
      });
      return;
    }
    
    if (evidenceItem.files.length === 0) {
      toast({
        variant: "destructive",
        title: "No files to upload",
        description: "Please select at least one file to upload.",
      });
      return;
    }
    
    setUploadingFor(evidenceId);
    
    try {
      const uploadedPaths = [];
      const failedUploads = [];
      
      for (const file of evidenceItem.files) {
        console.log(`Uploading file ${file.name} for category ${evidenceItem.category}`);
        
        const { error, data } = await uploadFile(user.id, evidenceItem.category, file);
          
        if (error) {
          console.error('File upload error:', error);
          failedUploads.push({
            name: file.name,
            error: error.message
          });
        } else {
          console.log('Upload successful:', data);
          uploadedPaths.push({
            path: `${user.id}/${evidenceItem.category}/${file.name}`,
            name: file.name
          });
        }
      }
      
      // Update the evidence with successfully uploaded files
      if (uploadedPaths.length > 0) {
        setEvidence(prev => 
          prev.map(e => {
            if (e.id === evidenceId) {
              return {
                ...e,
                uploadedFiles: [...e.uploadedFiles, ...uploadedPaths],
                files: failedUploads.length > 0 
                  ? e.files.filter(file => 
                      failedUploads.some(failed => failed.name === file.name)
                    ) 
                  : [] // Clear all files if all uploads were successful
              };
            }
            return e;
          })
        );
      }
      
      // Show appropriate toast message based on results
      if (failedUploads.length === 0) {
        toast({
          title: "Files uploaded successfully",
          description: `Uploaded ${evidenceItem.files.length} files for ${evidenceItem.category}`,
        });
      } else if (uploadedPaths.length === 0) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: `Failed to upload ${failedUploads.length} files. Please try again.`,
        });
      } else {
        // Changed "warning" to "default" here, but added a more cautionary title
        toast({
          variant: "default",
          title: "Partial upload success - Warning",
          description: `Uploaded ${uploadedPaths.length} files, but ${failedUploads.length} failed.`,
        });
      }
      
      // Save evidence data if any files were uploaded successfully
      if (uploadedPaths.length > 0) {
        onSave(evidence);
      }
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
