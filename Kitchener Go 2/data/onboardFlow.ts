import { Node, Edge } from 'reactflow'

export interface NodeData {
  label: string
  description?: string
  type: 'process' | 'decision' | 'system' | 'connector' | 'start' | 'approver' | 'endpoint'
  details?: {
    overview?: string
    systems?: string[]
    documentation?: string[]
    team?: string
  }
}

export const onboardFlowNodes: Node<NodeData>[] = [
  {
    id: 'client',
    type: 'processNode',
    position: { x: 50, y: 400 },
    data: {
      label: 'Client',
      type: 'start',
      description: 'Entry point for all clients',
      details: {
        overview: 'The client is the starting point of the onboarding journey. All account applications begin here.',
        systems: ['Client Portal', 'Mobile App', 'Branch'],
        team: 'Client Services'
      }
    }
  },
  
  {
    id: 'self-directed',
    type: 'processNode',
    position: { x: 180, y: 320 },
    data: {
      label: 'Self-Directed',
      type: 'process',
      description: 'Self-directed investment path',
      details: {
        overview: 'Clients who prefer to manage their own investments without advisor assistance.',
        systems: ['iTrade Platform'],
        team: 'Self-Directed Operations'
      }
    }
  },
  {
    id: 'advice-led',
    type: 'processNode',
    position: { x: 180, y: 480 },
    data: {
      label: 'Advice - Led',
      type: 'process',
      description: 'Advisor-led investment path',
      details: {
        overview: 'Clients who prefer professional guidance for their investments.',
        systems: ['Advisor Platform', 'Wealth Management'],
        team: 'Wealth Advisory'
      }
    }
  },
  
  {
    id: 'itrade',
    type: 'processNode',
    position: { x: 320, y: 320 },
    data: {
      label: 'iTrade',
      type: 'system',
      description: 'Scotia iTrade platform',
      details: {
        overview: 'Scotia iTRADE is the self-directed brokerage platform for Scotiabank.',
        systems: ['iTRADE Portal', 'Trading Engine'],
        documentation: ['iTRADE User Guide', 'Trading Rules'],
        team: 'iTRADE Operations'
      }
    }
  },
  
  {
    id: 'mainstream',
    type: 'processNode',
    position: { x: 320, y: 450 },
    data: {
      label: 'Mainstream',
      type: 'connector',
      description: 'Standard advisory services'
    }
  },
  {
    id: 'high-need',
    type: 'processNode',
    position: { x: 320, y: 520 },
    data: {
      label: 'High Need',
      type: 'connector',
      description: 'Premium advisory services'
    }
  },
  
  {
    id: 'itrade-ops',
    type: 'processNode',
    position: { x: 320, y: 100 },
    data: {
      label: 'iTrade Operations Team',
      type: 'process',
      description: 'Operations team handling iTrade accounts',
      details: {
        overview: 'Dedicated team managing iTrade account operations and approvals.',
        team: 'iTRADE Operations'
      }
    }
  },
  {
    id: 'wealth-one',
    type: 'processNode',
    position: { x: 320, y: 30 },
    data: {
      label: 'Wealth One',
      type: 'system',
      description: 'Wealth One platform',
      details: {
        overview: 'Internal wealth management platform used by operations team.',
        systems: ['Wealth One Portal']
      }
    }
  },
  
  {
    id: 'account-approvers',
    type: 'processNode',
    position: { x: 480, y: 30 },
    data: {
      label: 'Account Approvers',
      type: 'approver',
      description: 'Account approval team'
    }
  },
  {
    id: 'document-approvers',
    type: 'processNode',
    position: { x: 480, y: 80 },
    data: {
      label: 'Document Approvers',
      type: 'approver',
      description: 'Document verification team'
    }
  },
  {
    id: 'option-approvers',
    type: 'processNode',
    position: { x: 480, y: 130 },
    data: {
      label: 'Option Approvers',
      type: 'approver',
      description: 'Options trading approval team'
    }
  },
  {
    id: 'outbound-approvers',
    type: 'processNode',
    position: { x: 480, y: 180 },
    data: {
      label: 'Outbound Approvers',
      type: 'approver',
      description: 'Outbound communication approvers'
    }
  },
  
  {
    id: 'joint-account',
    type: 'processNode',
    position: { x: 450, y: 260 },
    data: {
      label: 'Joint Account',
      type: 'process',
      description: 'Joint account type',
      details: {
        overview: 'Account shared between two or more individuals.',
        documentation: ['Joint Account Agreement']
      }
    }
  },
  {
    id: 'individual-account',
    type: 'processNode',
    position: { x: 450, y: 380 },
    data: {
      label: 'Individual Account',
      type: 'process',
      description: 'Individual account type',
      details: {
        overview: 'Account held by a single individual.',
        documentation: ['Individual Account Agreement']
      }
    }
  },
  
  {
    id: 'cash-account',
    type: 'processNode',
    position: { x: 580, y: 230 },
    data: {
      label: 'Cash Account',
      type: 'connector',
      description: 'Cash-only trading account'
    }
  },
  {
    id: 'margin-account',
    type: 'processNode',
    position: { x: 580, y: 290 },
    data: {
      label: 'Margin Account',
      type: 'connector',
      description: 'Margin trading enabled',
      details: {
        overview: 'Account that allows borrowing against securities for trading.',
        documentation: ['Margin Agreement', 'Risk Disclosure']
      }
    }
  },
  {
    id: 'non-registered',
    type: 'processNode',
    position: { x: 580, y: 350 },
    data: {
      label: 'Non Registered Accounts',
      type: 'connector',
      description: 'Non-registered investment accounts'
    }
  },
  {
    id: 'registered',
    type: 'processNode',
    position: { x: 580, y: 420 },
    data: {
      label: 'Registered Accounts',
      type: 'connector',
      description: 'RRSP, TFSA, RESP, etc.',
      details: {
        overview: 'Tax-advantaged registered accounts including RRSP, TFSA, RESP, and others.',
        documentation: ['Registered Account Terms', 'Tax Forms']
      }
    }
  },
  
  {
    id: 'options-margin',
    type: 'processNode',
    position: { x: 680, y: 290 },
    data: {
      label: 'Options',
      type: 'connector',
      description: 'Options trading enabled'
    }
  },
  {
    id: 'no-options-margin',
    type: 'processNode',
    position: { x: 680, y: 320 },
    data: {
      label: 'No Options',
      type: 'connector',
      description: 'No options trading'
    }
  },
  {
    id: 'options-non-reg',
    type: 'processNode',
    position: { x: 680, y: 350 },
    data: {
      label: 'Options',
      type: 'connector',
      description: 'Options trading enabled'
    }
  },
  {
    id: 'no-options-non-reg',
    type: 'processNode',
    position: { x: 680, y: 380 },
    data: {
      label: 'No Options',
      type: 'connector',
      description: 'No options trading'
    }
  },
  {
    id: 'options-registered',
    type: 'processNode',
    position: { x: 680, y: 420 },
    data: {
      label: 'Options',
      type: 'connector',
      description: 'Options trading enabled'
    }
  },
  {
    id: 'no-options-registered',
    type: 'processNode',
    position: { x: 680, y: 450 },
    data: {
      label: 'No Options',
      type: 'connector',
      description: 'No options trading'
    }
  },
  
  {
    id: 'cms',
    type: 'processNode',
    position: { x: 880, y: 80 },
    data: {
      label: 'Content Management System (Box.com)',
      type: 'system',
      description: 'Document storage and management',
      details: {
        overview: 'Box.com is used for secure document storage and content management.',
        systems: ['Box.com', 'Document Vault']
      }
    }
  },
  
  {
    id: 'identity-info',
    type: 'processNode',
    position: { x: 780, y: 320 },
    data: {
      label: 'Identity Information',
      type: 'process',
      description: 'Client identity collection',
      details: {
        overview: 'Collection of personal identification information including name, address, and contact details.',
        documentation: ['KYC Requirements', 'Identity Verification Guide']
      }
    }
  },
  {
    id: 'identity-docs',
    type: 'processNode',
    position: { x: 900, y: 320 },
    data: {
      label: 'Identity Documents',
      type: 'process',
      description: 'Document verification',
      details: {
        overview: 'Verification of identity documents such as passport, drivers license, or government ID.',
        systems: ['Document Verification System'],
        documentation: ['Acceptable ID List']
      }
    }
  },
  {
    id: 'regulatory-info',
    type: 'processNode',
    position: { x: 1020, y: 320 },
    data: {
      label: 'Regulatory Information',
      type: 'process',
      description: 'Regulatory compliance data',
      details: {
        overview: 'Collection of regulatory required information including tax status, employment, and investment knowledge.',
        documentation: ['Regulatory Requirements', 'Compliance Checklist']
      }
    }
  },
  
  {
    id: 'canada-post',
    type: 'processNode',
    position: { x: 780, y: 250 },
    data: {
      label: 'CanadaPost',
      type: 'system',
      description: 'Address verification service',
      details: {
        overview: 'Canada Post address verification integration for validating client addresses.',
        systems: ['Canada Post API']
      }
    }
  },
  {
    id: 'address',
    type: 'processNode',
    position: { x: 780, y: 280 },
    data: {
      label: 'Address',
      type: 'connector',
      description: 'Address information'
    }
  },
  
  {
    id: 'itrade-investment',
    type: 'processNode',
    position: { x: 1140, y: 320 },
    data: {
      label: 'iTrade Investment Account Info',
      type: 'process',
      description: 'Investment preferences and account details',
      details: {
        overview: 'Collection of investment objectives, risk tolerance, and account preferences.',
        documentation: ['Investment Profile Questionnaire']
      }
    }
  },
  {
    id: 'submit-application',
    type: 'processNode',
    position: { x: 1260, y: 320 },
    data: {
      label: 'Submit Application',
      type: 'process',
      description: 'Final application submission',
      details: {
        overview: 'Final review and submission of the complete account application.',
        systems: ['Application Processing System']
      }
    }
  },
  
  {
    id: 'data-validation',
    type: 'decisionNode',
    position: { x: 1380, y: 300 },
    data: {
      label: 'Data Validation Pass/Fail',
      type: 'decision',
      description: 'Automated validation check',
      details: {
        overview: 'Automated validation of all submitted information against regulatory and business rules.',
        systems: ['Validation Engine', 'Rules Engine']
      }
    }
  },
  
  {
    id: 'pass',
    type: 'processNode',
    position: { x: 1520, y: 320 },
    data: {
      label: 'PASS',
      type: 'endpoint',
      description: 'Application approved',
      details: {
        overview: 'Application has passed all validation checks and is approved for processing.'
      }
    }
  },
  {
    id: 'outbound-contact',
    type: 'processNode',
    position: { x: 1480, y: 180 },
    data: {
      label: 'Outbound user must contact applicant',
      type: 'endpoint',
      description: 'Manual follow-up required',
      details: {
        overview: 'Application requires manual review. Outbound team member must contact the applicant to resolve issues.',
        team: 'Outbound Operations'
      }
    }
  },
  
  {
    id: 'kyc-badge',
    type: 'systemNode',
    position: { x: 1100, y: 80 },
    data: {
      label: 'KYC',
      type: 'system',
      description: 'Know Your Customer system',
      details: {
        overview: 'Know Your Customer (KYC) compliance system for identity verification and risk assessment.',
        systems: ['KYC Platform', 'Risk Scoring Engine']
      }
    }
  },
  {
    id: 'cis-badge',
    type: 'systemNode',
    position: { x: 1200, y: 80 },
    data: {
      label: 'CIS',
      type: 'system',
      description: 'Customer Information System',
      details: {
        overview: 'Central Customer Information System containing all client data and relationships.',
        systems: ['CIS Database', 'Client 360']
      }
    }
  },
]

