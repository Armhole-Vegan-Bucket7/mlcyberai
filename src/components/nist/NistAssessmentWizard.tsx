
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, FileCheck, Building, Sliders, Upload } from 'lucide-react';
import CompanyDetailsForm from './CompanyDetailsForm';
import NistFrameworkAssessment from './NistFrameworkAssessment';
import EvidenceUpload from './EvidenceUpload';
import ReportVisualization from './ReportVisualization';

const steps = [
  { id: 'company', label: 'Company Details', icon: <Building className="h-4 w-4" /> },
  { id: 'assessment', label: 'NIST Assessment', icon: <Sliders className="h-4 w-4" /> },
  { id: 'evidence', label: 'Evidence Upload', icon: <Upload className="h-4 w-4" /> },
  { id: 'report', label: 'Report', icon: <FileCheck className="h-4 w-4" /> }
];

const NistAssessmentWizard = () => {
  const [currentStep, setCurrentStep] = useState('company');
  const [formData, setFormData] = useState({
    company: {},
    assessment: {},
    evidence: []
  });
  const [reportGenerated, setReportGenerated] = useState(false);

  const updateFormData = (step: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const handleNextStep = (currentStepId: string) => {
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrevStep = (currentStepId: string) => {
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    try {
      // Send data to webhook
      const response = await fetch('https://n8n.yourcompany.com/webhook/nist-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setReportGenerated(true);
        setCurrentStep('report');
      } else {
        console.error('Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          {steps.map((step) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              disabled={step.id === 'report' && !reportGenerated}
              className="flex items-center gap-2 py-3"
              onClick={() => step.id !== 'report' && setCurrentStep(step.id)}
            >
              {step.icon}
              <span className="hidden sm:inline">{step.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <Card className="border-cyber-blue/20 bg-cyber-gray-800/95 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <TabsContent value="company" className="space-y-4 mt-0">
              <CompanyDetailsForm 
                initialData={formData.company} 
                onSave={(data) => updateFormData('company', data)} 
              />
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => handleNextStep('company')}
                  className="bg-cyber-blue hover:bg-cyber-blue/80"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="assessment" className="space-y-4 mt-0">
              <NistFrameworkAssessment 
                initialData={formData.assessment}
                onSave={(data) => updateFormData('assessment', data)} 
              />
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => handlePrevStep('assessment')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  onClick={() => handleNextStep('assessment')}
                  className="bg-cyber-blue hover:bg-cyber-blue/80"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="evidence" className="space-y-4 mt-0">
              <EvidenceUpload 
                assessmentData={formData.assessment}
                onSave={(data) => updateFormData('evidence', data)} 
              />
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => handlePrevStep('evidence')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-cyber-indigo hover:bg-cyber-indigo/80"
                >
                  Generate Report <FileCheck className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="report" className="mt-0">
              {reportGenerated ? (
                <ReportVisualization assessmentData={formData} />
              ) : (
                <div className="text-center py-12">
                  <p>Submit the assessment to generate your report.</p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default NistAssessmentWizard;
