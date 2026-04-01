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
  title: 'Wealth Management Onboarding - System Context',
  nodes: [
    {
      id: 'client',
      type: 'personNode',
      position: { x: 50, y: 350 },
      data: {
        label: 'Client',
        type: 'person',
        description: 'Wealth management client',
        responsibilities: [
          'Chooses investment path',
          'Provides information',
          'Signs documents'
        ],
        details: {
          overview: 'External user who initiates the onboarding process. Can be individual or joint account holder, Canadian resident required for iTrade.',
          team: 'External User'
        }
      }
    },
    {
      id: 'onboarding',
      type: 'systemNode',
      position: { x: 400, y: 350 },
      data: {
        label: 'Onboarding System',
        type: 'system',
        description: 'Multi-channel platform',
        technology: 'ICON, WealthOne, Various',
        drillDownTo: 'container-channels',
        responsibilities: [
          'Routes to channels',
          'Captures data',
          'Manages workflows'
        ]
      }
    },
    {
      id: 'data-stores',
      type: 'systemNode',
      position: { x: 800, y: 150 },
      data: {
        label: 'Books of Record',
        type: 'system',
        description: 'Data storage',
        technology: 'KYC, CIS, Broadridge, Party Master, Empower',
        drillDownTo: 'container-data',
        responsibilities: [
          'KYC: Client profiles',
          'Broadridge: Accounts',
          'Party Master: PIC clients',
          'Empower: PIC custody'
        ]
      }
    },
    {
      id: 'compliance',
      type: 'systemNode',
      position: { x: 800, y: 550 },
      data: {
        label: 'Compliance & AML',
        type: 'system',
        description: 'Risk & validation',
        technology: 'AML, Credit Bureaus, HRFA',
        drillDownTo: 'container-compliance',
        responsibilities: [
          'Batch processing',
          'AML checks',
          'Identity verification',
          'Risk flagging'
        ]
      }
    },
    {
      id: 'operations',
      type: 'systemNode',
      position: { x: 400, y: 650 },
      data: {
        label: 'Operations',
        type: 'system',
        description: 'Manual review',
        technology: 'iTrade Ops, Wealth Ops',
        drillDownTo: 'container-operations',
        responsibilities: [
          'Account approval',
          'Document review',
          'Options approval',
          'Outbound contact'
        ]
      }
    },
    {
      id: 'client-experience',
      type: 'systemNode',
      position: { x: 50, y: 650 },
      data: {
        label: 'Client Experience',
        type: 'system',
        description: 'Post-onboarding platforms',
        technology: 'NEO, ORION, Marvel, Prodigy',
        drillDownTo: 'container-client-experience',
        responsibilities: [
          'NEO: Wealth management UI',
          'ORION: Banking UI',
          'Trading & account management',
          'Money movement'
        ]
      }
    },
    {
      id: 'trading-settlement',
      type: 'systemNode',
      position: { x: 50, y: 850 },
      data: {
        label: 'Trading & Settlement',
        type: 'system',
        description: 'Order execution & settlement',
        technology: 'Wealth OMS, Charles River, INTACT, Broadridge',
        drillDownTo: 'container-trading',
        responsibilities: [
          'Order routing & execution',
          'Trade settlement',
          'Market connectivity',
          'Reconciliation'
        ]
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'client', target: 'onboarding', label: 'Applies', type: 'smoothstep', animated: true },
    { id: 'e2', source: 'onboarding', target: 'data-stores', label: 'Stores data', type: 'smoothstep' },
    { id: 'e3', source: 'onboarding', target: 'operations', label: 'Routes for approval', type: 'smoothstep' },
    { id: 'e4', source: 'data-stores', target: 'compliance', label: 'Batch files', type: 'smoothstep' },
    { id: 'e5', source: 'compliance', target: 'operations', label: 'Flags issues', type: 'smoothstep' },
    { id: 'e6', source: 'operations', target: 'client-experience', label: 'Activates account', type: 'smoothstep', animated: true },
    { id: 'e7', source: 'client-experience', target: 'trading-settlement', label: 'Places orders', type: 'smoothstep', animated: true },
    { id: 'e8', source: 'trading-settlement', target: 'data-stores', label: 'Updates positions', type: 'smoothstep' }
  ]
}

export const containerChannels: C4View = {
  id: 'container-channels',
  level: 'container',
  title: 'Onboarding Channels',
  parentViewId: 'context',
  nodes: [
    {
      id: 'client-c',
      type: 'personNode',
      position: { x: 50, y: 350 },
      data: { label: 'Client', type: 'person', description: 'Chooses channel' }
    },
    {
      id: 'itrade',
      type: 'containerNode',
      position: { x: 450, y: 50 },
      data: {
        label: 'iTrade (Self-Directed)',
        type: 'container',
        technology: 'ICON + iTrade WealthOne',
        drillDownTo: 'component-itrade',
        responsibilities: [
          'ICON: All data input',
          'Residency check (Canadian only)',
          'W-9 for US citizens',
          'Individual/Joint accounts',
          'Registered (individual only) or Non-reg',
          'Options knowledge assessment',
          'TransUnion credit check'
        ]
      }
    },
    {
      id: 'mcleod',
      type: 'containerNode',
      position: { x: 450, y: 280 },
      data: {
        label: 'McLeod (Advisory)',
        type: 'container',
        technology: 'McLeod WealthOne (Pega)',
        drillDownTo: 'component-mcleod',
        responsibilities: [
          'Risk tolerance assessment',
          'Portfolio recommendations',
          'NO TransUnion check',
          'Discretionary/non-discretionary'
        ]
      }
    },
    {
      id: 'pic',
      type: 'containerNode',
      position: { x: 450, y: 510 },
      data: {
        label: 'PIC / SJF',
        type: 'container',
        technology: 'PIC WealthOne',
        drillDownTo: 'component-pic',
        responsibilities: [
          'Institutional clients',
          'US clients allowed',
          'External custody',
          'Party Master + Empower'
        ]
      }
    },
    {
      id: 'md',
      type: 'containerNode',
      position: { x: 950, y: 80 },
      data: {
        label: 'MD Financial',
        type: 'container',
        technology: 'Separate MD systems',
        responsibilities: ['Doctors only', 'Corp accounts', 'Separate architecture'],
        details: { notes: ['Completely separate systems'] }
      }
    },
    {
      id: 'pb',
      type: 'containerNode',
      position: { x: 950, y: 310 },
      data: {
        label: 'Private Banking',
        type: 'container',
        technology: 'Private Banking systems',
        responsibilities: ['Complex lending', 'Large loans', 'Collateral needs'],
        details: { notes: ['For very rich clients with unusual needs'] }
      }
    },
    {
      id: 'trust',
      type: 'containerNode',
      position: { x: 950, y: 540 },
      data: {
        label: 'Scotia Trust',
        type: 'container',
        technology: 'Trust systems',
        responsibilities: ['Custody (not advice)', 'Executor', 'Estate management'],
        details: { notes: ['Holds assets, no day-to-day investment advice'] }
      }
    },
    {
      id: 'neo-onboard',
      type: 'containerNode',
      position: { x: 1400, y: 280 },
      data: {
        label: 'First Time User Flow',
        type: 'container',
        technology: 'Web Application + Scotiabank Login',
        drillDownTo: 'component-neo-onboarding',
        responsibilities: [
          'Triggered when existing client logs into Scotia Online',
          'Login with FTUF authentication',
          'Online brokerage agreements',
          'Email update',
          'Access code setup',
          'Quote selection',
          'Exchange agreements'
        ],
        details: { notes: ['Part of onboarding process, accessible before full account activation'] }
      }
    }
  ],
  edges: [
    { id: 'ec1', source: 'client-c', target: 'itrade', label: 'Self-directed', type: 'smoothstep', animated: true },
    { id: 'ec2', source: 'client-c', target: 'mcleod', label: 'Advisory', type: 'smoothstep' },
    { id: 'ec3', source: 'client-c', target: 'pic', label: 'Institutional', type: 'smoothstep' },
    { id: 'ec4', source: 'client-c', target: 'md', label: 'Doctor', type: 'smoothstep' },
    { id: 'ec5', source: 'client-c', target: 'pb', label: 'Complex', type: 'smoothstep' },
    { id: 'ec6', source: 'client-c', target: 'trust', label: 'Custody', type: 'smoothstep' },
    { id: 'ec7', source: 'client-c', target: 'neo-onboard', label: 'Existing client', type: 'smoothstep' }
  ]
}

