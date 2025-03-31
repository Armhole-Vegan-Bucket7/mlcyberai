
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Evidence } from './types';

export const useEvidenceStorage = (onSave: (data: any) => void) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const [bucketExists, setBucketExists] = useState(false);
  const [storageStatus, setStorageStatus] = useState<'checking' | 'ready' | 'error'>('checking');

  // The correct bucket name from Supabase
  const BUCKET_NAME = 'Trust_Evidence_Uploads';

  // Check if the storage bucket exists on component mount
  useEffect(() => {
    checkStorageBucket();
  }, []);

  const checkStorageBucket = async () => {
    setIsCheckingStorage(true);
    setStorageStatus('checking');
    
    try {
      // First check if the bucket exists
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
      
      if (bucketError) {
        console.error('Storage bucket check error:', bucketError);
        setStorageError(`Storage configuration issue: ${bucketError.message}`);
        setBucketExists(false);
        setStorageStatus('error');
      } else {
        console.log('Storage bucket found:', bucketData);
        setStorageError(null);
        setBucketExists(true);
        setStorageStatus('ready');
        
        // Now check if we can list files to verify policies
        const { data: listData, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(user?.id || 'test-folder');
          
        if (listError) {
          console.warn('Storage access check warning:', listError);
          // This is just a check, not a critical error if folder doesn't exist yet
        }
      }
    } catch (err) {
      console.error('Storage check error:', err);
      setStorageError('Unable to connect to storage service.');
      setBucketExists(false);
      setStorageStatus('error');
    } finally {
      setIsCheckingStorage(false);
    }
  };

  const handleAddEvidence = (category: string) => {
    const newEvidence: Evidence = {
      id: crypto.randomUUID(),
      category,
      description: '',
      files: [],
      uploadedFiles: []
    };
    
    setEvidence(prev => [...prev, newEvidence]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidence(prev => prev.filter(e => e.id !== id));
  };

  const handleDescriptionChange = (id: string, description: string) => {
    setEvidence(prev => 
      prev.map(e => e.id === id ? { ...e, description } : e)
    );
  };

  const handleFileChange = (id: string, files: FileList | null) => {
    if (!files) return;
    
    setEvidence(prev => 
      prev.map(e => {
        if (e.id === id) {
          const fileArray = Array.from(files);
          return { 
            ...e, 
            files: [...e.files, ...fileArray] 
          };
        }
        return e;
      })
    );
  };

  const handleRemoveFile = (evidenceId: string, fileIndex: number) => {
    setEvidence(prev => 
      prev.map(e => {
        if (e.id === evidenceId) {
          const updatedFiles = [...e.files];
          updatedFiles.splice(fileIndex, 1);
          return { ...e, files: updatedFiles };
        }
        return e;
      })
    );
  };

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

    if (!bucketExists) {
      toast({
        variant: "destructive",
        title: "Storage not available",
        description: "The storage bucket doesn't exist. Please contact your administrator.",
      });
      return;
    }
    
    setUploadingFor(evidenceId);
    
    try {
      const uploadedPaths = [];
      
      for (const file of evidenceItem.files) {
        const filePath = `${user.id}/${evidenceItem.category}/${file.name}`;
        const { error, data } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (error) {
          console.error('File upload error:', error);
          throw error;
        }
        
        console.log('Upload successful:', data);
        uploadedPaths.push({
          path: filePath,
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
