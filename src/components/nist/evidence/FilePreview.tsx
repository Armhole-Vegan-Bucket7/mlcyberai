
import React from 'react';
import { FileType, getFileType } from './types';
import { FileImage, FileText, FileAudio, FileVideo, FileArchive } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const fileType = getFileType(file);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    // Only create preview URLs for images to avoid memory issues with large files
    if (fileType === 'image') {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [file, fileType]);
  
  const renderFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <FileImage className="h-8 w-8 text-blue-500" />;
      case 'pdf':
      case 'document':
        return <FileText className="h-8 w-8 text-green-500" />;
      case 'audio':
        return <FileAudio className="h-8 w-8 text-yellow-500" />;
      case 'video':
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      case 'archive':
        return <FileArchive className="h-8 w-8 text-orange-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };
  
  return (
    <div className="relative group rounded-md overflow-hidden border border-cyber-gray-700 bg-cyber-gray-800/80">
      <div className="flex items-center p-3">
        <div className="mr-3 flex-shrink-0">
          {fileType === 'image' && previewUrl ? (
            <div className="w-16 h-16 rounded-md overflow-hidden bg-cyber-gray-700">
              <img
                src={previewUrl}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-md bg-cyber-gray-700">
              {renderFileIcon()}
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <p className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-cyber-gray-400">
            {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
          </p>
        </div>
        
        <button
          onClick={onRemove}
          className="ml-2 p-1.5 rounded-full bg-cyber-red/10 text-cyber-red hover:bg-cyber-red/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FilePreview;
