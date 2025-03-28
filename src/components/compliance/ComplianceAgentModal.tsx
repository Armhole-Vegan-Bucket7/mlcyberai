
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Paperclip, CornerDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ComplianceAgent, useComplianceAgents } from './ComplianceAgentContext';

interface ComplianceAgentModalProps {
  agent: ComplianceAgent;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const ComplianceAgentModal: React.FC<ComplianceAgentModalProps> = ({ agent }) => {
  const { toggleAgentExpanded, focusMode } = useComplianceAgents();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add welcome message when modal opens
  useEffect(() => {
    setChatHistory([
      {
        id: 'welcome',
        role: 'agent',
        content: `Hello! I'm your ${agent.name} assistant. How can I help you with ${agent.category} compliance today?`,
        timestamp: new Date(),
      },
    ]);
    
    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [agent]);

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date(),
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const agentResponse = {
        id: (Date.now() + 1).toString(),
        role: 'agent' as const,
        content: getSimulatedResponse(agent, userMessage.content),
        timestamp: new Date(),
      };
      
      setChatHistory(prev => [...prev, agentResponse]);
      setIsLoading(false);
    }, 1500);
  };

  // Generate simulated responses based on agent type and user message
  const getSimulatedResponse = (agent: ComplianceAgent, query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Generic responses based on agent type
    switch(agent.id) {
      case 'pci':
        if (lowerQuery.includes('requirement')) {
          return "PCI DSS has 12 core requirements organized into 6 control objectives. They cover secure networks, cardholder data protection, vulnerability management, access controls, monitoring, and policy maintenance.";
        }
        return "The Payment Card Industry Data Security Standard (PCI DSS) helps protect payment card data. To maintain compliance, you'll need to secure your network, protect cardholder data, maintain a vulnerability management program, implement strong access control measures, monitor networks, and maintain an information security policy.";
      
      case 'gdpr':
        if (lowerQuery.includes('consent')) {
          return "Under GDPR, consent must be freely given, specific, informed, and unambiguous. It requires a clear affirmative action, and you must keep records of how and when consent was obtained.";
        }
        return "The General Data Protection Regulation (GDPR) emphasizes transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity, and accountability. Organization must implement appropriate technical and organizational measures to ensure data protection by design and default.";
      
      case 'hipaa':
        if (lowerQuery.includes('breach')) {
          return "HIPAA Breach Notification Rule requires covered entities to notify affected individuals, the HHS Secretary, and in some cases, the media of a breach of unsecured protected health information. Notifications must be provided without unreasonable delay and no later than 60 days following the discovery of a breach.";
        }
        return "The Health Insurance Portability and Accountability Act (HIPAA) sets the standard for protecting sensitive patient data. Any organization dealing with protected health information (PHI) must ensure that all required physical, network, and process security measures are in place and followed.";
      
      default:
        return `Thank you for your question about ${agent.name.replace(' Mini', '')}. As a compliance assistant, I can help you understand requirements, implementation strategies, and best practices for staying compliant with this framework.`;
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{agent.icon}</div>
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.category}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => toggleAgentExpanded(agent.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Chat area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4"
        style={{ maxHeight: focusMode ? 'calc(80vh - 120px)' : '350px' }}
      >
        <div className="space-y-4">
          {chatHistory.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-12' 
                    : 'bg-muted mr-12'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted mr-12">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-75"></div>
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></div>
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 border-t bg-card">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              placeholder={`Ask ${agent.name} a question...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-10 resize-none pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-2 bottom-2 text-muted-foreground">
              <CornerDownLeft className="h-4 w-4" />
            </div>
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by compliance-focused AI
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default ComplianceAgentModal;
