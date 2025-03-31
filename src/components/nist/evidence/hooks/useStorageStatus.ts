
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkBucketExists, BUCKET_NAME } from '../utils/storageUtils';

export const useStorageStatus = () => {
  const { user } = useAuth();
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const [bucketExists, setBucketExists] = useState(false);
  const [storageStatus, setStorageStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    checkStorageBucket();
  }, [user]);

  const checkStorageBucket = async () => {
    setIsCheckingStorage(true);
    setStorageStatus('checking');
    
    if (!user) {
      setStorageError("User authentication required for storage access");
      setBucketExists(false);
      setStorageStatus('error');
      setErrorDetails({
        message: "User authentication required for storage access",
        timestamp: new Date().toISOString(),
        context: "No authenticated user"
      });
      setIsCheckingStorage(false);
      return;
    }
    
    try {
      const { bucketExists: exists, error, errorDetails: details } = await checkBucketExists(user.id);
      
      if (error) {
        console.error('Storage check failed:', error);
        setStorageError(error);
        setBucketExists(false);
        setStorageStatus('error');
        setErrorDetails(details);
      } else {
        setStorageError(null);
        setBucketExists(exists);
        setStorageStatus('ready');
        setErrorDetails(null);
        console.log(`Storage bucket "${BUCKET_NAME}" ready for use`);
      }
    } catch (err: any) {
      console.error('Unexpected storage error:', err);
      setStorageError(`Storage service error: ${err.message || 'Unknown error'}`);
      setBucketExists(false);
      setStorageStatus('error');
      setErrorDetails({
        message: err.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        context: "Unexpected exception during storage check"
      });
    } finally {
      setIsCheckingStorage(false);
    }
  };

  return {
    storageError,
    isCheckingStorage,
    bucketExists,
    storageStatus,
    errorDetails,
    checkStorageBucket
  };
};
