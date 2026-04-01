'use client'

import { useCallback, useState } from 'react'
import ReactFlow, {
  Node,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionMode,
  NodeTypes,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { PersonNode, SystemNode, ContainerNode, ComponentNode, DecisionNode } from './nodes'
import NodeDetailPanel from './NodeDetailPanel'
import { useTheme } from './ThemeProvider'
import { 
  C4NodeData,
  C4View,
  getInitialView,
  getViewById,
  buildViewHistory
} from '@/data/c4Complete'

const nodeTypes: NodeTypes = {
  personNode: PersonNode,
  systemNode: SystemNode,
  containerNode: ContainerNode,
  componentNode: ComponentNode,
  decisionNode: DecisionNode,
}


interface FlowChartInnerProps {
  initialViewId?: string
}

function FlowChartInner({ initialViewId }: FlowChartInnerProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const defaultEdgeOptions = {
    style: {
      stroke: isLight ? '#c4bba8' : '#444444',
      strokeWidth: 1.5,
    },
    labelStyle: {
      fill: isLight ? '#666050' : '#888888',
      fontSize: 11,
      fontFamily: 'IBM Plex Mono, monospace',
      fontWeight: 500,
    },
    labelBgStyle: {
      fill: isLight ? '#F6F4EF' : '#0D0D0D',
      fillOpacity: 0.95,
    },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 4,
  }

  const startView = (initialViewId && getViewById(initialViewId)) || getInitialView()
  const startHistory = initialViewId && getViewById(initialViewId)
    ? buildViewHistory(initialViewId)
    : ['context']

  const [currentView, setCurrentView] = useState<C4View>(startView)
  const [viewHistory, setViewHistory] = useState<string[]>(startHistory)
  const [nodes, setNodes, onNodesChange] = useNodesState(startView.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(startView.edges)
  const [selectedNode, setSelectedNode] = useState<Node<C4NodeData> | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const navigateToView = useCallback((viewId: string) => {
    const view = getViewById(viewId)
    if (view) {
      setCurrentView(view)
      setNodes(view.nodes)
      setEdges(view.edges)
      setViewHistory(prev => [...prev, viewId])
      setSelectedNode(null)
      setIsPanelOpen(false)
      
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ 
            padding: 0.2, 
            duration: 800,
            maxZoom: 1.2,
            minZoom: 0.3
          })
        }
      }, 50)
    }
  }, [setNodes, setEdges, reactFlowInstance])

  const navigateBack = useCallback(() => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory]
      newHistory.pop()
      const previousViewId = newHistory[newHistory.length - 1]
      const view = getViewById(previousViewId)
      if (view) {
        setCurrentView(view)
        setNodes(view.nodes)
        setEdges(view.edges)
        setViewHistory(newHistory)
        setSelectedNode(null)
        setIsPanelOpen(false)
        
        // Smooth transition back
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ 
              padding: 0.2, 
              duration: 800,
              maxZoom: 1.2,
              minZoom: 0.3
            })
          }
        }, 50)
      }
    }
  }, [viewHistory, setNodes, setEdges, reactFlowInstance])

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<C4NodeData>) => {
    if (node.data.drillDownTo) {
      navigateToView(node.data.drillDownTo)
    } else {
      setSelectedNode(node)
      setIsPanelOpen(true)
    }
  }, [navigateToView])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setIsPanelOpen(false)
  }, [])

  const closePanel = useCallback(() => {
    setSelectedNode(null)
    setIsPanelOpen(false)
  }, [])

  return (
    <div className="absolute inset-0">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-background border border-node-border rounded-lg px-4 py-2">
          <span className="font-mono text-sm text-foreground/90">
            {currentView.title}
          </span>
        </div>
        
      </div>

      {viewHistory.length > 1 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={navigateBack}
            className="bg-node-bg border border-node-border rounded-lg px-4 py-2 flex items-center gap-2 hover:border-accent-gold/50 transition-colors"
          >
            <svg className="w-4 h-4 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="font-mono text-xs text-foreground/80">
              Back
            </span>
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.3,
          maxZoom: 1.2,
          duration: 800
        }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
        style={{ width: '100%', height: '100%' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={30}
          size={1}
          color={isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'}
        />
        <Controls
          className="!bg-node-bg !border-node-border !rounded-lg overflow-hidden"
          showInteractive={false}
        />
      </ReactFlow>

      <NodeDetailPanel
        node={selectedNode}
        isOpen={isPanelOpen}
        onClose={closePanel}
      />
    </div>
  )
}

interface FlowChartProps {
  initialViewId?: string
}

export default function FlowChart({ initialViewId }: FlowChartProps) {
  return (
    <ReactFlowProvider>
      <FlowChartInner initialViewId={initialViewId} />
    </ReactFlowProvider>
  )
}
