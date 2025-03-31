
export interface Evidence {
  id: string;
  category: string;
  description: string;
  files: File[];
  uploadedFiles: { path: string; name: string }[];
}

export interface EvidenceUploadProps {
  assessmentData: any;
  onSave: (data: any) => void;
}

export type FileType = 'image' | 'pdf' | 'document' | 'audio' | 'video' | 'archive' | 'unknown';

export const getFileType = (file: File): FileType => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
    return 'image';
  } else if (extension === 'pdf') {
    return 'pdf';
  } else if (['doc', 'docx', 'txt', 'rtf', 'odt', 'md', 'csv', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
    return 'document';
  } else if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension)) {
    return 'audio';
  } else if (['mp4', 'webm', 'avi', 'mov', 'wmv', 'mkv'].includes(extension)) {
    return 'video';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'archive';
  }
  
  return 'unknown';
};