export const componentITrade: C4View = {
  id: 'component-itrade',
  level: 'component',
  title: 'iTrade Onboarding Flow',
  parentViewId: 'container-channels',
  nodes: [
    {
      id: 'icon-ui',
      type: 'componentNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'ICON Application UI',
        type: 'component',
        technology: 'React/Web UI',
        description: 'All data entry happens here',
        responsibilities: ['Client data input', 'Account type selection', 'Options request', 'Document upload']
      }
    },
    {
      id: 'residency-check',
      type: 'componentNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Residency Check',
        type: 'component',
        description: 'Canadian residency validation',
        responsibilities: [
          'Enforce Canadian residency requirement',
          'US citizens in Canada → trigger W-9 tax forms',
          'Additional tax documentation for dual citizens'
        ]
      }
    },
    {
      id: 'account-type',
      type: 'componentNode',
      position: { x: 600, y: 100 },
      data: {
        label: 'Account Type Selection',
        type: 'component',
        description: 'Individual or Joint',
        responsibilities: [
          'Individual → Registered OR Non-registered',
          'Joint → Non-registered ONLY (no joint registered)',
          'Registered = individual only'
        ]
      }
    },
    {
      id: 'options-check',
      type: 'componentNode',
      position: { x: 600, y: 300 },
      data: {
        label: 'Options Assessment',
        type: 'component',
        description: 'Knowledge questions',
        responsibilities: [
          'Options knowledge questions',
          'Experience assessment',
          'Risky trade + low experience → reduce/reject options level'
        ]
      }
    },
    {
      id: 'icon-submit',
      type: 'componentNode',
      position: { x: 900, y: 200 },
      data: {
        label: 'Submit Application',
        type: 'component',
        description: 'Triggers post-submit calls',
        responsibilities: ['Submit to iTrade WealthOne', 'Trigger eConsent', 'Trigger Box storage', 'Trigger Credit Bureau', 'Trigger Canada Post']
      }
    },
    {
      id: 'itrade-wo',
      type: 'componentNode',
      position: { x: 1300, y: 100 },
      data: {
        label: 'iTrade WealthOne (Pega)',
        type: 'component',
        technology: 'Pega workflow',
        description: 'Case orchestration',
        drillDownTo: 'code-itrade-wo',
        responsibilities: ['Front-end validation', 'NIGO flagging', 'Route to ops', 'Coordinate integrations']
      }
    },
    {
      id: 'post-submit',
      type: 'componentNode',
      position: { x: 1300, y: 300 },
      data: {
        label: 'Post-Submit Integrations',
        type: 'component',
        description: 'ICON + iTrade WealthOne',
        responsibilities: ['Box document storage', 'eConsent eSignature', 'Credit Bureau (TransUnion)', 'Canada Post address validation']
      }
    },
    {
      id: 'itrade-ops',
      type: 'componentNode',
      position: { x: 1300, y: 500 },
      data: {
        label: 'iTrade Operations',
        type: 'component',
        description: 'Backend users',
        drillDownTo: 'code-itrade-ops',
        responsibilities: [
          'Account Approvers (client + account details, same for reg & non-reg)',
          'Document Reviewers (ID, forms, W-9 if needed)',
          'Options Approvers (options level approval)',
          'Outbound Users (contact for more info)'
        ]
      }
    },
    {
      id: 'kyc-write',
      type: 'componentNode',
      position: { x: 1700, y: 150 },
      data: {
        label: 'Write to KYC',
        type: 'component',
        description: 'Client book of record',
        responsibilities: ['Store client profile', 'Check consent to share', 'Prefill for existing clients', 'Share with CIS if consented']
      }
    },
    {
      id: 'broadridge',
      type: 'componentNode',
      position: { x: 1700, y: 350 },
      data: {
        label: 'Broadridge 061',
        type: 'component',
        description: 'Account book of record',
        responsibilities: ['Store account details', 'Feed to AML batch', 'Account activation']
      }
    }
  ],
  edges: [
    { id: 'eit1', source: 'icon-ui', target: 'residency-check', label: 'Input complete', type: 'smoothstep' },
    { id: 'eit2', source: 'residency-check', target: 'account-type', label: 'Verified', type: 'smoothstep' },
    { id: 'eit3', source: 'account-type', target: 'options-check', label: 'Selected', type: 'smoothstep' },
    { id: 'eit4', source: 'options-check', target: 'icon-submit', label: 'Complete', type: 'smoothstep' },
    { id: 'eit5', source: 'icon-submit', target: 'itrade-wo', label: 'Submit', type: 'smoothstep', animated: true },
    { id: 'eit6', source: 'icon-submit', target: 'post-submit', label: 'Trigger', type: 'smoothstep' },
    { id: 'eit7', source: 'itrade-wo', target: 'itrade-ops', label: 'Route', type: 'smoothstep' },
    { id: 'eit8', source: 'itrade-ops', target: 'kyc-write', label: 'Approved data', type: 'smoothstep' },
    { id: 'eit9', source: 'itrade-ops', target: 'broadridge', label: 'Account data', type: 'smoothstep' }
  ]
}

export const componentMcLeod: C4View = {
  id: 'component-mcleod',
  level: 'component',
  title: 'McLeod Advisory Flow',
  parentViewId: 'container-channels',
  nodes: [
    {
      id: 'risk-assess',
      type: 'componentNode',
      position: { x: 100, y: 250 },
      data: {
        label: 'Risk Tolerance Assessment',
        type: 'component',
        description: 'Advisory matching',
        responsibilities: ['Collect risk tolerance', 'Suitability assessment', 'Client goals and needs']
      }
    },
    {
      id: 'portfolio-rec',
      type: 'componentNode',
      position: { x: 500, y: 250 },
      data: {
        label: 'Portfolio Recommendation',
        type: 'component',
        description: 'Advisor recommends',
        responsibilities: ['Match portfolio to risk tolerance', 'Discretionary or non-discretionary', 'Present options to client']
      }
    },
    {
      id: 'mcleod-wo',
      type: 'componentNode',
      position: { x: 900, y: 150 },
      data: {
        label: 'McLeod WealthOne (Pega)',
        type: 'component',
        technology: 'Pega workflow',
        description: 'Separate from iTrade WealthOne',
        responsibilities: ['Validation (NO TransUnion)', 'NIGO flagging', 'Route to Wealth Ops']
      }
    },
    {
      id: 'mcleod-post',
      type: 'componentNode',
      position: { x: 900, y: 400 },
      data: {
        label: 'McLeod Post-Submit',
        type: 'component',
        description: 'McLeod WealthOne calls',
        responsibilities: ['Box document storage', 'eConsent eSignature', 'Canada Post (NO Credit Bureau)']
      }
    },
    {
      id: 'wealth-ops',
      type: 'componentNode',
      position: { x: 1300, y: 250 },
      data: {
        label: 'Wealth Client Onboarding',
        type: 'component',
        description: 'Wealth Ops team',
        responsibilities: ['Agreement checks', 'ID validation', 'Corrections to Broadridge', 'Outbound contact']
      }
    },
    {
      id: 'mcleod-kyc',
      type: 'componentNode',
      position: { x: 1700, y: 250 },
      data: {
        label: 'Write to KYC',
        type: 'component',
        description: 'Client book of record',
        responsibilities: ['Store client profile', 'Consent to share', 'Feed to Broadridge 061']
      }
    }
  ],
  edges: [
    { id: 'em1', source: 'risk-assess', target: 'portfolio-rec', label: 'Assessed', type: 'smoothstep' },
    { id: 'em2', source: 'portfolio-rec', target: 'mcleod-wo', label: 'Submit', type: 'smoothstep', animated: true },
    { id: 'em3', source: 'mcleod-wo', target: 'mcleod-post', label: 'Trigger', type: 'smoothstep' },
    { id: 'em4', source: 'mcleod-wo', target: 'wealth-ops', label: 'Route', type: 'smoothstep' },
    { id: 'em5', source: 'wealth-ops', target: 'mcleod-kyc', label: 'Approved', type: 'smoothstep' }
  ]
}

