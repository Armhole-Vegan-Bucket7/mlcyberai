
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEvidenceStorage } from './evidence/useEvidenceStorage';
import StorageStatus from './evidence/StorageStatus';
import FunctionTab from './evidence/FunctionTab';
import { EvidenceUploadProps } from './evidence/types';

const EvidenceUpload: React.FC<EvidenceUploadProps> = ({ assessmentData, onSave }) => {
  const [activeFunction, setActiveFunction] = useState('Identify');
  
  const {
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
  } = useEvidenceStorage(onSave);

  const getFunctionCategories = (functionName: string) => {
    if (!assessmentData || !Array.isArray(assessmentData)) {
      return [];
    }
    
    const func = assessmentData.find(f => f.function === functionName);
    return func ? func.categories : [];
  };

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
          <StorageStatus 
            storageStatus={storageStatus}
            isCheckingStorage={isCheckingStorage}
            storageError={storageError}
            bucketExists={bucketExists}
            checkStorageBucket={checkStorageBucket}
          />
          
          <Tabs value={activeFunction} onValueChange={setActiveFunction}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="Identify">Identify</TabsTrigger>
              <TabsTrigger value="Protect">Protect</TabsTrigger>
              <TabsTrigger value="Detect">Detect</TabsTrigger>
              <TabsTrigger value="Respond">Respond</TabsTrigger>
              <TabsTrigger value="Recover">Recover</TabsTrigger>
            </TabsList>
            
            {['Identify', 'Protect', 'Detect', 'Respond', 'Recover'].map(functionName => (
              <FunctionTab
                key={functionName}
                functionName={functionName}
                categories={getFunctionCategories(functionName)}
                evidence={evidence}
                uploadingFor={uploadingFor}
                storageStatus={storageStatus}
                onAddEvidence={handleAddEvidence}
                onDescriptionChange={handleDescriptionChange}
                onFileChange={handleFileChange}
                onRemoveFile={handleRemoveFile}
                onRemoveEvidence={handleRemoveEvidence}
                onUploadFiles={uploadFiles}
              />
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvidenceUpload;
