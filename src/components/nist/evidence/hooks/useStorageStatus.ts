
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkBucketExists } from '../utils/storageUtils';

export const useStorageStatus = () => {
  const { user } = useAuth();
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const [bucketExists, setBucketExists] = useState(false);
  const [storageStatus, setStorageStatus] = useState<'checking' | 'ready' | 'error'>('checking');

  useEffect(() => {
    checkStorageBucket();
  }, []);

  const checkStorageBucket = async () => {
    setIsCheckingStorage(true);
    setStorageStatus('checking');
    
    const { bucketExists: exists, error } = await checkBucketExists(user?.id);
    
    if (error) {
      setStorageError(error);
      setBucketExists(false);
      setStorageStatus('error');
    } else {
      setStorageError(null);
      setBucketExists(exists);
      setStorageStatus('ready');
    }
    
    setIsCheckingStorage(false);
  };

  return {
    storageError,
    isCheckingStorage,
    bucketExists,
    storageStatus,
    checkStorageBucket
  };
};