export const componentPIC: C4View = {
  id: 'component-pic',
  level: 'component',
  title: 'PIC/SJF Onboarding Flow',
  parentViewId: 'container-channels',
  nodes: [
    {
      id: 'pic-request-initiated',
      type: 'componentNode',
      position: { x: 100, y: 300 },
      data: {
        label: 'Request Initiated in Salesforce',
        type: 'component',
        description: 'RM/PA initiates onboarding',
        responsibilities: ['Request initiated by RM/PA', 'Relationship Manager or Portfolio Associate', 'Salesforce entry point']
      }
    },
    {
      id: 'pic-case-created',
      type: 'componentNode',
      position: { x: 450, y: 300 },
      data: {
        label: 'Case Created in Pega',
        type: 'component',
        description: 'Initial case setup',
        responsibilities: ['Create PIC/SJF case', 'Initialize workflow in Pega']
      }
    },
    {
      id: 'pic-add-client',
      type: 'componentNode',
      position: { x: 800, y: 300 },
      data: {
        label: 'Add Client(s)',
        type: 'component',
        description: 'Client information entry',
        responsibilities: ['Enter client details', 'Multiple clients supported']
      }
    },
    {
      id: 'pic-capture-client-details',
      type: 'componentNode',
      position: { x: 1150, y: 300 },
      data: {
        label: 'Capture Client Details',
        type: 'component',
        description: 'Capture client information',
        responsibilities: ['Store client data', 'Collect required information']
      }
    },
    {
      id: 'pic-add-accounts-decision',
      type: 'componentNode',
      position: { x: 1500, y: 300 },
      data: {
        label: 'Add Accounts?',
        type: 'component',
        description: 'Decision point',
        responsibilities: ['Determine if accounts needed', 'Branch workflow']
      }
    },
    {
      id: 'pic-select-accounts',
      type: 'componentNode',
      position: { x: 1850, y: 150 },
      data: {
        label: 'Select Accounts',
        type: 'component',
        description: 'Select account type',
        responsibilities: ['Choose account type', 'Account selection']
      }
    },
    {
      id: 'pic-capture-account-details',
      type: 'componentNode',
      position: { x: 2200, y: 150 },
      data: {
        label: 'Capture Account Details',
        type: 'component',
        description: 'Detailed account information',
        responsibilities: ['Account configuration', 'Custody options', 'External custody if needed']
      }
    },
    {
      id: 'pic-rm-to-approval',
      type: 'componentNode',
      position: { x: 2200, y: 450 },
      data: {
        label: 'Approvals (RM/TO)',
        type: 'component',
        description: 'Relationship Manager/Trust Officer approval',
        responsibilities: ['RM/TO reviews case', 'Approve or reject', 'Client-facing role approval']
      }
    },
    {
      id: 'pic-backoffice-approval',
      type: 'componentNode',
      position: { x: 2550, y: 300 },
      data: {
        label: 'Approvals (BackOffice)',
        type: 'component',
        description: 'Wealth Client Onboarding team',
        responsibilities: ['Back office review', 'Document validation', 'Compliance check', 'Wealth Client Onboarding team']
      }
    },
    {
      id: 'party-master',
      type: 'componentNode',
      position: { x: 2950, y: 200 },
      data: {
        label: 'Party Master',
        type: 'component',
        description: 'PIC client book of record',
        responsibilities: ['Store PIC client info', 'Separate from KYC']
      }
    },
    {
      id: 'empower',
      type: 'componentNode',
      position: { x: 2950, y: 400 },
      data: {
        label: 'Empower',
        type: 'component',
        description: 'PIC account/custody book',
        responsibilities: ['PIC account records', 'Scotia Trust custody', 'Optional external custody (US)', 'Feed to AML batch']
      }
    }
  ],
  edges: [
    { id: 'ep1', source: 'pic-request-initiated', target: 'pic-case-created', label: 'Initiate', type: 'smoothstep', animated: true },
    { id: 'ep2', source: 'pic-case-created', target: 'pic-add-client', label: 'Create case', type: 'smoothstep' },
    { id: 'ep3', source: 'pic-add-client', target: 'pic-capture-client-details', label: 'Add clients', type: 'smoothstep' },
    { id: 'ep4', source: 'pic-capture-client-details', target: 'pic-add-accounts-decision', label: 'Capture', type: 'smoothstep' },
    { id: 'ep5', source: 'pic-add-accounts-decision', target: 'pic-select-accounts', label: 'Yes', type: 'smoothstep', animated: true },
    { id: 'ep6', source: 'pic-select-accounts', target: 'pic-capture-account-details', label: 'Select', type: 'smoothstep' },
    { id: 'ep7', source: 'pic-capture-account-details', target: 'pic-rm-to-approval', label: 'Submit', type: 'smoothstep' },
    { id: 'ep8', source: 'pic-add-accounts-decision', target: 'pic-rm-to-approval', label: 'No', type: 'smoothstep' },
    { id: 'ep9', source: 'pic-rm-to-approval', target: 'pic-backoffice-approval', label: 'Approved', type: 'smoothstep', animated: true },
    { id: 'ep10', source: 'pic-backoffice-approval', target: 'party-master', label: 'Write client', type: 'smoothstep', animated: true },
    { id: 'ep11', source: 'pic-backoffice-approval', target: 'empower', label: 'Write account', type: 'smoothstep', animated: true }
  ]
}

export const containerData: C4View = {
  id: 'container-data',
  level: 'container',
  title: 'Books of Record & Data Stores',
  parentViewId: 'context',
  nodes: [
    {
      id: 'kyc-db',
      type: 'containerNode',
      position: { x: 200, y: 150 },
      data: {
        label: 'KYC Database',
        type: 'container',
        description: 'iTrade + McLeod client book',
        responsibilities: ['Client profiles', 'Previous applications', 'Prefill data', 'Consent to share management']
      }
    },
    {
      id: 'cis-db',
      type: 'containerNode',
      position: { x: 200, y: 350 },
      data: {
        label: 'CIS',
        type: 'container',
        description: 'Retail banking book',
        responsibilities: ['Day-to-day banking', 'Retail products', 'Share with wealth if consented']
      }
    },
    {
      id: 'sybase',
      type: 'containerNode',
      position: { x: 200, y: 550 },
      data: {
        label: 'Sybase',
        type: 'container',
        description: 'Legacy database system',
        responsibilities: ['Data storage', 'KYC integration', 'Legacy data support']
      }
    },
    {
      id: 'br-061',
      type: 'containerNode',
      position: { x: 550, y: 250 },
      data: {
        label: 'Broadridge 061',
        type: 'container',
        description: 'iTrade + McLeod account book',
        responsibilities: ['Account records', 'Holdings', 'Feed to AML batch']
      }
    },
    {
      id: 'pm-db',
      type: 'containerNode',
      position: { x: 900, y: 200 },
      data: {
        label: 'Party Master',
        type: 'container',
        description: 'PIC client book',
        responsibilities: ['PIC client info', 'Separate from KYC']
      }
    },
    {
      id: 'emp-db',
      type: 'containerNode',
      position: { x: 900, y: 400 },
      data: {
        label: 'Empower',
        type: 'container',
        description: 'PIC account/custody book',
        responsibilities: ['PIC accounts', 'Custody records', 'External custody option', 'Feed to AML batch']
      }
    }
  ],
  edges: [
    { id: 'ed1', source: 'kyc-db', target: 'cis-db', label: 'Consent to share', type: 'smoothstep' },
    { id: 'ed2', source: 'kyc-db', target: 'br-061', label: 'Client data', type: 'smoothstep' },
    { id: 'ed3', source: 'pm-db', target: 'emp-db', label: 'Client link', type: 'smoothstep' },
    { id: 'ed4', source: 'kyc-db', target: 'sybase', label: 'Data sync', type: 'smoothstep' }
  ]
}

