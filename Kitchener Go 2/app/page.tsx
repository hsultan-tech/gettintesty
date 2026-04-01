'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import GridBackground from '@/components/GridBackground'
import ThemeToggle from '@/components/ThemeToggle'

const FlowChart = dynamic(() => import('@/components/FlowChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
        <span className="font-mono text-sm text-foreground/50">Loading flow...</span>
      </div>
    </div>
  ),
})

function HomeContent() {
  const searchParams = useSearchParams()
  const initialView = searchParams.get('view') || undefined

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <GridBackground animated />

      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div
          className="flex-1 relative mx-4 lg:mx-8 my-8 rounded-2xl border border-node-border bg-background/50 backdrop-blur-sm overflow-hidden"
          style={{ minHeight: '600px' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-node-bg/30" />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(var(--grid-line) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          <FlowChart initialViewId={initialView} />
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  )
}
