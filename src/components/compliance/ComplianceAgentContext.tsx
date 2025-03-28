
import React, { createContext, useContext, useState, useEffect } from 'react';

export type AgentCategory = 'Data Privacy' | 'Regulatory' | 'Security Frameworks';

export interface ComplianceAgent {
  id: string;
  name: string;
  category: AgentCategory;
  icon: string;
  description: string;
  isActive: boolean;
  isExpanded: boolean;
}

interface ComplianceAgentContextType {
  agents: ComplianceAgent[];
  toggleAgentActive: (id: string) => void;
  toggleAgentExpanded: (id: string) => void;
  closeAllAgents: () => void;
  visibleCategories: AgentCategory[];
  toggleCategory: (category: AgentCategory) => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
  focusedAgent: string | null;
  setFocusedAgent: (id: string | null) => void;
}

const defaultAgents: ComplianceAgent[] = [
  {
    id: 'pci',
    name: 'PCI Mini',
    category: 'Regulatory',
    icon: '💳',
    description: 'Ask me anything about PCI DSS compliance and payment card security.',
    isActive: true,
    isExpanded: false,
  },
  {
    id: 'gdpr',
    name: 'GDPR Mini',
    category: 'Data Privacy',
    icon: '🇪🇺',
    description: 'Get help with GDPR compliance, data privacy regulations and requirements.',
    isActive: true,
    isExpanded: false,
  },
  {
    id: 'hipaa',
    name: 'HIPAA Mini',
    category: 'Regulatory',
    icon: '🏥',
    description: 'Information about healthcare data protection and HIPAA regulations.',
    isActive: true,
    isExpanded: false,
  },
  {
    id: 'iso27001',
    name: 'ISO Mini',
    category: 'Security Frameworks',
    icon: '🔒',
    description: 'Guidance on ISO 27001 implementation and information security management.',
    isActive: true,
    isExpanded: false,
  },
  {
    id: 'nist',
    name: 'NIST Mini',
    category: 'Security Frameworks',
    icon: '🛡️',
    description: 'Support for NIST Cybersecurity Framework implementation and assessments.',
    isActive: true,
    isExpanded: false,
  },
  {
    id: 'ccpa',
    name: 'CCPA Mini',
    category: 'Data Privacy',
    icon: '🔐',
    description: 'California Consumer Privacy Act compliance guidance and requirements.',
    isActive: true,
    isExpanded: false,
  },
  {
    id: 'sox',
    name: 'SOX Mini',
    category: 'Regulatory',
    icon: '📊',
    description: 'Sarbanes-Oxley Act compliance for financial reporting controls.',
    isActive: true,
    isExpanded: false,
  },
  {
    id: 'cmmc',
    name: 'CMMC Mini',
    category: 'Security Frameworks',
    icon: '🔧',
    description: 'Cybersecurity Maturity Model Certification for defense contractors.',
    isActive: true,
    isExpanded: false,
  }
];

const defaultCategories: AgentCategory[] = ['Data Privacy', 'Regulatory', 'Security Frameworks'];

const ComplianceAgentContext = createContext<ComplianceAgentContextType | undefined>(undefined);

export const ComplianceAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check localStorage for saved state
  const storedAgents = localStorage.getItem('complianceAgents');
  const storedCategories = localStorage.getItem('visibleCategories');
  const storedFocusMode = localStorage.getItem('focusMode');

  const [agents, setAgents] = useState<ComplianceAgent[]>(
    storedAgents ? JSON.parse(storedAgents) : defaultAgents
  );
  
  const [visibleCategories, setVisibleCategories] = useState<AgentCategory[]>(
    storedCategories ? JSON.parse(storedCategories) : defaultCategories
  );
  
  const [focusMode, setFocusMode] = useState<boolean>(
    storedFocusMode ? JSON.parse(storedFocusMode) : false
  );
  
  const [focusedAgent, setFocusedAgent] = useState<string | null>(null);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('complianceAgents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('visibleCategories', JSON.stringify(visibleCategories));
  }, [visibleCategories]);

  useEffect(() => {
    localStorage.setItem('focusMode', JSON.stringify(focusMode));
  }, [focusMode]);

  const toggleAgentActive = (id: string) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === id ? { ...agent, isActive: !agent.isActive } : agent
      )
    );
  };

  const toggleAgentExpanded = (id: string) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === id 
          ? { ...agent, isExpanded: !agent.isExpanded } 
          : { ...agent, isExpanded: false }
      )
    );
  };

  const closeAllAgents = () => {
    setAgents(prevAgents => 
      prevAgents.map(agent => ({ ...agent, isExpanded: false }))
    );
  };

  const toggleCategory = (category: AgentCategory) => {
    setVisibleCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const toggleFocusMode = () => {
    setFocusMode(prev => !prev);
    if (focusMode) {
      setFocusedAgent(null);
    }
  };

  return (
    <ComplianceAgentContext.Provider
      value={{
        agents,
        toggleAgentActive,
        toggleAgentExpanded,
        closeAllAgents,
        visibleCategories,
        toggleCategory,
        focusMode,
        toggleFocusMode,
        focusedAgent,
        setFocusedAgent,
      }}
    >
      {children}
    </ComplianceAgentContext.Provider>
  );
};

export const useComplianceAgents = () => {
  const context = useContext(ComplianceAgentContext);
  if (context === undefined) {
    throw new Error('useComplianceAgents must be used within a ComplianceAgentProvider');
  }
  return context;
};
