'use client'

import { useState, useEffect, useContext } from 'react'
import DashboardHeader from '@/components/dashboard-header'
import StatCard from '@/components/stat-card'
import AttestationCard from '@/components/attestation-card'
import DataTable from '@/components/data-table'
import Sidebar from '@/components/sidebar'
import { SidebarProvider, SidebarContext } from '@/components/sidebar-context'

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen } = useContext(SidebarContext)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  const stats = [
    { label: 'Attestations', value: '24', change: 'Increased from last month', icon: '📋' },
    { label: 'Pending Review', value: '8', change: 'On Discuss', icon: '⏳' },
    { label: 'Completed', value: '14', change: 'Increased from last month', icon: '✓' },
    { label: 'Auto-Closed', value: '2', change: 'Reduced from last month', icon: '✓' },
  ]

  const attestationData = [
    {
      id: 1,
      title: 'Privileged Attestations Overview',
      completed: 100,
      pending: 0,
      autoClosed: 0,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      title: 'Decentralized Attestations Overview',
      completed: 40,
      pending: 40,
      autoClosed: 20,
      color: 'from-emerald-400 to-blue-500',
    },
    {
      id: 3,
      title: 'Birthright Attestations Overview',
      completed: 60,
      pending: 30,
      autoClosed: 10,
      color: 'from-orange-400 to-red-500',
    },
    {
      id: 4,
      title: 'Application Attestations Overview',
      completed: 45,
      pending: 50,
      autoClosed: 5,
      color: 'from-purple-500 to-pink-500',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-primary/2 to-white">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-500 ${isOpen ? 'lg:ml-64' : ''}`}>
        <DashboardHeader />

        <main className="flex-1 p-6 md:p-8 pt-28 md:pt-32">
          <div className="max-w-7xl mx-auto">

            {/* Info Banner */}
            <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/2 border border-primary/15 animate-fade-in shadow-sm">
              <p className="text-sm text-foreground/70 leading-relaxed">
                The dashboard displays attestations mapped to their respective IAM reviews. To complete a pending attestation, click the attestation name in the corresponding tile. To view all attestations, select "VIEW ALL" at the bottom of each tile.
              </p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, idx) => (
                <div key={idx} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-in">
                  <StatCard {...stat} />
                </div>
              ))}
            </div>

            {/* Attestation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {attestationData.map((data, idx) => (
                <div key={data.id} style={{ animationDelay: `${idx * 100}ms` }} className="animate-slide-in">
                  <AttestationCard data={data} />
                  <div className="mt-6">
                    <DataTable tableId={data.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  )
}
