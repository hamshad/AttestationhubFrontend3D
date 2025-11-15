'use client'

import { useState } from 'react'
import { ChevronDown, CheckCircle2, Clock, XCircle, AlertCircle, Ban } from 'lucide-react'

const tableData: Record<number, Array<{ name: string; status: string }>> = {
  1: [
    { name: 'PRIVILEGED ACCOUNT ATTESTATION FOR VOID/SUSANMARTIN_R2025-06-23', status: 'Autoclosed' },
    { name: 'PRIVILEGED ACCOUNT ATTESTATION FOR CORP/SUSANMARTIN_RI06-23-2025 20:25', status: 'Autoclosed' },
    { name: 'PRIVILEGED ACCOUNT ATTESTATION FOR CORP/SUSANMARTIN_RI06-23-2025 20:26:004', status: 'Autoclosed' },
  ],
  2: [
    { name: 'DECENTRALIZED ACCOUNT ATTESTATION FOR CORP/SUSANMARTIN_RI06-23-2025 20:26:004', status: 'Completed' },
    { name: 'PRIVILEGED ACCOUNT ATTESTATION FOR CORP/SUSANMARTIN_RI06-23-2025 20:25', status: 'Pending' },
    { name: 'DECENTRALIZED ACCOUNT ATTESTATION FOR CORP/JOHNDOE_RI07-15-2025 10:10:101', status: 'Pending' },
    { name: 'DECENTRALIZED ACCOUNT ATTESTATION FOR CORP/JOHNDOE_RI07-15-2025 10:10:102', status: 'Approved' },
    { name: 'DECENTRALIZED ACCOUNT ATTESTATION FOR CORP/JOHNDOE_RI07-15-2025 10:10:103', status: 'Rejected' },
  ],
  3: [
    { name: 'BIRTHRIGHT ATTESTATION FOR PZEZ8 - ALL_PORTMOUTH_STAFF_DLL_BR', status: 'Pending' },
    { name: 'BIRTHRIGHT ATTESTATION FOR PZEZ8 11/13/2025', status: 'Pending' },
    { name: 'BIRTHRIGHT ATTESTATION FOR PZEZ8 11/13/2025 - 1', status: 'Pending' },
  ],
  4: [
    { name: 'APPLICATION ATTESTATION FOR IAM (2024-06-21)', status: 'Pending' },
    { name: 'APPLICATION ATTESTATION FOR IAM (2024-06-21)-1', status: 'Pending' },
    { name: 'APPLICATION ATTESTATION FOR IAM (2024-06-21)-2', status: 'Pending' },
  ],
}

const getStatusIcon = (status: string) => {
  const iconProps = { size: 16, className: 'flex-shrink-0' }
  switch (status) {
    case 'Completed':
      return <CheckCircle2 {...iconProps} className="text-emerald-500" />
    case 'Pending':
      return <Clock {...iconProps} className="text-primary" />
    case 'Autoclosed':
      return <Ban {...iconProps} className="text-amber-500" />
    case 'Approved':
      return <CheckCircle2 {...iconProps} className="text-green-500" />
    case 'Rejected':
      return <XCircle {...iconProps} className="text-red-500" />
    default:
      return <AlertCircle {...iconProps} className="text-foreground/40" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    case 'Pending':
      return 'bg-primary/10 text-primary border border-primary/20'
    case 'Autoclosed':
      return 'bg-amber-50 text-amber-700 border border-amber-200'
    case 'Approved':
      return 'bg-green-50 text-green-700 border border-green-200'
    case 'Rejected':
      return 'bg-red-50 text-red-700 border border-red-200'
    default:
      return 'bg-foreground/5 text-foreground/60'
  }
}

export default function DataTable({ tableId }: { tableId: number }) {
  const [expanded, setExpanded] = useState(false)
  const data = tableData[tableId] || []
  const displayData = expanded ? data : data.slice(0, 3)

  return (
    <div className="bg-white border border-primary/10 rounded-xl overflow-hidden">
      <div className="p-4 bg-white border-b border-primary/10 flex justify-between items-center">
        <h4 className="text-sm font-semibold text-foreground">Attestation Details</h4>
        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium">
          {data.length} items
        </span>
      </div>

      <div className="divide-y divide-primary/10">
        {displayData.map((item, idx) => (
          <div
            key={idx}
            className="p-4 transition-all duration-200 cursor-pointer group flex justify-between items-center gap-3 row-elevated hover:bg-primary/2"
            onClick={() => console.log('Clicked:', item.name)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getStatusIcon(item.status)}
              <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors truncate">
                {item.name}
              </p>
            </div>
            <div className="ml-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 text-center text-sm font-semibold text-primary hover:text-primary/80 bg-white hover:bg-primary/2 transition-all duration-200 flex items-center justify-center gap-2 group btn-elevated border-t border-primary/10"
        >
          <span>{expanded ? 'Show Less' : 'VIEW ALL'}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 group-hover:scale-110 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  )
}
