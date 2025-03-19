
import { Activity, AlertCircle, BarChart3, Bell, Bug, Clock, DollarSign, ExternalLink, FileCog, Shield, Target, Users } from "lucide-react";
import { type LucideIcon } from "lucide-react";

// Types for our data structures
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved';
export type VulnerabilityStatus = 'new' | 'in progress' | 'resolved' | 'accepted';

export interface Incident {
  id: string;
  name: string;
  description: string;
  status: IncidentStatus;
  severity: SeverityLevel;
  affectedSystems: string[];
  detectedAt: string;
  assignedTo: string;
  source: string;
}

export interface Vulnerability {
  id: string;
  name: string;
  description: string;
  status: VulnerabilityStatus;
  severity: SeverityLevel;
  affectedSystems: string[];
  discoveredAt: string;
  cvss: number;
  cve?: string;
}

export interface SOCMetric {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  tooltip?: string;
}

// Generate tenant-specific metrics data
const generateMicrolandData = () => {
  const incidents: Incident[] = [
    {
      id: "ML-INC-001",
      name: "Unauthorized Admin Access",
      description: "Multiple unauthorized attempts to access admin portal detected from external IP address",
      status: "investigating",
      severity: "critical",
      affectedSystems: ["Admin Portal", "User Database"],
      detectedAt: "2023-12-02T14:30:45Z",
      assignedTo: "John Smith",
      source: "Sentinel"
    },
    {
      id: "ML-INC-002",
      name: "Potential Data Exfiltration",
      description: "Unusual data transfer to external domain detected from HR department",
      status: "contained",
      severity: "high",
      affectedSystems: ["HR Department Endpoints"],
      detectedAt: "2023-12-01T09:15:22Z",
      assignedTo: "Sarah Johnson",
      source: "Crowdstrike"
    },
    {
      id: "ML-INC-003",
      name: "Suspicious PowerShell Activity",
      description: "PowerShell scripts with known malicious patterns executed on multiple endpoints",
      status: "open",
      severity: "medium",
      affectedSystems: ["Marketing Dept Endpoints", "IT Workstations"],
      detectedAt: "2023-12-01T18:42:10Z",
      assignedTo: "Michael Patel",
      source: "Defender"
    },
    {
      id: "ML-INC-004",
      name: "DDoS Attack Attempt",
      description: "Attempted DDoS attack on corporate website",
      status: "resolved",
      severity: "low",
      affectedSystems: ["Public Website"],
      detectedAt: "2023-11-30T11:20:15Z",
      assignedTo: "Amy Rodriguez",
      source: "CloudFlare"
    },
  ];

  const vulnerabilities: Vulnerability[] = [
    {
      id: "ML-VUL-001",
      name: "Apache Log4j Vulnerability",
      description: "Remote code execution vulnerability in Log4j library",
      status: "in progress",
      severity: "critical",
      affectedSystems: ["API Servers", "Authentication Service"],
      discoveredAt: "2023-12-01T10:30:00Z",
      cvss: 9.8,
      cve: "CVE-2021-44228"
    },
    {
      id: "ML-VUL-002",
      name: "Outdated TLS Configuration",
      description: "Servers using outdated TLS 1.0 protocol",
      status: "new",
      severity: "high",
      affectedSystems: ["Legacy Application Servers"],
      discoveredAt: "2023-11-29T16:45:20Z",
      cvss: 7.4
    },
    {
      id: "ML-VUL-003",
      name: "Unpatched Windows Servers",
      description: "Missing security updates on Windows Server 2019 instances",
      status: "in progress",
      severity: "medium",
      affectedSystems: ["Domain Controllers", "File Servers"],
      discoveredAt: "2023-11-28T09:15:30Z",
      cvss: 5.6
    },
    {
      id: "ML-VUL-004",
      name: "Weak Password Policy",
      description: "Password policy does not meet industry standards",
      status: "accepted",
      severity: "medium",
      affectedSystems: ["Active Directory"],
      discoveredAt: "2023-11-25T14:20:10Z",
      cvss: 4.8
    },
    {
      id: "ML-VUL-005",
      name: "Exposed API Endpoints",
      description: "Public API endpoints without proper authentication",
      status: "resolved",
      severity: "high",
      affectedSystems: ["Customer Portal API"],
      discoveredAt: "2023-11-22T11:10:05Z",
      cvss: 8.2
    },
  ];

  const socMetrics: SOCMetric[] = [
    {
      title: "Active Alerts",
      value: 142,
      icon: Bell,
      change: { value: 12, type: "increase" },
      tooltip: "Total number of active security alerts currently being monitored"
    },
    {
      title: "Open Incidents",
      value: 8,
      icon: AlertCircle,
      change: { value: 2, type: "increase" },
      tooltip: "Total number of security incidents currently being investigated"
    },
    {
      title: "Average MTTR",
      value: "3.2 days",
      icon: Clock,
      change: { value: "0.5 days", type: "decrease" },
      tooltip: "Mean Time To Remediate security incidents"
    },
    {
      title: "SOC Analysts",
      value: 12,
      icon: Users,
      change: { value: 2, type: "increase" },
      tooltip: "Number of active SOC analysts"
    },
    {
      title: "Protection Coverage",
      value: "95%",
      icon: Shield,
      change: { value: "2%", type: "increase" },
      tooltip: "Percentage of assets covered by security monitoring"
    },
    {
      title: "Critical Vulnerabilities",
      value: 23,
      icon: Bug,
      change: { value: 5, type: "decrease" },
      tooltip: "Number of critical vulnerabilities detected"
    },
  ];

  const alertMetrics = [
    { name: 'Malware', value: 42 },
    { name: 'Phishing', value: 28 },
    { name: 'Network', value: 17 },
    { name: 'Identity', value: 13 },
    { name: 'Cloud', value: 25 },
  ];

  const mttrByPriority = [
    { name: 'Critical', value: 1.2 },
    { name: 'High', value: 2.8 },
    { name: 'Medium', value: 5.6 },
    { name: 'Low', value: 8.9 },
  ];

  const securityPostureScore = 78;

  const alertTrends = [
    { name: 'Week 1', alerts: 74, incidents: 6 },
    { name: 'Week 2', alerts: 89, incidents: 8 },
    { name: 'Week 3', alerts: 112, incidents: 12 },
    { name: 'Week 4', alerts: 93, incidents: 9 },
  ];

  return {
    incidents,
    vulnerabilities,
    socMetrics,
    alertMetrics,
    mttrByPriority,
    securityPostureScore,
    alertTrends
  };
};

