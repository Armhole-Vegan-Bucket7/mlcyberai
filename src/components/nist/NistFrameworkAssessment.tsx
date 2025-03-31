
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

interface CategoryAssessment {
  category: string;
  description: string;
  score: number;
}

interface FunctionAssessment {
  function: string;
  description: string;
  categories: CategoryAssessment[];
}

interface NistFrameworkAssessmentProps {
  initialData: any;
  onSave: (data: any) => void;
}

const nistFunctions: FunctionAssessment[] = [
  {
    function: "Identify",
    description: "Develop organizational understanding to manage cybersecurity risk to systems, people, assets, data, and capabilities.",
    categories: [
      {
        category: "Asset Management",
        description: "The data, personnel, devices, systems, and facilities that enable the organization to achieve business purposes are identified and managed consistent with their relative importance.",
        score: 1
      },
      {
        category: "Business Environment",
        description: "The organization's mission, objectives, stakeholders, and activities are understood and prioritized.",
        score: 1
      },
      {
        category: "Governance",
        description: "The policies, procedures, and processes to manage and monitor regulatory, legal, risk, environmental, and operational requirements are understood and inform cybersecurity risk management.",
        score: 1
      },
      {
        category: "Risk Assessment",
        description: "The organization understands the cybersecurity risk to operations, assets, and individuals.",
        score: 1
      },
      {
        category: "Risk Management Strategy",
        description: "The organization's priorities, constraints, risk tolerances, and assumptions are established and used to support risk decisions.",
        score: 1
      }
    ]
  },
  {
    function: "Protect",
    description: "Develop and implement appropriate safeguards to ensure delivery of critical services.",
    categories: [
      {
        category: "Identity Management & Access Control",
        description: "Access to physical and logical assets and associated facilities is limited to authorized users, processes, and devices, and is managed consistent with the assessed risk.",
        score: 1
      },
      {
        category: "Awareness and Training",
        description: "The organization's personnel and partners are provided cybersecurity awareness education and are trained to perform their duties consistent with related policies and procedures.",
        score: 1
      },
      {
        category: "Data Security",
        description: "Information and records are managed consistent with the organization's risk strategy to protect the confidentiality, integrity, and availability of information.",
        score: 1
      },
      {
        category: "Information Protection Processes",
        description: "Security policies, processes, and procedures are maintained and used to manage protection of information systems and assets.",
        score: 1
      },
      {
        category: "Protective Technology",
        description: "Technical security solutions are managed to ensure the security and resilience of systems and assets.",
        score: 1
      }
    ]
  },
  {
    function: "Detect",
    description: "Develop and implement appropriate activities to identify the occurrence of a cybersecurity event.",
    categories: [
      {
        category: "Anomalies and Events",
        description: "Anomalous activity is detected and the potential impact of events is understood.",
        score: 1
      },
      {
        category: "Security Continuous Monitoring",
        description: "The information system and assets are monitored to identify cybersecurity events and verify the effectiveness of protective measures.",
        score: 1
      },
      {
        category: "Detection Processes",
        description: "Detection processes and procedures are maintained and tested to ensure awareness of anomalous events.",
        score: 1
      }
    ]
  },
  {
    function: "Respond",
    description: "Develop and implement appropriate activities to take action regarding a detected cybersecurity incident.",
    categories: [
      {
        category: "Response Planning",
        description: "Response processes and procedures are executed and maintained to ensure response to detected cybersecurity incidents.",
        score: 1
      },
      {
        category: "Communications",
        description: "Response activities are coordinated with internal and external stakeholders.",
        score: 1
      },
      {
        category: "Analysis",
        description: "Analysis is conducted to ensure effective response and support recovery activities.",
        score: 1
      },
      {
        category: "Mitigation",
        description: "Activities are performed to prevent expansion of an event, mitigate its effects, and resolve the incident.",
        score: 1
      },
      {
        category: "Improvements",
        description: "Organizational response activities are improved by incorporating lessons learned from current and previous detection/response activities.",
        score: 1
      }
    ]
  },
  {
    function: "Recover",
    description: "Develop and implement appropriate activities to maintain plans for resilience and to restore any capabilities or services that were impaired due to a cybersecurity incident.",
    categories: [
      {
        category: "Recovery Planning",
        description: "Recovery processes and procedures are executed and maintained to ensure restoration of systems or assets affected by cybersecurity incidents.",
        score: 1
      },
      {
        category: "Improvements",
        description: "Recovery planning and processes are improved by incorporating lessons learned into future activities.",
        score: 1
      },
      {
        category: "Communications",
        description: "Restoration activities are coordinated with internal and external parties.",
        score: 1
      }
    ]
  }
];

const maturityLevels = [
  { value: 1, label: "Initial", description: "Practices are ad hoc and unorganized" },
  { value: 2, label: "Developing", description: "Practices are documented but inconsistent" },
  { value: 3, label: "Defined", description: "Standard practices are documented and followed" },
  { value: 4, label: "Managed", description: "Practices are measured and controlled" },
  { value: 5, label: "Optimizing", description: "Focus on continuous improvement" }
];

const NistFrameworkAssessment: React.FC<NistFrameworkAssessmentProps> = ({ initialData, onSave }) => {
  // Initialize with provided data or default framework
  const [assessment, setAssessment] = useState<FunctionAssessment[]>(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      return initialData;
    }
    return nistFunctions;
  });
  
  const [activeTab, setActiveTab] = useState(assessment[0].function);

  const handleScoreChange = (functionIndex: number, categoryIndex: number, newScore: number) => {
    const updatedAssessment = [...assessment];
    updatedAssessment[functionIndex].categories[categoryIndex].score = newScore;
    setAssessment(updatedAssessment);
    onSave(updatedAssessment);
  };

  const getMaturityLabel = (score: number) => {
    const level = maturityLevels.find(level => level.value === score);
    return level ? level.label : "";
  };

  return (
    <div className="space-y-6">
      <Card className="border border-cyber-blue/10 bg-cyber-gray-900/50">
        <CardHeader>
          <CardTitle className="text-xl text-cyber-blue">NIST Cybersecurity Framework Assessment</CardTitle>
          <CardDescription>
            Rate your organization's maturity level for each category of the NIST Cybersecurity Framework.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-between mb-4">
              {maturityLevels.map((level) => (
                <div key={level.value} className="text-center p-2 rounded-md bg-cyber-gray-800 border border-cyber-blue/10 flex-1 min-w-[100px]">
                  <div className="font-semibold text-sm text-cyber-blue">{level.label}</div>
                  <div className="text-xs text-cyber-gray-400">{level.description}</div>
                </div>
              ))}
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                {assessment.map((func) => (
                  <TabsTrigger 
                    key={func.function} 
                    value={func.function}
                    className="text-xs"
                  >
                    {func.function}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {assessment.map((func, funcIndex) => (
                <TabsContent key={func.function} value={func.function} className="mt-0">
                  <div className="space-y-6">
                    <p className="text-sm text-cyber-gray-300">{func.description}</p>
                    
                    {func.categories.map((category, catIndex) => (
                      <div key={category.category} className="space-y-2 border-t border-cyber-blue/10 pt-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{category.category}</h4>
                            <p className="text-xs text-cyber-gray-400">{category.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-cyber-blue">
                              {getMaturityLabel(category.score)}
                            </span>
                            <span className="text-xs text-cyber-gray-400 ml-1">
                              (Level {category.score})
                            </span>
                          </div>
                        </div>
                        
                        <Slider
                          value={[category.score]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => handleScoreChange(funcIndex, catIndex, value[0])}
                          className="my-4"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NistFrameworkAssessment;
