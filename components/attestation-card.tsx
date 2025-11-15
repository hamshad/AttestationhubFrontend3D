'use client'

import { useRef } from 'react'
import PieChart3D from './pie-chart-3d'

interface AttestationData {
  id: number
  title: string
  completed: number
  pending: number
  autoClosed: number
  color: string
}

export default function AttestationCard({ data }: { data: AttestationData }) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="group relative bg-white border border-primary/10 rounded-xl overflow-hidden hover:border-primary/20 transition-all duration-300 hover:shadow-lg btn-elevated"
    >
      <div className="relative p-6">
        <h3 className="text-lg font-bold text-foreground mb-6">
          {data.title}
        </h3>

        <div className="mb-8 flex justify-center">
          <PieChart3D
            completed={data.completed}
            pending={data.pending}
            autoClosed={data.autoClosed}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-white border border-primary/10 rounded-lg hover:bg-primary/5 transition-all duration-200 cursor-pointer group/item btn-elevated">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 group-hover/item:scale-125 transition-transform" />
              <span className="text-foreground/60 text-xs">Completed</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.completed}%</p>
          </div>
          <div className="p-3 bg-white border border-primary/10 rounded-lg hover:bg-primary/5 transition-all duration-200 cursor-pointer group/item btn-elevated">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-foreground/60 text-xs">Pending</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.pending}%</p>
          </div>
          <div className="p-3 bg-white border border-primary/10 rounded-lg hover:bg-primary/5 transition-all duration-200 cursor-pointer group/item btn-elevated">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 group-hover/item:scale-125 transition-transform" />
              <span className="text-foreground/60 text-xs">Auto Closed</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.autoClosed}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