export const onboardFlowEdges: Edge[] = [
  { id: 'e-client-self', source: 'client', target: 'self-directed', animated: true, type: 'smoothstep' },
  { id: 'e-client-advice', source: 'client', target: 'advice-led', animated: true, type: 'smoothstep' },
  
  { id: 'e-self-itrade', source: 'self-directed', target: 'itrade', label: 'WORKS ON', type: 'smoothstep' },
  
  { id: 'e-advice-mainstream', source: 'advice-led', target: 'mainstream', type: 'smoothstep' },
  { id: 'e-advice-high', source: 'advice-led', target: 'high-need', type: 'smoothstep' },
  
  { id: 'e-itrade-ops', source: 'itrade', target: 'itrade-ops', type: 'smoothstep' },
  { id: 'e-ops-wealth', source: 'itrade-ops', target: 'wealth-one', label: 'USES', type: 'smoothstep' },
  
  { id: 'e-ops-acc-app', source: 'itrade-ops', target: 'account-approvers', label: 'HAS', type: 'smoothstep' },
  { id: 'e-ops-doc-app', source: 'itrade-ops', target: 'document-approvers', type: 'smoothstep' },
  { id: 'e-ops-opt-app', source: 'itrade-ops', target: 'option-approvers', type: 'smoothstep' },
  { id: 'e-ops-out-app', source: 'itrade-ops', target: 'outbound-approvers', type: 'smoothstep' },
  
  { id: 'e-acc-cms', source: 'account-approvers', target: 'cms', label: 'APPROVES', type: 'smoothstep' },
  { id: 'e-doc-cms', source: 'document-approvers', target: 'cms', label: 'APPROVES', type: 'smoothstep' },
  { id: 'e-opt-cms', source: 'option-approvers', target: 'cms', label: 'APPROVES', type: 'smoothstep' },
  { id: 'e-out-cms', source: 'outbound-approvers', target: 'cms', label: 'APPROVES', type: 'smoothstep' },
  
  { id: 'e-itrade-joint', source: 'itrade', target: 'joint-account', label: 'SELECTS', type: 'smoothstep' },
  { id: 'e-itrade-individual', source: 'itrade', target: 'individual-account', type: 'smoothstep' },
  
  { id: 'e-joint-cash', source: 'joint-account', target: 'cash-account', label: 'OR', type: 'smoothstep' },
  { id: 'e-joint-margin', source: 'joint-account', target: 'margin-account', type: 'smoothstep' },
  
  { id: 'e-individual-nonreg', source: 'individual-account', target: 'non-registered', label: 'AND/OR', type: 'smoothstep' },
  { id: 'e-individual-reg', source: 'individual-account', target: 'registered', type: 'smoothstep' },
  
  { id: 'e-margin-opt', source: 'margin-account', target: 'options-margin', label: 'Options', type: 'smoothstep' },
  { id: 'e-margin-noopt', source: 'margin-account', target: 'no-options-margin', label: 'No Options', type: 'smoothstep' },
  { id: 'e-nonreg-opt', source: 'non-registered', target: 'options-non-reg', label: 'Options', type: 'smoothstep' },
  { id: 'e-nonreg-noopt', source: 'non-registered', target: 'no-options-non-reg', label: 'No Options', type: 'smoothstep' },
  { id: 'e-reg-opt', source: 'registered', target: 'options-registered', label: 'Options', type: 'smoothstep' },
  { id: 'e-reg-noopt', source: 'registered', target: 'no-options-registered', label: 'No Options', type: 'smoothstep' },
  
  { id: 'e-opt-margin-id', source: 'options-margin', target: 'identity-info', type: 'smoothstep' },
  { id: 'e-noopt-margin-id', source: 'no-options-margin', target: 'identity-info', type: 'smoothstep' },
  { id: 'e-opt-nonreg-id', source: 'options-non-reg', target: 'identity-info', type: 'smoothstep' },
  { id: 'e-noopt-nonreg-id', source: 'no-options-non-reg', target: 'identity-info', type: 'smoothstep' },
  { id: 'e-opt-reg-id', source: 'options-registered', target: 'identity-info', type: 'smoothstep' },
  { id: 'e-noopt-reg-id', source: 'no-options-registered', target: 'identity-info', type: 'smoothstep' },
  
  { id: 'e-canada-addr', source: 'canada-post', target: 'address', type: 'smoothstep' },
  { id: 'e-addr-id', source: 'address', target: 'identity-info', label: 'Address', type: 'smoothstep' },
  
  { id: 'e-id-docs', source: 'identity-info', target: 'identity-docs', type: 'smoothstep' },
  { id: 'e-docs-reg', source: 'identity-docs', target: 'regulatory-info', type: 'smoothstep' },
  { id: 'e-reg-invest', source: 'regulatory-info', target: 'itrade-investment', type: 'smoothstep' },
  { id: 'e-invest-submit', source: 'itrade-investment', target: 'submit-application', type: 'smoothstep' },
  { id: 'e-submit-valid', source: 'submit-application', target: 'data-validation', type: 'smoothstep' },
  
  { id: 'e-valid-pass', source: 'data-validation', target: 'pass', label: 'PASS', type: 'smoothstep' },
  { id: 'e-valid-fail', source: 'data-validation', target: 'outbound-contact', label: 'FAIL', type: 'smoothstep' },
  
  { id: 'e-id-cms', source: 'identity-docs', target: 'cms', label: 'GOES TO', type: 'smoothstep', style: { strokeDasharray: '5,5' } },
]

