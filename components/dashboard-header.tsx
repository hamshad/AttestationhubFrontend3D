'use client'

import { Search, Bell, User, Menu, X } from 'lucide-react'
import { useState, useContext } from 'react'
import { SidebarContext } from './sidebar-context'

export default function DashboardHeader() {
  const [showSearch, setShowSearch] = useState(false)
  const { isOpen, setIsOpen } = useContext(SidebarContext)

  return (
    <header className={`
      bg-white/80 backdrop-blur-xl border border-primary/10 
      fixed top-6 z-50 rounded-2xl shadow-lg transition-all duration-500
      ${isOpen ? 'left-6 right-80 lg:left-72 lg:right-6' : 'left-6 right-6'}
    `}>
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between gap-4">
        {/* Left side with hamburger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors btn-elevated"
            title="Toggle menu"
          >
            {isOpen ? (
              <X size={20} className="text-primary" />
            ) : (
              <Menu size={20} className="text-primary" />
            )}
          </button>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-xs text-foreground/60 mt-0.5">Manage and monitor all attestations</p>
          </div>
        </div>

        {/* Right side - Search, Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/10 bg-white/60 hover:bg-white/80 transition-all duration-200 group btn-elevated">
            <Search size={18} className="text-foreground/50 group-hover:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search attestations..."
              className="bg-transparent outline-none text-sm text-foreground placeholder-foreground/40 w-48"
            />
          </div>

          {/* Mobile Search Icon */}
          <button className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors btn-elevated">
            <Search size={20} className="text-primary" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-primary/10 rounded-lg transition-colors btn-elevated">
            <Bell size={20} className="text-foreground/60 hover:text-primary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 pl-2 pr-4 py-2 rounded-lg border border-primary/10 bg-white hover:bg-white/80 transition-all duration-200 group btn-elevated">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground">User</p>
              <p className="text-xs text-foreground/60">Admin</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