export const containerCompliance: C4View = {
  id: 'container-compliance',
  level: 'container',
  title: 'Compliance & AML Processing',
  parentViewId: 'context',
  nodes: [
    {
      id: 'batch',
      type: 'containerNode',
      position: { x: 200, y: 200 },
      data: {
        label: 'Overnight Batch',
        type: 'container',
        description: 'End of day processing',
        responsibilities: ['Pull from Broadridge/Empower', 'Feed to AML team', 'Feed to identity verification']
      }
    },
    {
      id: 'aml-team',
      type: 'containerNode',
      position: { x: 500, y: 150 },
      data: {
        label: 'AML Compliance Team',
        type: 'container',
        description: 'AML screening',
        responsibilities: ['Name screening', 'Source of funds validation', 'Risk assessment (Low/Medium/High)', 'HRFA flagging']
      }
    },
    {
      id: 'id-verify',
      type: 'containerNode',
      position: { x: 500, y: 350 },
      data: {
        label: 'Identity Verification',
        type: 'container',
        description: 'Validate identity',
        responsibilities: ['ID validation', 'Credit bureau check (iTrade only)', 'Address validation', 'Credit history check']
      }
    },
    {
      id: 'hrfa',
      type: 'containerNode',
      position: { x: 800, y: 200 },
      data: {
        label: 'HRFA Risk Flags',
        type: 'container',
        description: 'Suspicious activity detection',
        responsibilities: [
          'Flag inconsistencies (e.g., unemployed + high income)',
          'Require explanation + proof',
          'Trigger outbound contact',
          'No credit history or long credit history → require alternate eligibility'
        ]
      }
    },
    {
      id: 'cleared',
      type: 'containerNode',
      position: { x: 500, y: 550 },
      data: {
        label: 'Clearance Decision',
        type: 'container',
        description: 'Pass or remediate',
        responsibilities: ['Cleared → Account active', 'Failed → Remediation → Outbound contact']
      }
    }
  ],
  edges: [
    { id: 'eco1', source: 'batch', target: 'aml-team', label: 'Batch file', type: 'smoothstep', animated: true },
    { id: 'eco2', source: 'batch', target: 'id-verify', label: 'Batch file', type: 'smoothstep' },
    { id: 'eco3', source: 'aml-team', target: 'hrfa', label: 'Check', type: 'smoothstep' },
    { id: 'eco4', source: 'id-verify', target: 'hrfa', label: 'Check', type: 'smoothstep' },
    { id: 'eco5', source: 'hrfa', target: 'cleared', label: 'Result', type: 'smoothstep' }
  ]
}

export const containerOperations: C4View = {
  id: 'container-operations',
  level: 'container',
  title: 'Operations Teams',
  parentViewId: 'context',
  nodes: [
    {
      id: 'itrade-ops-c',
      type: 'containerNode',
      position: { x: 200, y: 200 },
      data: {
        label: 'iTrade Operations',
        type: 'container',
        description: 'Backend users',
        responsibilities: [
          'Account Approvers',
          'Document Reviewers',
          'Options Approvers',
          'Outbound Users (NOT approvers)'
        ]
      }
    },
    {
      id: 'wealth-ops-c',
      type: 'containerNode',
      position: { x: 550, y: 200 },
      data: {
        label: 'Wealth Client Onboarding',
        type: 'container',
        description: 'McLeod ops',
        responsibilities: [
          'Agreement checks',
          'ID validation',
          'Corrections to Broadridge',
          'Shared with some iTrade processes'
        ]
      }
    },
    {
      id: 'nigo',
      type: 'containerNode',
      position: { x: 375, y: 400 },
      data: {
        label: 'NIGO Remediation',
        type: 'container',
        description: 'Not In Good Order',
        responsibilities: [
          'Missing/invalid/inconsistent info',
          'Outbound contact for clarification',
          'Loop back to case'
        ]
      }
    }
  ],
  edges: [
    { id: 'eop1', source: 'itrade-ops-c', target: 'nigo', label: 'Flag', type: 'smoothstep' },
    { id: 'eop2', source: 'wealth-ops-c', target: 'nigo', label: 'Flag', type: 'smoothstep' }
  ]
}

export const containerClientExperience: C4View = {
  id: 'container-client-experience',
  level: 'container',
  title: 'Client Experience - NEO & ORION',
  parentViewId: 'context',
  nodes: [
    {
      id: 'neo-ui',
      type: 'containerNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'NEO (Wealth UI)',
        type: 'container',
        technology: 'Web Application',
        drillDownTo: 'component-neo',
        description: 'Unified web front-end for all wealth accounts',
        responsibilities: [
          'iTrade account access & trading',
          'McLeod advisory accounts',
          'ScotiaTrust custody accounts',
          'PIC institutional accounts',
          'Statements & documents',
          'Market data',
          'Portfolio management'
        ]
      }
    },
    {
      id: 'starburst-ui',
      type: 'containerNode',
      position: { x: 400, y: 200 },
      data: {
        label: 'Starburst (Mobile)',
        type: 'container',
        technology: 'Mobile Application',
        description: 'Mobile front-end for iTrade',
        responsibilities: [
          'iTrade mobile access',
          'Mobile trading',
          'Account viewing',
          'Market data on mobile'
        ]
      }
    },
    {
      id: 'orion-ui',
      type: 'containerNode',
      position: { x: 100, y: 500 },
      data: {
        label: 'ORION (Banking UI)',
        type: 'container',
        technology: 'Web Application',
        description: 'Banking consolidated view',
        responsibilities: [
          'Consolidated account view',
          'Money movement',
          'Banking operations',
          'Retail banking integration'
        ]
      }
    },
    {
      id: 'marvel',
      type: 'containerNode',
      position: { x: 400, y: 500 },
      data: {
        label: 'Marvel',
        type: 'container',
        technology: 'API Microservice Layer',
        description: 'Serves Canadian digital banking apps',
        responsibilities: [
          'API gateway for ORION',
          'Account queries',
          'Money movement APIs',
          'Banking service integration'
        ]
      }
    },
    {
      id: 'prodigy-client',
      type: 'containerNode',
      position: { x: 700, y: 350 },
      data: {
        label: 'Prodigy Service',
        type: 'container',
        technology: 'Orchestration Layer',
        description: 'Central orchestrator',
        responsibilities: [
          'NEO backend routing',
          'Marvel integration',
          'Service coordination'
        ]
      }
    }
  ],
  edges: [
    { id: 'ece1', source: 'neo-ui', target: 'prodigy-client', label: 'Wealth operations', type: 'smoothstep', animated: true },
    { id: 'ece1b', source: 'starburst-ui', target: 'prodigy-client', label: 'iTrade mobile', type: 'smoothstep', animated: true },
    { id: 'ece2', source: 'orion-ui', target: 'marvel', label: 'Banking operations', type: 'smoothstep', animated: true },
    { id: 'ece3', source: 'marvel', target: 'prodigy-client', label: 'Backend services', type: 'smoothstep' }
  ]
}

