
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkBucketExists, BUCKET_NAME } from '../utils/storageUtils';

export const useStorageStatus = () => {
  const { user } = useAuth();
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const [bucketExists, setBucketExists] = useState(false);
  const [storageStatus, setStorageStatus] = useState<'checking' | 'ready' | 'error'>('checking');

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
      setIsCheckingStorage(false);
      return;
    }
    
    try {
      const { bucketExists: exists, error } = await checkBucketExists(user.id);
      
      if (error) {
        console.error('Storage check failed:', error);
        setStorageError(`Storage configuration issue: ${error}`);
        setBucketExists(false);
        setStorageStatus('error');
      } else {
        setStorageError(null);
        setBucketExists(exists);
        setStorageStatus('ready');
        console.log(`Storage bucket "${BUCKET_NAME}" ready for use`);
      }
    } catch (err: any) {
      console.error('Unexpected storage error:', err);
      setStorageError(`Storage service error: ${err.message || 'Unknown error'}`);
      setBucketExists(false);
      setStorageStatus('error');
    } finally {
      setIsCheckingStorage(false);
    }
  };

  return {
    storageError,
    isCheckingStorage,
    bucketExists,
    storageStatus,
    checkStorageBucket
  };
};
