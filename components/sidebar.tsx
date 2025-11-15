'use client'

import { useContext } from 'react'
import { LayoutDashboard, FileText, Gift, Lock, Globe, Cake, LogOut, ChevronRight } from 'lucide-react'
import { SidebarContext } from './sidebar-context'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#' },
  { icon: FileText, label: 'Applications', href: '#' },
  { icon: Gift, label: 'Entitlements', href: '#' },
  { icon: Lock, label: 'Privileged', href: '#' },
  { icon: Globe, label: 'Decentralized', href: '#' },
  { icon: Cake, label: 'Birthright', href: '#' },
  { icon: LogOut, label: 'Logout', href: '#' },
]

export default function Sidebar() {
  const { isOpen } = useContext(SidebarContext)

  return (
    <>
      <div
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-md border-r border-primary/10
          transform transition-all duration-500 ease-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col overflow-y-auto
        `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <span className="font-bold text-lg text-foreground">Menu</span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {navItems.map((item, idx) => {
              const Icon = item.icon
              return (
                <a
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group btn-elevated"
                >
                  <Icon size={18} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