export const componentNEOOnboarding: C4View = {
  id: 'component-neo-onboarding',
  level: 'component',
  title: 'First Time User Flow',
  parentViewId: 'container-channels',
  nodes: [
    {
      id: 'neo-login',
      type: 'componentNode',
      position: { x: 100, y: 250 },
      data: {
        label: 'Login Page',
        type: 'component',
        technology: 'FTUF Authentication',
        description: 'Scotiabank login with FTUF logic',
        responsibilities: ['User authentication', 'Session management', 'Security validation']
      }
    },
    {
      id: 'neo-agreements',
      type: 'componentNode',
      position: { x: 400, y: 250 },
      data: {
        label: 'Online Brokerage Agreements',
        type: 'component',
        description: 'Legal agreements page',
        responsibilities: ['Display agreements', 'Capture consent', 'Legal compliance']
      }
    },
    {
      id: 'neo-email',
      type: 'componentNode',
      position: { x: 700, y: 250 },
      data: {
        label: 'Email Update Page',
        type: 'component',
        description: 'Update contact information',
        responsibilities: ['Email verification', 'Contact info update', 'Communication preferences']
      }
    },
    {
      id: 'neo-access-code',
      type: 'componentNode',
      position: { x: 1000, y: 250 },
      data: {
        label: 'Access Code Update',
        type: 'component',
        description: 'Security code setup',
        responsibilities: ['Access code creation', 'Security setup', 'Account protection']
      }
    },
    {
      id: 'neo-quotes',
      type: 'componentNode',
      position: { x: 400, y: 450 },
      data: {
        label: 'Quote Selection',
        type: 'component',
        description: 'Real-time or delayed quotes',
        responsibilities: ['Quote type selection', 'Market data preferences', 'Real-time vs delayed']
      }
    },
    {
      id: 'neo-exchanges',
      type: 'componentNode',
      position: { x: 700, y: 450 },
      data: {
        label: 'Exchange Agreements',
        type: 'component',
        description: 'NASDAQ, NYSE, OPRA, Canadian',
        responsibilities: ['Exchange agreements', 'NASDAQ agreement', 'NYSE agreement', 'OPRA agreement', 'Canadian Exchange agreement']
      }
    },
    {
      id: 'neo-success',
      type: 'componentNode',
      position: { x: 1000, y: 450 },
      data: {
        label: 'Success Page',
        type: 'component',
        description: 'Onboarding complete',
        responsibilities: ['Confirmation message', 'Next steps', 'Dashboard redirect']
      }
    },
    {
      id: 'neo-dashboard',
      type: 'componentNode',
      position: { x: 1300, y: 350 },
      data: {
        label: 'Dashboard',
        type: 'component',
        description: 'NEO main dashboard',
        responsibilities: ['Account overview', 'Quick actions', 'Platform navigation']
      }
    }
  ],
  edges: [
    { id: 'eno1', source: 'neo-login', target: 'neo-agreements', label: 'Authenticated', type: 'smoothstep', animated: true },
    { id: 'eno2', source: 'neo-agreements', target: 'neo-email', label: 'Agreed', type: 'smoothstep' },
    { id: 'eno3', source: 'neo-email', target: 'neo-access-code', label: 'Updated', type: 'smoothstep' },
    { id: 'eno4', source: 'neo-access-code', target: 'neo-quotes', label: 'Complete', type: 'smoothstep' },
    { id: 'eno5', source: 'neo-quotes', target: 'neo-exchanges', label: 'Selected', type: 'smoothstep' },
    { id: 'eno6', source: 'neo-exchanges', target: 'neo-success', label: 'Agreed', type: 'smoothstep' },
    { id: 'eno7', source: 'neo-success', target: 'neo-dashboard', label: 'Continue', type: 'smoothstep', animated: true }
  ]
}

export const componentNEO: C4View = {
  id: 'component-neo',
  level: 'component',
  title: 'NEO Wealth Management Platform',
  parentViewId: 'container-client-experience',
  nodes: [
    {
      id: 'neo-itrade-accounts',
      type: 'componentNode',
      position: { x: 100, y: 80 },
      data: {
        label: 'iTrade Accounts',
        type: 'component',
        description: 'Self-directed trading accounts',
        responsibilities: [
          'View iTrade accounts',
          'Place orders',
          'Trade confirmations',
          'Position management'
        ]
      }
    },
    {
      id: 'neo-mcleod-accounts',
      type: 'componentNode',
      position: { x: 100, y: 300 },
      data: {
        label: 'McLeod Accounts',
        type: 'component',
        description: 'Advisory accounts',
        responsibilities: [
          'View McLeod accounts',
          'Portfolio overview',
          'Advisory holdings',
          'Performance tracking'
        ]
      }
    },
    {
      id: 'neo-trust-accounts',
      type: 'componentNode',
      position: { x: 100, y: 520 },
      data: {
        label: 'ScotiaTrust Accounts',
        type: 'component',
        description: 'Trust custody accounts',
        responsibilities: [
          'View Trust accounts',
          'Custody holdings',
          'Estate management',
          'Trust documents'
        ]
      }
    },
    {
      id: 'neo-pic-accounts',
      type: 'componentNode',
      position: { x: 100, y: 740 },
      data: {
        label: 'PIC Accounts',
        type: 'component',
        description: 'Institutional accounts',
        responsibilities: [
          'View PIC accounts',
          'Institutional holdings',
          'External custody',
          'Corporate accounts'
        ]
      }
    },
    {
      id: 'neo-trading',
      type: 'componentNode',
      position: { x: 550, y: 80 },
      data: {
        label: 'Trading & Orders',
        type: 'component',
        technology: 'OMS Integration',
        description: 'Order management for iTrade',
        responsibilities: [
          'Submit orders',
          'Order status',
          'Trade confirmations',
          'Position management'
        ]
      }
    },
    {
      id: 'neo-market-data',
      type: 'componentNode',
      position: { x: 950, y: 80 },
      data: {
        label: 'Market Data',
        type: 'component',
        technology: 'TREP + FixedIncome',
        description: 'Real-time quotes and data',
        responsibilities: [
          'Real-time quotes',
          'Delayed quotes',
          'Fixed income data',
          'Market news'
        ]
      }
    },
    {
      id: 'neo-statements',
      type: 'componentNode',
      position: { x: 550, y: 350 },
      data: {
        label: 'Statements & Documents',
        type: 'component',
        technology: 'Symcor Integration',
        description: 'Document management',
        responsibilities: [
          'Account statements',
          'Tax documents',
          'Trade confirmations',
          'Document archive'
        ]
      }
    },
    {
      id: 'neo-performance',
      type: 'componentNode',
      position: { x: 950, y: 350 },
      data: {
        label: 'Account Performance',
        type: 'component',
        technology: 'Aspire',
        description: 'Performance analytics',
        responsibilities: [
          'Portfolio performance',
          'Asset allocation',
          'Returns analysis',
          'Benchmarking'
        ]
      }
    },
    {
      id: 'neo-broadridge',
      type: 'componentNode',
      position: { x: 1400, y: 250 },
      data: {
        label: 'Broadridge APIs',
        type: 'component',
        technology: 'TFS, SmartAdvisor, PostEdge',
        description: 'Broadridge integrations',
        responsibilities: [
          'SmartAdvisor: Advisor communications',
          'PostEdge: Post-trade processing',
          'TFS: Transaction filing'
        ]
      }
    },
    {
      id: 'oms',
      type: 'componentNode',
      position: { x: 550, y: 620 },
      data: {
        label: 'OMS',
        type: 'component',
        description: 'Order Management System',
        responsibilities: [
          'Order routing',
          'Execution management',
          'Trade allocation'
        ]
      }
    },
  ],
  edges: [
    { id: 'en1', source: 'neo-itrade-accounts', target: 'neo-trading', label: 'Submit orders', type: 'smoothstep', animated: true },
    { id: 'en2', source: 'neo-trading', target: 'oms', label: 'Route to OMS', type: 'smoothstep', animated: true },
    { id: 'en3', source: 'neo-itrade-accounts', target: 'neo-market-data', label: 'View quotes', type: 'smoothstep' },
    { id: 'en4', source: 'neo-mcleod-accounts', target: 'neo-performance', label: 'View performance', type: 'smoothstep' },
    { id: 'en5', source: 'neo-itrade-accounts', target: 'neo-statements', label: 'View statements', type: 'smoothstep' },
    { id: 'en6', source: 'neo-mcleod-accounts', target: 'neo-statements', label: 'View statements', type: 'smoothstep' },
    { id: 'en7', source: 'neo-trust-accounts', target: 'neo-statements', label: 'View statements', type: 'smoothstep' },
    { id: 'en8', source: 'neo-pic-accounts', target: 'neo-statements', label: 'View statements', type: 'smoothstep' },
    { id: 'en9', source: 'neo-statements', target: 'neo-broadridge', label: 'Documents', type: 'smoothstep' },
    { id: 'en10', source: 'neo-performance', target: 'neo-broadridge', label: 'Analytics', type: 'smoothstep' },
    { id: 'en11', source: 'oms', target: 'neo-broadridge', label: 'Post-trade', type: 'smoothstep' }
  ]
}