// Generate RSM-specific metrics data
const generateRSMData = () => {
  const incidents: Incident[] = [
    {
      id: "RSM-INC-001",
      name: "Ransomware Attempt",
      description: "Ransomware attempt detected and blocked on finance department workstation",
      status: "contained",
      severity: "critical",
      affectedSystems: ["Finance Dept Workstation"],
      detectedAt: "2023-12-02T10:15:22Z",
      assignedTo: "David Wilson",
      source: "Crowdstrike"
    },
    {
      id: "RSM-INC-002",
      name: "Brute Force Attack",
      description: "Multiple failed login attempts on client portal from multiple IPs",
      status: "investigating",
      severity: "high",
      affectedSystems: ["Client Portal"],
      detectedAt: "2023-12-01T22:45:10Z",
      assignedTo: "Emma Clark",
      source: "Sentinel"
    },
    {
      id: "RSM-INC-003",
      name: "Phishing Campaign",
      description: "Targeted phishing campaign against executive team",
      status: "open",
      severity: "high",
      affectedSystems: ["Email Gateway"],
      detectedAt: "2023-12-01T14:30:45Z",
      assignedTo: "Robert Chen",
      source: "Proofpoint"
    },
  ];

  const vulnerabilities: Vulnerability[] = [
    {
      id: "RSM-VUL-001",
      name: "Critical VMware ESXi Vulnerability",
      description: "Remote code execution vulnerability in VMware ESXi",
      status: "in progress",
      severity: "critical",
      affectedSystems: ["Virtual Infrastructure"],
      discoveredAt: "2023-12-01T08:20:00Z",
      cvss: 9.1,
      cve: "CVE-2023-20892"
    },
    {
      id: "RSM-VUL-002",
      name: "SQL Injection Vulnerability",
      description: "SQL injection vulnerability in customer portal application",
      status: "new",
      severity: "high",
      affectedSystems: ["Customer Portal"],
      discoveredAt: "2023-11-30T11:45:20Z",
      cvss: 8.2
    },
    {
      id: "RSM-VUL-003",
      name: "Insecure OAuth Implementation",
      description: "Improper OAuth implementation in partner integration API",
      status: "new",
      severity: "medium",
      affectedSystems: ["Partner API Gateway"],
      discoveredAt: "2023-11-28T14:10:30Z",
      cvss: 6.3
    },
    {
      id: "RSM-VUL-004",
      name: "Default Credentials",
      description: "Default credentials found on network devices",
      status: "in progress",
      severity: "medium",
      affectedSystems: ["Network Infrastructure"],
      discoveredAt: "2023-11-27T09:50:10Z",
      cvss: 5.9
    },
  ];

  const socMetrics: SOCMetric[] = [
    {
      title: "Active Alerts",
      value: 98,
      icon: Bell,
      change: { value: 8, type: "decrease" },
      tooltip: "Total number of active security alerts currently being monitored"
    },
    {
      title: "Open Incidents",
      value: 5,
      icon: AlertCircle,
      change: { value: 1, type: "increase" },
      tooltip: "Total number of security incidents currently being investigated"
    },
    {
      title: "Average MTTR",
      value: "2.8 days",
      icon: Clock,
      change: { value: "0.3 days", type: "decrease" },
      tooltip: "Mean Time To Remediate security incidents"
    },
    {
      title: "SOC Analysts",
      value: 8,
      icon: Users,
      change: { value: 0, type: "neutral" },
      tooltip: "Number of active SOC analysts"
    },
    {
      title: "Protection Coverage",
      value: "92%",
      icon: Shield,
      change: { value: "3%", type: "increase" },
      tooltip: "Percentage of assets covered by security monitoring"
    },
    {
      title: "Critical Vulnerabilities",
      value: 14,
      icon: Bug,
      change: { value: 2, type: "decrease" },
      tooltip: "Number of critical vulnerabilities detected"
    },
  ];

  const alertMetrics = [
    { name: 'Malware', value: 35 },
    { name: 'Phishing', value: 42 },
    { name: 'Network', value: 12 },
    { name: 'Identity', value: 18 },
    { name: 'Cloud', value: 15 },
  ];

  const mttrByPriority = [
    { name: 'Critical', value: 1.5 },
    { name: 'High', value: 3.2 },
    { name: 'Medium', value: 6.1 },
    { name: 'Low', value: 9.4 },
  ];

  const securityPostureScore = 72;

  const alertTrends = [
    { name: 'Week 1', alerts: 62, incidents: 4 },
    { name: 'Week 2', alerts: 78, incidents: 7 },
    { name: 'Week 3', alerts: 85, incidents: 6 },
    { name: 'Week 4', alerts: 70, incidents: 5 },
  ];

  return {
    incidents,
    vulnerabilities,
    socMetrics,
    alertMetrics,
    mttrByPriority,
    securityPostureScore,
    alertTrends
  };
};

