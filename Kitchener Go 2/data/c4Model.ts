import { Node, Edge } from 'reactflow'

export interface C4NodeData {
  label: string
  description?: string
  type: 'person' | 'system' | 'container' | 'component' | 'boundary' | 'decision'
  technology?: string
  responsibilities?: string[]
  relationships?: string[]
  drillDownTo?: string
  parentView?: string
  details?: {
    overview?: string
    dataStored?: string[]
    team?: string
    validations?: string[]
    notes?: string[]
  }
}

export type C4ViewLevel = 'context' | 'container' | 'component' | 'code'

export interface C4View {
  id: string
  level: C4ViewLevel
  title: string
  nodes: Node<C4NodeData>[]
  edges: Edge[]
  parentViewId?: string
}

export const contextView: C4View = {
  id: 'context',
  level: 'context',
  title: 'System Context',
  nodes: [
    {
      id: 'client',
      type: 'personNode',
      position: { x: 100, y: 400 },
      data: {
        label: 'Client',
        type: 'person',
        description: 'Prospective wealth management client',
        drillDownTo: 'container-client-entry',
        responsibilities: [
          'Chooses investment path (self-directed or advisory)',
          'Provides personal and financial information',
          'Completes onboarding application',
          'Signs required documents'
        ],
        details: {
          overview: 'Entry point for all wealth management clients. Can choose between self-directed (iTrade) or advisory (McLeod, PIC, MD, Private Banking, Trust).',
          team: 'External User'
        }
      }
    },
    {
      id: 'onboarding-system',
      type: 'systemNode',
      position: { x: 500, y: 400 },
      data: {
        label: 'Onboarding System',
        type: 'system',
        description: 'Multi-channel onboarding platform',
        technology: 'ICON, WealthOne (Pega), Various UIs',
        drillDownTo: 'container-onboarding-channels',
        responsibilities: [
          'Routes clients to appropriate channel',
          'Captures client information',
          'Manages approval workflows',
          'Coordinates with backend systems',
          'Handles iTrade, McLeod, PIC, MD, Private Banking, Trust'
        ],
        relationships: [
          'Sends client data to KYC/Party Master',
          'Stores account info in Broadridge/Empower',
          'Triggers AML checks',
          'Routes to operations teams'
        ],
        details: {
          overview: 'Central onboarding system managing multiple business lines with different workflows and validation requirements.',
          team: 'Wealth Technology'
        }
      }
    },
    {
      id: 'data-stores',
      type: 'systemNode',
      position: { x: 950, y: 250 },
      data: {
        label: 'Books of Record',
        type: 'system',
        description: 'Client and account data storage',
        technology: 'KYC, CIS, Broadridge, Party Master, Empower',
        drillDownTo: 'container-data-stores',
        responsibilities: [
          'KYC: Client profiles (iTrade/McLeod)',
          'CIS: Retail banking data',
          'Broadridge 061: Account records (iTrade/McLeod)',
          'Party Master: PIC client data',
          'Empower: PIC account/custody',
          'Banking DB: Funding information'
        ],
        relationships: [
          'Receives data from onboarding systems',
          'Provides prefill data for existing clients',
          'Feeds AML batch processing',
          'Manages consent to share between retail and wealth'
        ],
        details: {
          overview: 'Multiple books of record storing client and account information across different business lines.',
          dataStored: ['Client profiles', 'Account details', 'Banking info', 'Transaction history', 'Custody records'],
          team: 'Data Management'
        }
      }
    },
    {
      id: 'compliance-system',
      type: 'systemNode',
      position: { x: 950, y: 550 },
      data: {
        label: 'Compliance & AML',
        type: 'system',
        description: 'Risk assessment and identity verification',
        technology: 'AML Team, Credit Bureaus, HRFA, Identity Verification',
        drillDownTo: 'container-compliance',
        responsibilities: [
          'Overnight batch processing from account books',
          'AML compliance checks',
          'Identity verification',
          'Credit bureau validation (iTrade only)',
          'HRFA risk flagging (Low/Medium/High)',
          'Remediation for failed checks'
        ],
        relationships: [
          'Receives batch files from Broadridge/Empower',
          'Validates against credit bureaus',
          'Flags suspicious activity',
          'Triggers outbound contact for clarifications'
        ],
        details: {
          overview: 'Downstream compliance system performing batch validation, AML checks, and identity verification.',
          team: 'AML & Compliance',
          validations: ['AML screening', 'Identity verification', 'Credit history', 'Risk assessment']
        }
      }
    },
    {
      id: 'operations',
      type: 'systemNode',
      position: { x: 500, y: 650 },
      data: {
        label: 'Operations Teams',
        type: 'system',
        description: 'Manual review and approval',
        technology: 'iTrade Ops, Wealth Ops',
        drillDownTo: 'container-operations',
        responsibilities: [
          'Account approvers (client + account details)',
          'Document reviewers (ID, forms, W-9)',
          'Options approvers (knowledge + experience)',
          'Outbound users (contact for clarifications)',
          'NIGO remediation'
        ],
        details: {
          overview: 'Operations teams handling manual review, approval, and client contact across business lines.',
          team: 'Operations'
        }
      }
    }
  ],
  edges: [

    {
      id: 'e-client-onboarding',
      source: 'client',
      target: 'onboarding-system',
      label: 'Submits application',
      type: 'smoothstep',
      animated: true
    },
    {
      id: 'e-onboarding-data',
      source: 'onboarding-system',
      target: 'data-stores',
      label: 'Stores client & account data',
      type: 'smoothstep'
    },
    {
      id: 'e-onboarding-ops',
      source: 'onboarding-system',
      target: 'operations',
      label: 'Routes for approval',
      type: 'smoothstep'
    },
    {
      id: 'e-data-compliance',
      source: 'data-stores',
      target: 'compliance-system',
      label: 'Batch files (overnight)',
      type: 'smoothstep'
    },
    {
      id: 'e-compliance-ops',
      source: 'compliance-system',
      target: 'operations',
      label: 'Flags for remediation',
      type: 'smoothstep'
    }
  ]
}

