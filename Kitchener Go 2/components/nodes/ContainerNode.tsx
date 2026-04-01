'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { C4NodeData } from '@/data/c4Model'

function ContainerNode({ data, selected }: NodeProps<C4NodeData>) {
  return (
    <div
      className={`
        relative px-5 py-4 rounded-xl
        bg-accent-gold/5 border-2
        ${selected ? 'border-accent-gold shadow-lg shadow-accent-gold/20' : 'border-accent-gold/40'}
        transition-all duration-200 hover:border-accent-gold hover:shadow-md
        min-w-[180px] max-w-[220px]
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-accent-gold !border-2 !border-background"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm font-semibold text-accent-gold truncate">
            {data.label}
          </div>
        </div>
      </div>

      {data.description && (
        <div className="font-mono text-xs text-foreground/60 mb-2 leading-tight">
          {data.description}
        </div>
      )}

      {data.technology && (
        <div className="mt-2 pt-2 border-t border-accent-gold/20">
          <div className="font-mono text-xs text-foreground/40">
            {data.technology}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-accent-gold !border-2 !border-background"
      />
    </div>
  )
}

export default memo(ContainerNode)