// Generate Indorama-specific metrics data
const generateIndoramaData = () => {
  const incidents: Incident[] = [
    {
      id: "IND-INC-001",
      name: "OT Network Intrusion Attempt",
      description: "Attempted intrusion into operational technology network from corporate network",
      status: "investigating",
      severity: "critical",
      affectedSystems: ["OT Network Gateway"],
      detectedAt: "2023-12-02T08:45:30Z",
      assignedTo: "Mark Johnson",
      source: "Darktrace"
    },
    {
      id: "IND-INC-002",
      name: "Supply Chain Portal Compromise",
      description: "Evidence of compromise in supplier management portal",
      status: "contained",
      severity: "high",
      affectedSystems: ["Supplier Portal", "Partner Database"],
      detectedAt: "2023-12-01T16:30:20Z",
      assignedTo: "Lisa Chang",
      source: "Sentinel"
    },
    {
      id: "IND-INC-003",
      name: "Insider Threat Detection",
      description: "Unusual file access patterns from employee account",
      status: "open",
      severity: "high",
      affectedSystems: ["Document Management System"],
      detectedAt: "2023-11-30T14:20:10Z",
      assignedTo: "Thomas Brown",
      source: "Varonis"
    },
    {
      id: "IND-INC-004",
      name: "Business Email Compromise",
      description: "CEO email account potentially compromised",
      status: "investigating",
      severity: "high",
      affectedSystems: ["Office 365", "Email Gateway"],
      detectedAt: "2023-11-29T09:15:45Z",
      assignedTo: "Jennifer Lopez",
      source: "Microsoft Defender"
    },
  ];

  const vulnerabilities: Vulnerability[] = [
    {
      id: "IND-VUL-001",
      name: "PLC Firmware Vulnerability",
      description: "Critical vulnerability in PLC firmware allowing remote code execution",
      status: "new",
      severity: "critical",
      affectedSystems: ["Manufacturing PLCs"],
      discoveredAt: "2023-12-01T10:30:00Z",
      cvss: 9.6,
      cve: "CVE-2023-1234"
    },
    {
      id: "IND-VUL-002",
      name: "SCADA System Access Control Weakness",
      description: "Weak access control in SCADA systems allowing unauthorized configuration changes",
      status: "in progress",
      severity: "critical",
      affectedSystems: ["SCADA Control Systems"],
      discoveredAt: "2023-11-28T16:45:20Z",
      cvss: 8.7
    },
    {
      id: "IND-VUL-003",
      name: "Unpatched ERP System",
      description: "Critical security patches missing from ERP system",
      status: "in progress",
      severity: "high",
      affectedSystems: ["SAP ERP"],
      discoveredAt: "2023-11-25T09:30:30Z",
      cvss: 7.8
    },
    {
      id: "IND-VUL-004",
      name: "Insecure Remote Access Solution",
      description: "VPN solution with known security vulnerabilities",
      status: "in progress",
      severity: "high",
      affectedSystems: ["Remote Access Infrastructure"],
      discoveredAt: "2023-11-22T14:20:10Z",
      cvss: 7.4
    },
    {
      id: "IND-VUL-005",
      name: "Outdated HMI Software",
      description: "Human-Machine Interface software running outdated version with multiple vulnerabilities",
      status: "new",
      severity: "medium",
      affectedSystems: ["Plant HMI Controllers"],
      discoveredAt: "2023-11-20T11:10:05Z",
      cvss: 6.2
    },
  ];

  const socMetrics: SOCMetric[] = [
    {
      title: "Active Alerts",
      value: 127,
      icon: Bell,
      change: { value: 15, type: "increase" },
      tooltip: "Total number of active security alerts currently being monitored"
    },
    {
      title: "Open Incidents",
      value: 7,
      icon: AlertCircle,
      change: { value: 1, type: "decrease" },
      tooltip: "Total number of security incidents currently being investigated"
    },
    {
      title: "Average MTTR",
      value: "4.1 days",
      icon: Clock,
      change: { value: "0.2 days", type: "increase" },
      tooltip: "Mean Time To Remediate security incidents"
    },
    {
      title: "SOC Analysts",
      value: 10,
      icon: Users,
      change: { value: 1, type: "increase" },
      tooltip: "Number of active SOC analysts"
    },
    {
      title: "Protection Coverage",
      value: "88%",
      icon: Shield,
      change: { value: "5%", type: "increase" },
      tooltip: "Percentage of assets covered by security monitoring"
    },
    {
      title: "Critical Vulnerabilities",
      value: 32,
      icon: Bug,
      change: { value: 4, type: "increase" },
      tooltip: "Number of critical vulnerabilities detected"
    },
  ];

  const alertMetrics = [
    { name: 'Malware', value: 28 },
    { name: 'Phishing', value: 35 },
    { name: 'Network', value: 25 },
    { name: 'Identity', value: 17 },
    { name: 'OT Security', value: 42 },
  ];

  const mttrByPriority = [
    { name: 'Critical', value: 2.2 },
    { name: 'High', value: 4.5 },
    { name: 'Medium', value: 7.8 },
    { name: 'Low', value: 12.3 },
  ];

  const securityPostureScore = 65;

  const alertTrends = [
    { name: 'Week 1', alerts: 85, incidents: 7 },
    { name: 'Week 2', alerts: 98, incidents: 9 },
    { name: 'Week 3', alerts: 125, incidents: 11 },
    { name: 'Week 4', alerts: 112, incidents: 10 },
  ];

  return {
    incidents,
    vulnerabilities,
    socMetrics,
    alertMetrics,
    mttrByPriority,
    securityPostureScore,
    alertTrends
  };
};

// Function to get tenant specific data
export const getTenantMetrics = (tenantId: string) => {
  switch (tenantId) {
    case '1':
      return generateMicrolandData();
    case '2':
      return generateRSMData();
    case '3':
      return generateIndoramaData();
    default:
      return generateMicrolandData();
  }
};
