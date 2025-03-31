
import { supabase } from '@/integrations/supabase/client';

export const BUCKET_NAME = 'Trust_Evidence_Uploads';

export const checkBucketExists = async (userId: string | undefined): Promise<{
  bucketExists: boolean;
  error: string | null;
}> => {
  try {
    // First check if the bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (bucketError) {
      console.error('Storage bucket check error:', bucketError);
      return {
        bucketExists: false,
        error: `Storage configuration issue: ${bucketError.message}`
      };
    }
    
    console.log('Storage bucket found:', bucketData);
    
    // Now check if we can list files to verify policies
    if (userId) {
      const { data: listData, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userId);
        
      if (listError) {
        console.warn('Storage access check warning:', listError);
        // This is just a check, not a critical error if folder doesn't exist yet
      }
    }
    
    return {
      bucketExists: true,
      error: null
    };
  } catch (err: any) {
    console.error('Storage check error:', err);
    return {
      bucketExists: false,
      error: 'Unable to connect to storage service.'
    };
  }
};

export const uploadFile = async (userId: string, categoryName: string, file: File) => {
  const filePath = `${userId}/${categoryName}/${file.name}`;
  return supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
};
