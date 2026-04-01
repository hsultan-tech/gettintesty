'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { NodeData } from '@/data/onboardFlow'

const DecisionNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className={`
        flow-node
        relative
        cursor-pointer
        ${selected ? 'drop-shadow-[0_0_15px_rgba(201,169,98,0.4)]' : ''}
      `}
      style={{ transform: 'rotate(45deg)' }}
    >
      <div 
        className={`
          w-24 h-24
          bg-accent-gold/80
          border-2 border-accent-gold
          transition-all duration-200
          ${selected ? 'shadow-lg shadow-accent-gold/30' : ''}
        `}
        style={{
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      />
      
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: 'rotate(-45deg)' }}
      >
        <div className="text-center px-2">
          <span className="font-mono text-[9px] text-background font-semibold leading-tight block">
            Data Validation
          </span>
          <span className="font-mono text-[8px] text-background/80">
            Pass/Fail
          </span>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-accent-gold !border-none"
        style={{ left: -4, top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="pass"
        className="!w-2 !h-2 !bg-green-500 !border-none"
        style={{ right: -4, top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="fail"
        className="!w-2 !h-2 !bg-red-500 !border-none"
        style={{ top: -4, left: '50%' }}
      />
    </div>
  )
})

DecisionNode.displayName = 'DecisionNode'

export default DecisionNode

