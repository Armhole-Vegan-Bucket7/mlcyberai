
import { supabase } from '@/integrations/supabase/client';

export const BUCKET_NAME = 'truste';

export const checkBucketExists = async (userId: string | undefined): Promise<{
  bucketExists: boolean;
  error: string | null;
  errorDetails?: {
    message: string;
    timestamp: string;
    context?: string;
    userId?: string;
  } | null;
}> => {
  try {
    if (!userId) {
      return {
        bucketExists: false,
        error: 'User authentication required',
        errorDetails: {
          message: 'User authentication required for storage access',
          timestamp: new Date().toISOString(),
          context: 'No authenticated user ID found'
        }
      };
    }

    // First check if the bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (bucketError) {
      console.error('Storage bucket check error:', bucketError);
      
      const errorDetails = {
        message: bucketError.message,
        timestamp: new Date().toISOString(),
        context: `Attempted to access bucket "${BUCKET_NAME}"`,
        userId: userId
      };
      
      // Improved error handling for different scenarios
      if (bucketError.message.includes('not found') || bucketError.message.includes('Bucket not found')) {
        return {
          bucketExists: false,
          error: `Bucket "${BUCKET_NAME}" not found. Please ensure it exists in your Supabase project.`,
          errorDetails
        };
      }
      
      if (bucketError.message.includes('Authentication') || bucketError.message.includes('auth')) {
        return {
          bucketExists: false,
          error: `Authentication error: ${bucketError.message}. Please sign in to access storage.`,
          errorDetails
        };
      }
      
      return {
        bucketExists: false,
        error: `Storage configuration issue: ${bucketError.message}`,
        errorDetails
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
        
        const errorDetails = {
          message: listError.message,
          timestamp: new Date().toISOString(),
          context: `Attempted to list files in bucket "${BUCKET_NAME}" for user "${userId}"`,
          userId: userId
        };
        
        // If this is a permissions issue, return a more specific error
        if (listError.message.includes('permission')) {
          return {
            bucketExists: true,
            error: 'Storage bucket exists but you lack permission to access it. Make sure you are signed in.',
            errorDetails
          };
        }
        
        // If this is a folder doesn't exist error, it's not critical
        if (listError.message.includes('folder') || listError.message.includes('not found')) {
          // This is normal for new users, no need to return an error
          return {
            bucketExists: true,
            error: null
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
    
    const errorDetails = {
      message: err.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      context: `General storage service connection attempt`,
      userId: userId
    };
    
    return {
      bucketExists: false,
      error: `Unable to connect to storage service: ${err.message || 'Unknown error'}`,
      errorDetails
    };
  }
};

export const uploadFile = async (userId: string, categoryName: string, file: File) => {
  const filePath = `${userId}/${categoryName}/${file.name}`;
  
  // Log the upload attempt for debugging
  console.log(`Attempting to upload file to ${BUCKET_NAME}:`, {
    filePath,
    userId,
    fileSize: file.size,
    fileType: file.type
  });
  
  const result = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (result.error) {
    console.error('File upload error:', result.error);
  } else {
    console.log('File uploaded successfully:', result.data);
  }
    
  return result;
};

// Add a utility function to get a public URL for an uploaded file
export const getFileUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};
