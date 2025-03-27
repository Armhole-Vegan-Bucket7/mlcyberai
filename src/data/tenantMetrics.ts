import { Activity, AlertCircle, BarChart3, Bell, Bug, Clock, DollarSign, ExternalLink, FileCog, Shield, Target, Users } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { getRecentTimestamp } from "@/utils/dateUtils";

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
  const incidents = [
    {
      id: "ML-INC-001",
      name: "Unauthorized Admin Access",
      description: "Multiple unauthorized attempts to access admin portal detected from external IP address",
      status: "investigating",
      severity: "critical",
      affectedSystems: ["Admin Portal", "User Database"],
      detectedAt: getRecentTimestamp(0, 10),
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
      detectedAt: getRecentTimestamp(1, 15),
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
      detectedAt: getRecentTimestamp(1, 6),
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
      detectedAt: getRecentTimestamp(2, 13),
      assignedTo: "Amy Rodriguez",
      source: "CloudFlare"
    },
  ];

  const vulnerabilities = [
    {
      id: "ML-VUL-001",
      name: "Apache Log4j Vulnerability",
      description: "Remote code execution vulnerability in Log4j library",
      status: "in progress",
      severity: "critical",
      affectedSystems: ["API Servers", "Authentication Service"],
      discoveredAt: getRecentTimestamp(2, 14),
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
      discoveredAt: getRecentTimestamp(3, 8),
      cvss: 7.4
    },
    {
      id: "ML-VUL-003",
      name: "Unpatched Windows Servers",
      description: "Missing security updates on Windows Server 2019 instances",
      status: "in progress",
      severity: "medium",
      affectedSystems: ["Domain Controllers", "File Servers"],
      discoveredAt: getRecentTimestamp(4, 15),
      cvss: 5.6
    },
    {
      id: "ML-VUL-004",
      name: "Weak Password Policy",
      description: "Password policy does not meet industry standards",
      status: "accepted",
      severity: "medium",
      affectedSystems: ["Active Directory"],
      discoveredAt: getRecentTimestamp(5, 10),
      cvss: 4.8
    },
    {
      id: "ML-VUL-005",
      name: "Exposed API Endpoints",
      description: "Public API endpoints without proper authentication",
      status: "resolved",
      severity: "high",
      affectedSystems: ["Customer Portal API"],
      discoveredAt: getRecentTimestamp(8, 14),
      cvss: 8.2
    },
    {
      id: "ML-VUL-006",
      name: "Spring4Shell Vulnerability",
      description: "Remote code execution in Spring Framework",
      status: "new",
      severity: "critical",
      affectedSystems: ["Web Applications", "API Gateway"],
      discoveredAt: getRecentTimestamp(1, 16),
      cvss: 9.6,
      cve: "CVE-2022-22965"
    },
    {
      id: "ML-VUL-007",
      name: "SQL Injection in Legacy App",
      description: "SQL injection vulnerability in customer database query",
      status: "in progress",
      severity: "high",
      affectedSystems: ["Customer Management System"],
      discoveredAt: getRecentTimestamp(1, 30),
      cvss: 7.8
    },
    {
      id: "ML-VUL-008",
      name: "Insecure Deserialization",
      description: "Java application vulnerable to insecure deserialization attacks",
      status: "new",
      severity: "high",
      affectedSystems: ["Accounting System"],
      discoveredAt: getRecentTimestamp(1, 28),
      cvss: 8.1,
      cve: "CVE-2023-1234"
    },
    {
      id: "ML-VUL-009",
      name: "Outdated jQuery Version",
      description: "Multiple websites using vulnerable jQuery version",
      status: "accepted",
      severity: "low",
      affectedSystems: ["Corporate Website", "Partner Portal"],
      discoveredAt: getRecentTimestamp(1, 24),
      cvss: 3.7
    },
    {
      id: "ML-VUL-010",
      name: "Cross-Site Scripting (XSS)",
      description: "Reflected XSS vulnerability in search functionality",
      status: "in progress",
      severity: "medium",
      affectedSystems: ["Internal Knowledge Base"],
      discoveredAt: getRecentTimestamp(1, 20),
      cvss: 6.4
    },
    {
      id: "ML-VUL-011",
      name: "Outdated SSL Cipher Suites",
      description: "Web servers using deprecated SSL cipher suites",
      status: "new",
      severity: "low",
      affectedSystems: ["Load Balancers"],
      discoveredAt: getRecentTimestamp(1, 18),
      cvss: 3.2
    },
    {
      id: "ML-VUL-012",
      name: "Privilege Escalation in CMS",
      description: "Authenticated users can escalate privileges in CMS",
      status: "new",
      severity: "medium",
      affectedSystems: ["Content Management System"],
      discoveredAt: getRecentTimestamp(1, 15),
      cvss: 6.8
    }
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
  const incidents = [
    {
      id: "RSM-INC-001",
      name: "Ransomware Attempt",
      description: "Ransomware attempt detected and blocked on finance department workstation",
      status: "contained",
      severity: "critical",
      affectedSystems: ["Finance Dept Workstation"],
      detectedAt: getRecentTimestamp(0, 14),
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
      detectedAt: getRecentTimestamp(1, 2),
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
      detectedAt: getRecentTimestamp(1, 10),
      assignedTo: "Robert Chen",
      source: "Proofpoint"
    },
  ];

  const vulnerabilities = [
    {
      id: "RSM-VUL-001",
      name: "Critical VMware ESXi Vulnerability",
      description: "Remote code execution vulnerability in VMware ESXi",
      status: "in progress",
      severity: "critical",
      affectedSystems: ["Virtual Infrastructure"],
      discoveredAt: getRecentTimestamp(2, 16),
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
      discoveredAt: getRecentTimestamp(3, 30),
      cvss: 8.2
    },
    {
      id: "RSM-VUL-003",
      name: "Insecure OAuth Implementation",
      description: "Improper OAuth implementation in partner integration API",
      status: "new",
      severity: "medium",
      affectedSystems: ["Partner API Gateway"],
      discoveredAt: getRecentTimestamp(4, 14),
      cvss: 6.3
    },
    {
      id: "RSM-VUL-004",
      name: "Default Credentials",
      description: "Default credentials found on network devices",
      status: "in progress",
      severity: "medium",
      affectedSystems: ["Network Infrastructure"],
      discoveredAt: getRecentTimestamp(5, 15),
      cvss: 5.9
    },
    {
      id: "RSM-VUL-005",
      name: "Exchange Server Zero-Day",
      description: "Critical zero-day vulnerability in Microsoft Exchange Server",
      status: "new",
      severity: "critical",
      affectedSystems: ["Email Servers"],
      discoveredAt: getRecentTimestamp(6, 10),
      cvss: 9.9,
      cve: "CVE-2023-21000"
    },
    {
      id: "RSM-VUL-006",
      name: "Outdated WordPress Plugins",
      description: "Multiple vulnerable WordPress plugins on corporate blog",
      status: "in progress",
      severity: "high",
      affectedSystems: ["Company Blog"],
      discoveredAt: getRecentTimestamp(7, 16),
      cvss: 7.6
    },
    {
      id: "RSM-VUL-007",
      name: "SSRF Vulnerability",
      description: "Server-Side Request Forgery in internal API",
      status: "new",
      severity: "high",
      affectedSystems: ["Internal Tools", "API Gateway"],
      discoveredAt: getRecentTimestamp(8, 13),
      cvss: 8.0
    },
    {
      id: "RSM-VUL-008",
      name: "Certificate Expiration",
      description: "SSL certificates approaching expiration",
      status: "in progress",
      severity: "medium",
      affectedSystems: ["Public Websites", "Client Portal"],
      discoveredAt: getRecentTimestamp(9, 10),
      cvss: 5.2
    },
    {
      id: "RSM-VUL-009",
      name: "Missing HTTP Security Headers",
      description: "Web applications missing critical security headers",
      status: "new",
      severity: "low",
      affectedSystems: ["Marketing Website", "Partner Portal"],
      discoveredAt: getRecentTimestamp(10, 14),
      cvss: 3.4
    },
    {
      id: "RSM-VUL-010",
      name: "Path Traversal Vulnerability",
      description: "File upload functionality vulnerable to path traversal",
      status: "new",
      severity: "medium",
      affectedSystems: ["Document Management System"],
      discoveredAt: getRecentTimestamp(11, 11),
      cvss: 6.1
    },
    {
      id: "RSM-VUL-011",
      name: "Outdated NPM Packages",
      description: "Multiple applications using vulnerable NPM packages",
      status: "in progress",
      severity: "low",
      affectedSystems: ["Web Applications"],
      discoveredAt: getRecentTimestamp(12, 10),
      cvss: 3.8
    },
    {
      id: "RSM-VUL-012",
      name: "Missing Data Encryption",
      description: "Customer data stored without proper encryption",
      status: "new",
      severity: "high",
      affectedSystems: ["Customer Database"],
      discoveredAt: getRecentTimestamp(13, 16),
      cvss: 7.5
    }
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
  const incidents = [
    {
      id: "IND-INC-001",
      name: "OT Network Intrusion Attempt",
      description: "Attempted intrusion into operational technology network from corporate network",
      status: "investigating",
      severity: "critical",
      affectedSystems: ["OT Network Gateway"],
      detectedAt: getRecentTimestamp(0, 15),
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
      detectedAt: getRecentTimestamp(1, 20),
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
      detectedAt: getRecentTimestamp(1, 25),
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
      detectedAt: getRecentTimestamp(1, 30),
      assignedTo: "Jennifer Lopez",
      source: "Microsoft Defender"
    },
  ];

  const vulnerabilities = [
    {
      id: "IND-VUL-001",
      name: "PLC Firmware Vulnerability",
      description: "Critical vulnerability in PLC firmware allowing remote code execution",
      status: "new",
      severity: "critical",
      affectedSystems: ["Manufacturing PLCs"],
      discoveredAt: getRecentTimestamp(2, 14),
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
      discoveredAt: getRecentTimestamp(3, 16),
      cvss: 8.7
    },
    {
      id: "IND-VUL-003",
      name: "Unpatched ERP System",
      description: "Critical security patches missing from ERP system",
      status: "in progress",
      severity: "high",
      affectedSystems: ["SAP ERP"],
      discoveredAt: getRecentTimestamp(4, 30),
      cvss: 7.8
    },
    {
      id: "IND-VUL-004",
      name: "Insecure Remote Access Solution",
      description: "VPN solution with known security vulnerabilities",
      status: "in progress",
      severity: "high",
      affectedSystems: ["Remote Access Infrastructure"],
      discoveredAt: getRecentTimestamp(5, 13),
      cvss: 7.4
    },
    {
      id: "IND-VUL-005",
      name: "Outdated HMI Software",
      description: "Human-Machine Interface software running outdated version with multiple vulnerabilities",
      status: "new",
      severity: "medium",
      affectedSystems: ["Plant HMI Controllers"],
      discoveredAt: getRecentTimestamp(6, 11),
      cvss: 6.2
    },
    {
      id: "IND-VUL-006",
      name: "OT Network Segmentation Bypass",
      description: "Vulnerability allowing bypass of OT network segmentation",
      status: "new",
      severity: "critical",
      affectedSystems: ["Industrial Firewalls", "OT Network"],
      discoveredAt: getRecentTimestamp(7, 10),
      cvss: 9.8,
      cve: "CVE-2023-7865"
    },
    {
      id: "IND-VUL-007",
      name: "Siemens S7 PLC Vulnerability",
      description: "Authentication bypass vulnerability in Siemens S7 PLCs",
      status: "in progress",
      severity: "high",
      affectedSystems: ["Production Line PLCs"],
      discoveredAt: getRecentTimestamp(8, 15),
      cvss: 8.4,
      cve: "CVE-2023-6543"
    },
    {
      id: "IND-VUL-008",
      name: "Insecure Modbus Protocol",
      description: "Insecure implementation of Modbus protocol",
      status: "new",
      severity: "high",
      affectedSystems: ["Factory Automation Systems"],
      discoveredAt: getRecentTimestamp(9, 14),
      cvss: 7.9
    },
    {
      id: "IND-VUL-009",
      name: "Default Credentials on IoT Devices",
      description: "IoT sensors using default credentials",
      status: "in progress",
      severity: "medium",
      affectedSystems: ["Environmental Sensors", "IoT Gateway"],
      discoveredAt: getRecentTimestamp(10, 11),
      cvss: 6.5
    },
    {
      id: "IND-VUL-010",
      name: "Exposed OPC Server",
      description: "OPC server accessible from corporate network",
      status: "new",
      severity: "high",
      affectedSystems: ["OPC Server Infrastructure"],
      discoveredAt: getRecentTimestamp(11, 10),
      cvss: 8.1
    },
    {
      id: "IND-VUL-011",
      name: "Outdated Firmware on Embedded Devices",
      description: "Multiple embedded devices running outdated firmware",
      status: "accepted",
      severity: "low",
      affectedSystems: ["Packaging Line Controllers"],
      discoveredAt: getRecentTimestamp(12, 16),
      cvss: 4.2
    },
    {
      id: "IND-VUL-012",
      name: "Missing Encryption in MQTT",
      description: "MQTT communication not using TLS encryption",
      status: "new",
      severity: "medium",
      affectedSystems: ["IoT Messaging Infrastructure"],
      discoveredAt: getRecentTimestamp(13, 13),
      cvss: 5.9
    },
    {
      id: "IND-VUL-013",
      name: "Unpatched Windows Embedded Systems",
      description: "Control systems running unpatched Windows Embedded",
      status: "in progress",
      severity: "medium",
      affectedSystems: ["Process Control Systems"],
      discoveredAt: getRecentTimestamp(14, 11),
      cvss: 6.7
    },
    {
      id: "IND-VUL-014",
      name: "Weak Remote Maintenance Access",
      description: "Vendor remote access with inadequate security controls",
      status: "new",
      severity: "low",
      affectedSystems: ["Vendor Access Gateways"],
      discoveredAt: getRecentTimestamp(15, 10),
      cvss: 3.9
    }
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