export const containerTrading: C4View = {
  id: 'container-trading',
  level: 'container',
  title: 'Trading & Settlement System',
  parentViewId: 'context',
  nodes: [
    {
      id: 'itrade-client',
      type: 'personNode',
      position: { x: 50, y: 200 },
      data: { label: 'iTrade Client', type: 'person', description: 'Self-directed trader' }
    },
    {
      id: 'sm-advisor',
      type: 'personNode',
      position: { x: 50, y: 400 },
      data: { label: 'SM Advisor/Trader', type: 'person', description: 'Wealth advisor' }
    },
    {
      id: 'contact-centre',
      type: 'personNode',
      position: { x: 50, y: 600 },
      data: { label: 'Contact Centre', type: 'person', description: 'OM Desk support' }
    },
    {
      id: 'itrade-channels',
      type: 'containerNode',
      position: { x: 300, y: 200 },
      data: {
        label: 'iTrade Channels',
        type: 'container',
        technology: 'Digital platforms',
        drillDownTo: 'component-itrade-trading',
        responsibilities: ['Scotia Online Brokerage', 'NEO', 'iTrade Mobile', 'TradePro']
      }
    },
    {
      id: 'charles-river',
      type: 'containerNode',
      position: { x: 300, y: 400 },
      data: {
        label: 'SM Charles River',
        type: 'container',
        technology: 'OMS/EMS',
        drillDownTo: 'component-charles-river',
        responsibilities: ['Charles Anywhere', 'CR IMS', 'CR Order Book', 'CR FIX Engine']
      }
    },
    {
      id: 'contact-centre-tools',
      type: 'containerNode',
      position: { x: 300, y: 600 },
      data: {
        label: 'Contact Centre Tools',
        type: 'container',
        technology: 'SCORE',
        responsibilities: ['Assisted orders', 'Support tools', 'Order entry']
      }
    },
    {
      id: 'wealth-oms',
      type: 'containerNode',
      position: { x: 600, y: 350 },
      data: {
        label: 'Wealth OMS',
        type: 'container',
        technology: 'Order Management',
        drillDownTo: 'component-wealth-oms',
        responsibilities: ['OMS Core', 'OMS Order Book', 'OMS Gateways', 'Market routing']
      }
    },
    {
      id: 'settlement',
      type: 'containerNode',
      position: { x: 900, y: 350 },
      data: {
        label: 'Settlement Processing',
        type: 'container',
        technology: 'EOD/SOD, INTACT, Broadridge',
        drillDownTo: 'component-settlement',
        responsibilities: ['Trade exports', 'Settlement submissions', 'Reconciliation']
      }
    }
  ],
  edges: [
    { id: 'et1', source: 'itrade-client', target: 'itrade-channels', label: 'Places order', type: 'smoothstep', animated: true },
    { id: 'et2', source: 'sm-advisor', target: 'charles-river', label: 'Places order', type: 'smoothstep', animated: true },
    { id: 'et3', source: 'contact-centre', target: 'contact-centre-tools', label: 'Assists', type: 'smoothstep', animated: true },
    { id: 'et4', source: 'itrade-channels', target: 'wealth-oms', label: 'Routes order', type: 'smoothstep' },
    { id: 'et5', source: 'charles-river', target: 'wealth-oms', label: 'FIX protocol', type: 'smoothstep' },
    { id: 'et6', source: 'contact-centre-tools', target: 'wealth-oms', label: 'Submits order', type: 'smoothstep' },
    { id: 'et7', source: 'wealth-oms', target: 'settlement', label: 'Trade exports', type: 'smoothstep', animated: true },
    { id: 'et8', source: 'charles-river', target: 'settlement', label: 'Allocations', type: 'smoothstep' }
  ]
}

export const componentITradeTrading: C4View = {
  id: 'component-itrade-trading',
  level: 'component',
  title: 'iTrade Order Flow',
  parentViewId: 'container-trading',
  nodes: [
    {
      id: 'scotia-online-brokerage',
      type: 'componentNode',
      position: { x: 50, y: 80 },
      data: {
        label: 'Scotia Online Brokerage',
        type: 'component',
        description: 'Web trading platform',
        responsibilities: ['Order entry', 'Account view', 'Market data']
      }
    },
    {
      id: 'neo-trading',
      type: 'componentNode',
      position: { x: 50, y: 200 },
      data: {
        label: 'NEO',
        type: 'component',
        description: 'Wealth UI',
        responsibilities: ['Trading interface', 'Portfolio view']
      }
    },
    {
      id: 'itrade-mobile',
      type: 'componentNode',
      position: { x: 50, y: 320 },
      data: {
        label: 'iTrade Mobile',
        type: 'component',
        description: 'Mobile app',
        responsibilities: ['Mobile trading', 'Alerts', 'Quick orders']
      }
    },
    {
      id: 'tradepro',
      type: 'componentNode',
      position: { x: 50, y: 440 },
      data: {
        label: 'TradePro',
        type: 'component',
        description: 'Advanced platform',
        responsibilities: ['Level 2 quotes', 'Advanced charts', 'Fast execution']
      }
    },
    {
      id: 'api-layer',
      type: 'componentNode',
      position: { x: 350, y: 260 },
      data: {
        label: 'Scotia Online Brokerage Order Web Services',
        type: 'component',
        description: 'API gateway',
        responsibilities: ['Order validation', 'Authentication', 'Routing logic']
      }
    },
    {
      id: 'oms-web-services',
      type: 'componentNode',
      position: { x: 600, y: 260 },
      data: {
        label: 'OMS Web Services',
        type: 'component',
        description: 'OMS entry point',
        responsibilities: ['Order intake', 'Format conversion', 'Queue management']
      }
    },
    {
      id: 'oms-core',
      type: 'componentNode',
      position: { x: 850, y: 260 },
      data: {
        label: 'OMS Core',
        type: 'component',
        description: 'Order lifecycle manager',
        responsibilities: ['Order state', 'Execution logic', 'Order book updates']
      }
    },
    {
      id: 'oms-order-book',
      type: 'componentNode',
      position: { x: 1100, y: 140 },
      data: {
        label: 'OMS Order Book',
        type: 'component',
        description: 'Order repository',
        responsibilities: ['Store orders', 'Track status', 'Audit trail']
      }
    },
    {
      id: 'oms-gateways',
      type: 'componentNode',
      position: { x: 1100, y: 380 },
      data: {
        label: 'OMS Gateways',
        type: 'component',
        description: 'Market connectors',
        responsibilities: ['Route to venues', 'Protocol translation', 'Connection management']
      }
    },
    {
      id: 'dataphile',
      type: 'componentNode',
      position: { x: 1350, y: 200 },
      data: {
        label: 'DataPhile',
        type: 'component',
        description: 'Fund trade connector',
        responsibilities: ['FundServ connectivity']
      }
    },
    {
      id: 'fundserv',
      type: 'componentNode',
      position: { x: 1550, y: 200 },
      data: {
        label: 'FundServ',
        type: 'component',
        description: 'Fund trades',
        responsibilities: ['Mutual fund orders', 'Fund settlement']
      }
    },
    {
      id: 'perimeter-cib',
      type: 'componentNode',
      position: { x: 1350, y: 380 },
      data: {
        label: 'Perimeter Markets / CIB',
        type: 'component',
        description: 'Bond connector',
        responsibilities: ['Bond dealer connectivity']
      }
    },
    {
      id: 'bond-dealers',
      type: 'componentNode',
      position: { x: 1550, y: 380 },
      data: {
        label: 'Bond Dealers',
        type: 'component',
        description: 'Fixed income',
        responsibilities: ['Bond execution', 'Pricing']
      }
    },
    {
      id: 'iress',
      type: 'componentNode',
      position: { x: 1350, y: 480 },
      data: {
        label: 'IRESS',
        type: 'component',
        description: 'Equity connector',
        responsibilities: ['Market connectivity']
      }
    },
    {
      id: 'equity-markets',
      type: 'componentNode',
      position: { x: 1550, y: 480 },
      data: {
        label: 'Canadian / US Markets',
        type: 'component',
        description: 'Equity exchanges',
        responsibilities: ['TSX', 'NYSE', 'NASDAQ', 'Other venues']
      }
    }
  ],
  edges: [
    { id: 'eit1', source: 'scotia-online-brokerage', target: 'api-layer', type: 'smoothstep' },
    { id: 'eit2', source: 'neo-trading', target: 'api-layer', type: 'smoothstep' },
    { id: 'eit3', source: 'itrade-mobile', target: 'api-layer', type: 'smoothstep' },
    { id: 'eit4', source: 'tradepro', target: 'api-layer', type: 'smoothstep' },
    { id: 'eit5', source: 'api-layer', target: 'oms-web-services', label: 'Forward', type: 'smoothstep', animated: true },
    { id: 'eit6', source: 'oms-web-services', target: 'oms-core', label: 'Submit', type: 'smoothstep' },
    { id: 'eit7', source: 'oms-core', target: 'oms-order-book', label: 'Write/Update', type: 'smoothstep' },
    { id: 'eit8', source: 'oms-core', target: 'oms-gateways', label: 'Route', type: 'smoothstep', animated: true },
    { id: 'eit9', source: 'oms-gateways', target: 'dataphile', label: 'Funds', type: 'smoothstep' },
    { id: 'eit10', source: 'dataphile', target: 'fundserv', type: 'smoothstep' },
    { id: 'eit11', source: 'oms-gateways', target: 'perimeter-cib', label: 'Bonds', type: 'smoothstep' },
    { id: 'eit12', source: 'perimeter-cib', target: 'bond-dealers', type: 'smoothstep' },
    { id: 'eit13', source: 'oms-gateways', target: 'iress', label: 'Equities', type: 'smoothstep' },
    { id: 'eit14', source: 'iress', target: 'equity-markets', type: 'smoothstep' }
  ]
}

