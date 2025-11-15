'use client'

import { ArrowUpRight } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  change: string
  icon: string
}

export default function StatCard({ label, value, change, icon }: StatCardProps) {
  const isPending = label === 'Pending Review'

  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 group cursor-pointer btn-elevated ${isPending
        ? 'bg-gradient-to-br from-primary/5 to-primary/2 border-primary/20 hover:border-primary/40'
        : 'bg-white border-primary/10 hover:border-primary/20'
      }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-foreground/60 mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <span className="text-2xl opacity-60 group-hover:scale-110 transition-transform">{icon}</span>
      </div>

      <div className="flex items-center gap-1 text-xs text-foreground/60">
        {!isPending && <ArrowUpRight size={14} className="text-green-600" />}
        <span className={isPending ? 'text-amber-600' : 'text-green-600 font-medium'}>{change}</span>
      </div>
    </div>
  )
}
