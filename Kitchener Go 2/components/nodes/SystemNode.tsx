'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { C4NodeData } from '@/data/c4Model'

const SystemNode = memo(({ data, selected }: NodeProps<C4NodeData>) => {
  return (
    <div
      className={`
        relative px-5 py-4 rounded-xl
        bg-node-bg border-2
        ${selected ? 'border-foreground/60 shadow-lg shadow-foreground/10' : 'border-node-border'}
        transition-all duration-200 hover:border-foreground/50 hover:shadow-md
        min-w-[180px]
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-foreground/40 !border-2 !border-background"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-foreground/10 border border-foreground/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm font-semibold text-foreground/90 break-words">
            {data.label}
          </div>
        </div>
      </div>

      {data.description && (
        <div className="font-mono text-xs text-foreground/60 mb-2 leading-tight truncate">
          {data.description}
        </div>
      )}

      {data.technology && (
        <div className="mt-2 pt-2 border-t border-node-border max-w-[200px]">
          <div className="font-mono text-xs text-foreground/40 truncate">
            {data.technology}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-foreground/40 !border-2 !border-background"
      />
    </div>
  )
})

SystemNode.displayName = 'SystemNode'

export default SystemNode