export const componentCharlesRiver: C4View = {
  id: 'component-charles-river',
  level: 'component',
  title: 'SM Charles River Order Flow',
  parentViewId: 'container-trading',
  nodes: [
    {
      id: 'charles-anywhere',
      type: 'componentNode',
      position: { x: 50, y: 250 },
      data: {
        label: 'Charles Anywhere',
        type: 'component',
        description: 'Advisor interface',
        responsibilities: ['Order entry', 'Portfolio management', 'Client view']
      }
    },
    {
      id: 'cr-middle-tier',
      type: 'componentNode',
      position: { x: 350, y: 250 },
      data: {
        label: 'Charles River Middle Tier',
        type: 'component',
        description: 'Processing layer',
        responsibilities: ['Order processing', 'Business logic', 'System coordination']
      }
    },
    {
      id: 'cr-ims',
      type: 'componentNode',
      position: { x: 600, y: 100 },
      data: {
        label: 'Charles River IMS',
        type: 'component',
        description: 'Investment management',
        responsibilities: ['Portfolio tracking', 'Compliance', 'Reporting']
      }
    },
    {
      id: 'cr-order-book',
      type: 'componentNode',
      position: { x: 600, y: 400 },
      data: {
        label: 'Charles River Order Book',
        type: 'component',
        description: 'CR order repository',
        responsibilities: ['Store CR orders', 'Order history', 'Allocation records']
      }
    },
    {
      id: 'cr-fix-engine',
      type: 'componentNode',
      position: { x: 900, y: 250 },
      data: {
        label: 'Charles River FIX Engine',
        type: 'component',
        description: 'FIX protocol handler',
        responsibilities: ['FIX messaging', 'Protocol conversion', 'Order routing']
      }
    },
    {
      id: 'oms-fix-server',
      type: 'componentNode',
      position: { x: 1200, y: 250 },
      data: {
        label: 'OMS FIX Server',
        type: 'component',
        description: 'OMS FIX endpoint',
        responsibilities: ['Receive FIX orders', 'Validate', 'Queue for OMS']
      }
    },
    {
      id: 'wealth-oms-core',
      type: 'componentNode',
      position: { x: 1500, y: 250 },
      data: {
        label: 'Wealth OMS Core',
        type: 'component',
        description: 'Order processing',
        responsibilities: ['Process CR orders', 'Route to venues', 'Execution management']
      }
    },
    {
      id: 'oms-order-book-cr',
      type: 'componentNode',
      position: { x: 1800, y: 100 },
      data: {
        label: 'OMS Order Book',
        type: 'component',
        description: 'OMS repository',
        responsibilities: ['Store all orders', 'Audit trail']
      }
    },
    {
      id: 'oms-gateways-cr',
      type: 'componentNode',
      position: { x: 1800, y: 400 },
      data: {
        label: 'OMS Gateways',
        type: 'component',
        description: 'Market routing',
        responsibilities: ['Route to markets', 'Venue connectivity']
      }
    }
  ],
  edges: [
    { id: 'ecr1', source: 'charles-anywhere', target: 'cr-middle-tier', label: 'Submit order', type: 'smoothstep', animated: true },
    { id: 'ecr2', source: 'cr-middle-tier', target: 'cr-ims', label: 'Update', type: 'smoothstep' },
    { id: 'ecr3', source: 'cr-middle-tier', target: 'cr-order-book', label: 'Record', type: 'smoothstep' },
    { id: 'ecr4', source: 'cr-middle-tier', target: 'cr-fix-engine', label: 'Route', type: 'smoothstep', animated: true },
    { id: 'ecr5', source: 'cr-fix-engine', target: 'oms-fix-server', label: 'FIX message', type: 'smoothstep' },
    { id: 'ecr6', source: 'oms-fix-server', target: 'wealth-oms-core', label: 'Hand off', type: 'smoothstep' },
    { id: 'ecr7', source: 'wealth-oms-core', target: 'oms-order-book-cr', label: 'Write', type: 'smoothstep' },
    { id: 'ecr8', source: 'wealth-oms-core', target: 'oms-gateways-cr', label: 'Execute', type: 'smoothstep', animated: true }
  ]
}

