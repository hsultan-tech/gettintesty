'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { C4NodeData } from '@/data/c4Model'

function PersonNode({ data, selected }: NodeProps<C4NodeData>) {
  return (
    <div
      className={`
        relative px-6 py-4 rounded-2xl
        bg-blue-500/10 border-2 
        ${selected ? 'border-blue-400 shadow-lg shadow-blue-500/20' : 'border-blue-500/40'}
        transition-all duration-200 hover:border-blue-400 hover:shadow-md
        min-w-[160px] max-w-[200px]
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-blue-400 !border-2 !border-background"
      />
      
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <div className="font-mono text-sm font-medium text-blue-300 mb-1">
          {data.label}
        </div>
        {data.description && (
          <div className="font-mono text-xs text-foreground/50 leading-tight">
            {data.description}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-blue-400 !border-2 !border-background"
      />
    </div>
  )
}

export default memo(PersonNode)
