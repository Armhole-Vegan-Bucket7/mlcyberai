
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, FileText, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface EvidenceUploadProps {
  assessmentData: any;
  onSave: (data: any) => void;
}

interface Evidence {
  id: string;
  category: string;
  description: string;
  files: File[];
  uploadedFiles: { path: string; name: string }[];
}

const EvidenceUpload: React.FC<EvidenceUploadProps> = ({ assessmentData, onSave }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeFunction, setActiveFunction] = useState('Identify');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const [bucketExists, setBucketExists] = useState(false);

  // Check if the trust_evidence bucket exists on component mount
  useEffect(() => {
    checkStorageBucket();
  }, []);

  const checkStorageBucket = async () => {
    setIsCheckingStorage(true);
    try {
      const { data, error } = await supabase.storage.getBucket('trust_evidence');
      if (error) {
        console.error('Storage bucket check error:', error);
        setStorageError('Storage configuration issue: ' + error.message);
        setBucketExists(false);
      } else {
        console.log('Storage bucket found:', data);
        setStorageError(null);
        setBucketExists(true);
      }
    } catch (err) {
      console.error('Storage check error:', err);
      setStorageError('Unable to connect to storage service.');
      setBucketExists(false);
    } finally {
      setIsCheckingStorage(false);
    }
  };

  const getFunctionCategories = (functionName: string) => {
    if (!assessmentData || !Array.isArray(assessmentData)) {
      return [];
    }
    
    const func = assessmentData.find(f => f.function === functionName);
    return func ? func.categories : [];
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
          .from('trust_evidence')
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

  const getTroubleshootingSteps = () => (
    <div className="space-y-4 mt-4">
      <h3 className="font-medium">Troubleshooting Steps</h3>
      <ol className="space-y-2 pl-5 list-decimal">
        <li>Check that the Supabase project is properly configured with the required storage bucket.</li>
        <li>Verify that your authentication setup is working correctly.</li>
        <li>Ensure that appropriate storage policies are in place to allow file uploads.</li>
        <li>Contact your administrator if the issue persists.</li>
      </ol>
      <div className="pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">Error details: {storageError}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border border-cyber-blue/10 bg-cyber-gray-900/50">
        <CardHeader>
          <CardTitle className="text-xl text-cyber-blue">Evidence Upload</CardTitle>
          <CardDescription>
            Upload screenshots, documents, or other evidence to support your assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storageError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Storage Error</AlertTitle>
              <AlertDescription>
                {storageError}
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkStorageBucket}
                    disabled={isCheckingStorage}
                    className="mt-2"
                  >
                    {isCheckingStorage ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Check Again
                      </>
                    )}
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2">
                        Need Help?
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Storage Configuration Help</SheetTitle>
                        <SheetDescription>
                          Resolving storage bucket configuration issues
                        </SheetDescription>
                      </SheetHeader>
                      {getTroubleshootingSteps()}
                    </SheetContent>
                  </Sheet>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {bucketExists && (
            <Alert variant="default" className="mb-4 bg-green-900/20 border-green-500/30">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Storage Ready</AlertTitle>
              <AlertDescription>
                Storage bucket is properly configured and ready for evidence uploads.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeFunction} onValueChange={setActiveFunction}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="Identify">Identify</TabsTrigger>
              <TabsTrigger value="Protect">Protect</TabsTrigger>
              <TabsTrigger value="Detect">Detect</TabsTrigger>
              <TabsTrigger value="Respond">Respond</TabsTrigger>
              <TabsTrigger value="Recover">Recover</TabsTrigger>
            </TabsList>
            
            {['Identify', 'Protect', 'Detect', 'Respond', 'Recover'].map(functionName => (
              <TabsContent key={functionName} value={functionName} className="mt-0">
                <div className="space-y-4">
                  {getFunctionCategories(functionName).map(category => (
                    <div key={category.category} className="border-t border-cyber-blue/10 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{category.category}</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddEvidence(category.category)}
                          disabled={!!storageError || isCheckingStorage || !bucketExists}
                        >
                          Add Evidence
                        </Button>
                      </div>
                      
                      {evidence
                        .filter(e => e.category === category.category)
                        .map(item => (
                          <Card key={item.id} className="mb-4 bg-cyber-gray-800/70">
                            <CardContent className="pt-4">
                              <div className="flex justify-between mb-2">
                                <Label>Description</Label>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveEvidence(item.id)}
                                  className="h-6 px-2 text-cyber-red hover:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <Textarea
                                placeholder="Describe this evidence..."
                                className="mb-4"
                                value={item.description}
                                onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                              />
                              
                              <Label className="mb-2 block">Upload Files</Label>
                              <div className="flex items-center gap-4 mb-4">
                                <Input
                                  type="file"
                                  multiple
                                  onChange={(e) => handleFileChange(item.id, e.target.files)}
                                  className="flex-1"
                                  disabled={uploadingFor === item.id || !bucketExists}
                                />
                                <Button
                                  variant="secondary"
                                  onClick={() => uploadFiles(item.id)}
                                  disabled={item.files.length === 0 || uploadingFor === item.id || !bucketExists}
                                >
                                  {uploadingFor === item.id ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                              </div>
                              
                              {item.files.length > 0 && (
                                <div className="mb-4">
                                  <Label className="mb-2 block">Files to upload:</Label>
                                  <div className="space-y-2">
                                    {item.files.map((file, index) => (
                                      <div key={index} className="flex items-center justify-between bg-cyber-gray-700 p-2 rounded text-sm">
                                        <div className="flex items-center">
                                          <FileText className="h-4 w-4 mr-2 text-cyber-blue" />
                                          <span>{file.name}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveFile(item.id, index)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {item.uploadedFiles.length > 0 && (
                                <div>
                                  <Label className="mb-2 block">Uploaded files:</Label>
                                  <div className="space-y-2">
                                    {item.uploadedFiles.map((file, index) => (
                                      <div key={index} className="flex items-center bg-cyber-gray-700/50 p-2 rounded text-sm">
                                        <FileText className="h-4 w-4 mr-2 text-cyber-green" />
                                        <span>{file.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                        
                      {!evidence.some(e => e.category === category.category) && (
                        <p className="text-sm text-cyber-gray-400 italic p-2">
                          No evidence added yet for this category.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvidenceUpload;