export const componentSettlement: C4View = {
  id: 'component-settlement',
  level: 'component',
  title: 'Settlement & Reconciliation Flow',
  parentViewId: 'container-trading',
  nodes: [
    {
      id: 'wealth-oms-export',
      type: 'componentNode',
      position: { x: 50, y: 100 },
      data: {
        label: 'Wealth OMS / OMS Order Book',
        type: 'component',
        description: 'Trade source',
        responsibilities: ['Trade extracts', 'Scheduled exports', 'Intraday feeds']
      }
    },
    {
      id: 'cr-export',
      type: 'componentNode',
      position: { x: 50, y: 280 },
      data: {
        label: 'Charles River',
        type: 'component',
        description: 'CR trade source',
        responsibilities: ['Allocations', 'Uncompressed trades', 'Hourly exports']
      }
    },
    {
      id: 'eod-sod',
      type: 'componentNode',
      position: { x: 350, y: 190 },
      data: {
        label: 'Wealth EOD/SOD Processing',
        type: 'component',
        description: 'Trade processing hub',
        responsibilities: ['Receive feeds', 'Transform data', 'Prepare submissions']
      }
    },
    {
      id: 'scotia-online-trades',
      type: 'componentNode',
      position: { x: 650, y: 80 },
      data: {
        label: 'Scotia Online (Uncompressed Trades)',
        type: 'component',
        description: 'Trade feed',
        responsibilities: ['Uncompressed trade data']
      }
    },
    {
      id: 'trade-compression',
      type: 'componentNode',
      position: { x: 1000, y: 80 },
      data: {
        label: 'OMS Trade Compression / Ticketing',
        type: 'component',
        description: 'Data transformation',
        responsibilities: ['Compress trades', 'Generate tickets', 'Normalize data']
      }
    },
    {
      id: 'cds-recon-prep',
      type: 'componentNode',
      position: { x: 1350, y: 80 },
      data: {
        label: 'CDS Recon & CDS Balance Processing',
        type: 'component',
        description: 'Recon preparation',
        responsibilities: ['Prepare recon data', 'Balance calculations']
      }
    },
    {
      id: 'intact-gateway',
      type: 'componentNode',
      position: { x: 650, y: 300 },
      data: {
        label: 'INTACT Gateway',
        type: 'component',
        description: 'Settlement gateway',
        responsibilities: ['Format submissions', 'Queue management', 'Error handling']
      }
    },
    {
      id: 'intact-mq',
      type: 'componentNode',
      position: { x: 900, y: 300 },
      data: {
        label: 'Trade Submissions (INTACT MQ)',
        type: 'component',
        description: 'Message queue',
        responsibilities: ['Reliable delivery', 'Message persistence', 'Retry logic']
      }
    },
    {
      id: 'broadridge',
      type: 'componentNode',
      position: { x: 1150, y: 300 },
      data: {
        label: 'Broadridge BPS',
        type: 'component',
        description: 'Settlement platform',
        responsibilities: ['Trade settlement', 'Clearance', 'Custody']
      }
    },
    {
      id: 'cds',
      type: 'componentNode',
      position: { x: 1400, y: 300 },
      data: {
        label: 'CDS',
        type: 'component',
        description: 'Canadian clearing',
        responsibilities: ['Clearing', 'Settlement', 'Depository']
      }
    },
    {
      id: 'cds-recon-breaks',
      type: 'componentNode',
      position: { x: 1400, y: 480 },
      data: {
        label: 'CDS Recon Breaks',
        type: 'component',
        description: 'Exception detection',
        responsibilities: ['Identify breaks', 'Generate alerts']
      }
    },
    {
      id: 'as400',
      type: 'componentNode',
      position: { x: 1700, y: 480 },
      data: {
        label: 'AS400',
        type: 'component',
        description: 'Legacy system',
        responsibilities: ['Store breaks', 'Historical data']
      }
    },
    {
      id: 'enhanced-recon',
      type: 'componentNode',
      position: { x: 1400, y: 620 },
      data: {
        label: 'CDS Enhanced Recon Report',
        type: 'component',
        description: 'Early AM report',
        responsibilities: ['Recon summary', 'Exception details']
      }
    },
    {
      id: 'balance-report',
      type: 'componentNode',
      position: { x: 1400, y: 760 },
      data: {
        label: 'CDS Balance Report',
        type: 'component',
        description: 'Later AM report',
        responsibilities: ['Position balances', 'Settlement status']
      }
    },
    {
      id: 'sec-ops',
      type: 'componentNode',
      position: { x: 1700, y: 690 },
      data: {
        label: 'Sec Ops',
        type: 'component',
        description: 'Operations team',
        responsibilities: ['Review reports', 'Resolve breaks', 'Monitor settlement']
      }
    }
  ],
  edges: [
    { id: 'es1', source: 'wealth-oms-export', target: 'eod-sod', label: 'Trade extracts', type: 'smoothstep', animated: true },
    { id: 'es2', source: 'cr-export', target: 'eod-sod', label: 'Allocations', type: 'smoothstep', animated: true },
    { id: 'es3', source: 'eod-sod', target: 'scotia-online-trades', label: 'Feed', type: 'smoothstep' },
    { id: 'es4', source: 'scotia-online-trades', target: 'trade-compression', type: 'smoothstep' },
    { id: 'es5', source: 'trade-compression', target: 'cds-recon-prep', type: 'smoothstep' },
    { id: 'es6', source: 'eod-sod', target: 'intact-gateway', label: 'Submit', type: 'smoothstep', animated: true },
    { id: 'es7', source: 'intact-gateway', target: 'intact-mq', label: 'Queue', type: 'smoothstep' },
    { id: 'es8', source: 'intact-mq', target: 'broadridge', label: 'Deliver', type: 'smoothstep' },
    { id: 'es9', source: 'broadridge', target: 'cds', label: 'Settlement', type: 'smoothstep', animated: true },
    { id: 'es10', source: 'cds', target: 'cds-recon-breaks', label: 'Detect breaks', type: 'smoothstep' },
    { id: 'es11', source: 'cds-recon-breaks', target: 'as400', label: 'Store', type: 'smoothstep' },
    { id: 'es12', source: 'cds', target: 'enhanced-recon', label: 'Generate', type: 'smoothstep' },
    { id: 'es13', source: 'cds', target: 'balance-report', label: 'Generate', type: 'smoothstep' },
    { id: 'es14', source: 'enhanced-recon', target: 'sec-ops', label: 'Early AM', type: 'smoothstep' },
    { id: 'es15', source: 'balance-report', target: 'sec-ops', label: 'Later AM', type: 'smoothstep' }
  ]
}

export const componentWealthOMS: C4View = {
  id: 'component-wealth-oms',
  level: 'component',
  title: 'Wealth OMS Architecture',
  parentViewId: 'container-trading',
  nodes: [
    {
      id: 'oms-web-svc',
      type: 'componentNode',
      position: { x: 50, y: 200 },
      data: {
        label: 'OMS Web Services',
        type: 'component',
        description: 'API entry point',
        responsibilities: ['iTrade orders', 'Contact centre orders', 'Order validation']
      }
    },
    {
      id: 'oms-fix-svc',
      type: 'componentNode',
      position: { x: 50, y: 350 },
      data: {
        label: 'OMS FIX Server',
        type: 'component',
        description: 'FIX entry point',
        responsibilities: ['Charles River orders', 'FIX protocol', 'Order conversion']
      }
    },
    {
      id: 'oms-core-detail',
      type: 'componentNode',
      position: { x: 350, y: 275 },
      data: {
        label: 'OMS Core',
        type: 'component',
        description: 'Central processing',
        responsibilities: ['Order lifecycle', 'State management', 'Routing logic', 'Execution tracking']
      }
    },
    {
      id: 'oms-book-detail',
      type: 'componentNode',
      position: { x: 650, y: 150 },
      data: {
        label: 'OMS Order Book',
        type: 'component',
        description: 'Order database',
        responsibilities: ['Persist orders', 'Order history', 'Status tracking', 'Audit log']
      }
    },
    {
      id: 'oms-gw-detail',
      type: 'componentNode',
      position: { x: 650, y: 400 },
      data: {
        label: 'OMS Gateways',
        type: 'component',
        description: 'Market connectors',
        responsibilities: ['DataPhile (FundServ)', 'Perimeter/CIB (Bonds)', 'IRESS (Equities)']
      }
    }
  ],
  edges: [
    { id: 'eoms1', source: 'oms-web-svc', target: 'oms-core-detail', label: 'Submit', type: 'smoothstep', animated: true },
    { id: 'eoms2', source: 'oms-fix-svc', target: 'oms-core-detail', label: 'Submit', type: 'smoothstep', animated: true },
    { id: 'eoms3', source: 'oms-core-detail', target: 'oms-book-detail', label: 'Write/Update', type: 'smoothstep' },
    { id: 'eoms4', source: 'oms-core-detail', target: 'oms-gw-detail', label: 'Route', type: 'smoothstep', animated: true }
  ]
}

export const allViews: Record<string, C4View> = {
  'context': contextView,
  'container-channels': containerChannels,
  'container-data': containerData,
  'container-compliance': containerCompliance,
  'container-operations': containerOperations,
  'container-client-experience': containerClientExperience,
  'container-trading': containerTrading,
  'component-itrade': componentITrade,
  'component-mcleod': componentMcLeod,
  'component-pic': componentPIC,
  'component-neo-onboarding': componentNEOOnboarding,
  'component-neo': componentNEO,
  'component-itrade-trading': componentITradeTrading,
  'component-charles-river': componentCharlesRiver,
  'component-settlement': componentSettlement,
  'component-wealth-oms': componentWealthOMS
}

export const getInitialView = () => contextView

export const getViewById = (id: string): C4View | undefined => allViews[id]

export function buildViewHistory(viewId: string): string[] {
  // Build a breadcrumb trail: context → container-* → component-*
  const history: string[] = ['context']
  if (viewId === 'context') return history
  if (viewId.startsWith('component-')) {
    // Try to find a parent container view that drills down to this component
    for (const [containerId, view] of Object.entries(allViews)) {
      if (containerId.startsWith('container-')) {
        const hasDrillDown = view.nodes.some(
          (n: any) => n.data?.drillDownTo === viewId
        )
        if (hasDrillDown) {
          history.push(containerId)
          break
        }
      }
    }
  }
  history.push(viewId)
  return history
}
