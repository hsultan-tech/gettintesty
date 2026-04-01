'use client'

import { Node } from 'reactflow'
import { C4NodeData } from '@/data/c4Model'

interface NodeDetailPanelProps {
  node: Node<C4NodeData> | null
  isOpen: boolean
  onClose: () => void
}

export default function NodeDetailPanel({ node, isOpen, onClose }: NodeDetailPanelProps) {
  if (!node) return null

  const { data } = node

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      person: 'Person',
      system: 'System',
      container: 'Container',
      boundary: 'Boundary',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      person: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      system: 'bg-foreground/20 text-foreground/80 border-foreground/30',
      container: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30',
      boundary: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    }
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20"
        onClick={onClose}
      />

      <div
        className="absolute right-0 top-0 bottom-0 w-96 max-w-full bg-background border-l border-node-border z-30 overflow-hidden"
        style={{ transition: 'transform 0.3s ease, opacity 0.3s ease' }}
      >
            <div className="p-6 border-b border-node-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-mono rounded border mb-2 ${getTypeColor(data.type)}`}>
                    {getTypeLabel(data.type)}
                  </span>
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    {data.label}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-node-hover transition-colors"
                >
                  <svg className="w-5 h-5 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {data.description && (
                <p className="text-sm text-foreground/60 font-mono">
                  {data.description}
                </p>
              )}
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {data.technology && (
                <div>
                  <h3 className="text-xs font-mono text-foreground/40 uppercase tracking-wider mb-2">
                    Technology
                  </h3>
                  <div className="px-3 py-2 bg-node-bg border border-node-border rounded-lg">
                    <span className="text-sm font-mono text-accent-gold">
                      {data.technology}
                    </span>
                  </div>
                </div>
              )}

              {data.details?.overview && (
                <div>
                  <h3 className="text-xs font-mono text-foreground/40 uppercase tracking-wider mb-2">
                    Overview
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {data.details.overview}
                  </p>
                </div>
              )}

              {data.responsibilities && data.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-foreground/40 uppercase tracking-wider mb-3">
                    Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {data.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground/70">
                        <span className="text-accent-gold mt-1">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.relationships && data.relationships.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-foreground/40 uppercase tracking-wider mb-3">
                    Relationships
                  </h3>
                  <div className="space-y-2">
                    {data.relationships.map((rel, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-node-bg border border-node-border rounded-lg"
                      >
                        <svg className="w-4 h-4 text-foreground/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                        <span className="text-xs font-mono text-foreground/70">
                          {rel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.details?.validations && data.details.validations.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-foreground/40 uppercase tracking-wider mb-3">
                    Validations
                  </h3>
                  <div className="space-y-2">
                    {data.details.validations.map((validation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-node-bg border border-node-border rounded-lg"
                      >
                        <svg className="w-4 h-4 text-green-400/60 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-mono text-foreground/70">
                          {validation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.details?.dataStored && data.details.dataStored.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-foreground/40 uppercase tracking-wider mb-3">
                    Data Stored
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.details.dataStored.map((dataItem, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-node-bg border border-node-border rounded-lg text-xs font-mono text-foreground/70"
                      >
                        {dataItem}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.details?.team && (
                <div>
                  <h3 className="text-xs font-mono text-foreground/40 uppercase tracking-wider mb-2">
                    Responsible Team
                  </h3>
                  <div className="flex items-center gap-2 p-3 bg-node-bg border border-node-border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-mono text-foreground/80">
                      {data.details.team}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-node-border">
                <div className="flex items-center justify-between text-xs text-foreground/30 font-mono">
                  <span>Node ID</span>
                  <span className="bg-node-bg px-2 py-1 rounded">{node.id}</span>
                </div>
              </div>
            </div>
          </div>
        </>
  )
}