export const containerOnboardingChannels: C4View = {
  id: 'container-onboarding-channels',
  level: 'container',
  title: 'Onboarding Channels',
  parentViewId: 'context',
  nodes: [
    {
      id: 'client-entry',
      type: 'personNode',
      position: { x: 50, y: 400 },
      data: {
        label: 'Client',
        type: 'person',
        description: 'Chooses channel',
        drillDownTo: 'component-client-routing'
      }
    },
    {
      id: 'self-directed',
      type: 'containerNode',
      position: { x: 300, y: 200 },
      data: {
        label: 'Self-Directed (iTrade)',
        type: 'container',
        description: 'ICON application',
        technology: 'ICON UI',
        drillDownTo: 'component-itrade-intake',
        responsibilities: [
          'All data input in ICON',
          'Residency check (Canadian only)',
          'W-9 for US citizens in Canada',
          'Individual or Joint accounts',
          'Registered (individual only) or Non-registered',
          'Options knowledge assessment'
        ]
      }
    },
    {
      id: 'mcleod',
      type: 'containerNode',
      position: { x: 300, y: 400 },
      data: {
        label: 'McLeod (Advisory)',
        type: 'container',
        description: 'WealthOne McLeod',
        technology: 'Pega',
        drillDownTo: 'component-mcleod-advisory',
        responsibilities: [
          'Risk tolerance assessment',
          'Portfolio recommendations',
          'No TransUnion credit check',
          'Discretionary/non-discretionary'
        ]
      }
    },
    {
      id: 'pic-sjf',
      type: 'containerNode',
      position: { x: 300, y: 550 },
      data: {
        label: 'PIC / SJF',
        type: 'container',
        description: 'Institutional advisory',
        technology: 'PIC WealthOne / Separate workflow',
        drillDownTo: 'component-pic-onboarding',
        responsibilities: [
          'Institutional clients',
          'US clients allowed',
          'External custody options',
          'Party Master + Empower'
        ]
      }
    },
    {
      id: 'md',
      type: 'containerNode',
      position: { x: 550, y: 250 },
      data: {
        label: 'MD Financial',
        type: 'container',
        description: 'Doctor-focused',
        technology: 'Separate MD systems',
        responsibilities: [
          'Doctors only',
          'Corporation accounts',
          'Tax-advantaged structures',
          'Separate architecture'
        ],
        details: {
          notes: ['MD has completely separate systems and processes']
        }
      }
    },
    {
      id: 'private-banking',
      type: 'containerNode',
      position: { x: 550, y: 400 },
      data: {
        label: 'Private Banking',
        type: 'container',
        description: 'Complex lending',
        technology: 'Private Banking systems',
        responsibilities: [
          'High net worth',
          'Complex collateral needs',
          'Large loans against equity',
          'Specialized financial situations'
        ],
        details: {
          notes: ['For very rich clients with unusual financial needs']
        }
      }
    },
    {
      id: 'trust',
      type: 'containerNode',
      position: { x: 550, y: 550 },
      data: {
        label: 'Scotia Trust',
        type: 'container',
        description: 'Custody & executor services',
        technology: 'Trust systems',
        responsibilities: [
          'Holding assets (not investing advice)',
          'Executor of wills',
          'Estate management',
          'Custody for PIC accounts'
        ],
        details: {
          notes: ['Trust holds assets, does not provide day-to-day investment advice']
        }
      }
    }
  ],
  edges: [
    {
      id: 'e-client-sd',
      source: 'client-entry',
      target: 'self-directed',
      label: 'Self-directed',
      type: 'smoothstep',
      animated: true
    },
    {
      id: 'e-client-mcleod',
      source: 'client-entry',
      target: 'mcleod',
      label: 'Advisory',
      type: 'smoothstep'
    },
    {
      id: 'e-client-pic',
      source: 'client-entry',
      target: 'pic-sjf',
      label: 'Institutional',
      type: 'smoothstep'
    },
    {
      id: 'e-client-md',
      source: 'client-entry',
      target: 'md',
      label: 'Doctor',
      type: 'smoothstep'
    },
    {
      id: 'e-client-pb',
      source: 'client-entry',
      target: 'private-banking',
      label: 'Complex needs',
      type: 'smoothstep'
    },
    {
      id: 'e-client-trust',
      source: 'client-entry',
      target: 'trust',
      label: 'Custody/Estate',
      type: 'smoothstep'
    }
  ]
}

export const allViews: Record<string, C4View> = {
  'context': contextView,
  'container-onboarding-channels': containerOnboardingChannels
}
