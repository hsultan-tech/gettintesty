'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { C4NodeData } from '@/data/c4Complete'

function ComponentNode({ data, selected }: NodeProps<C4NodeData>) {
  const hasDrillDown = !!data.drillDownTo

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg
        bg-green-500/5 border-2
        ${selected ? 'border-green-400 shadow-lg shadow-green-500/20' : 'border-green-500/40'}
        ${hasDrillDown ? 'cursor-pointer' : ''}
        transition-all duration-200 hover:border-green-400 hover:shadow-md
        min-w-[160px]
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-green-400 !border-2 !border-background"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded bg-green-500/10 border border-green-400/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs font-semibold text-green-300 break-words">
            {data.label}
          </div>
        </div>
        {hasDrillDown && (
          <svg className="w-3 h-3 text-green-400/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      {data.description && (
        <div className="font-mono text-[10px] text-foreground/50 leading-tight mb-1 break-words">
          {data.description}
        </div>
      )}

      {data.technology && (
        <div className="mt-2 pt-2 border-t border-green-500/20">
          <div className="font-mono text-[9px] text-foreground/40 break-words">
            {data.technology}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-green-400 !border-2 !border-background"
      />
    </div>
  )
}

export default memo(ComponentNode)
