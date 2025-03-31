
import { supabase } from '@/integrations/supabase/client';

export const BUCKET_NAME = 'Trust_Evidence_Uploads';

export const checkBucketExists = async (userId: string | undefined): Promise<{
  bucketExists: boolean;
  error: string | null;
}> => {
  try {
    if (!userId) {
      return {
        bucketExists: false,
        error: 'User authentication required'
      };
    }

    // First check if the bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (bucketError) {
      console.error('Storage bucket check error:', bucketError);
      
      // Check if this is a "not found" error
      if (bucketError.message.includes('not found') || bucketError.message.includes('Bucket not found')) {
        return {
          bucketExists: false,
          error: `Bucket "${BUCKET_NAME}" not found. Please ensure it exists in your Supabase project.`
        };
      }
      
      return {
        bucketExists: false,
        error: `Storage configuration issue: ${bucketError.message}`
      };
    }
    
    console.log('Storage bucket found:', bucketData);
    
    // Now check if we can list files to verify policies
    try {
      const { data: listData, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userId);
        
      if (listError) {
        console.warn('Storage access check warning:', listError);
        
        // If this is a permissions issue, return a more specific error
        if (listError.message.includes('permission')) {
          return {
            bucketExists: true,
            error: 'Storage bucket exists but you lack permission to access it'
          };
        }
      }
      
      // If we got here with no errors, the bucket exists and we have access
      return {
        bucketExists: true,
        error: null
      };
    } catch (listErr: any) {
      // This might be a folder doesn't exist yet error, which is not critical
      console.warn('List operation warning:', listErr);
      
      // The bucket exists, but the user folder might not yet
      return {
        bucketExists: true,
        error: null
      };
    }
  } catch (err: any) {
    console.error('Storage check error:', err);
    return {
      bucketExists: false,
      error: `Unable to connect to storage service: ${err.message || 'Unknown error'}`
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
