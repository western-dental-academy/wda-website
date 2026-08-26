'use client'

import { useState } from 'react'
import AdminTaskManager, { type Task } from '@/components/AdminTaskManager'
import AdminStaffCalendar from '@/components/AdminStaffCalendar'
import AdminStudentTable from '@/components/AdminStudentTable'
import AdminAnnouncements from '@/components/AdminAnnouncements'
import AdminWorkshopDates, { type WorkshopDateItem } from '@/components/AdminWorkshopDates'
import AdminWorkshopRegistrations, {
  type DateGroup,
  type WorkshopRegistration,
  type WorkshopWaitlistEntry,
} from '@/components/AdminWorkshopRegistrations'
import AdminStaffPanel, { type ClockEntry, type PendingTimeOff } from '@/components/AdminStaffPanel'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Stats {
  total: number
  pending: number
  accepted: number
  enrolled: number
  paid: number
}

interface AdminTabsProps {
  stats: Stats
  tasks: Task[]
  currentUserEmail: string
  staffTimeOff: any[]
  workshopDates: any[]
  students: any[]
  announcements: any[]
  programmes: any[]
  referralData: [string, number][]
  canViewFinancials: boolean
  workshopRegs: WorkshopRegistration[]
  workshopWaitlist: WorkshopWaitlistEntry[]
  dateGroups: DateGroup[]
  totalRevenue: number
  thisMonthRevenue: number
  outstandingBalance: number
  clockEntries: ClockEntry[]
  pendingTimeOff: PendingTimeOff[]
}

type TabId = 'Overview' | 'Students' | 'Staff' | 'Professional Development' | 'Revenue'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCAD(dollars: number): string {
  return '$' + dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminTabs({
  stats,
  tasks,
  currentUserEmail,
  staffTimeOff,
  workshopDates,
  students,
  announcements,
  programmes,
  referralData,
  canViewFinancials,
  workshopRegs,
  workshopWaitlist,
  dateGroups,
  totalRevenue,
  thisMonthRevenue,
  outstandingBalance,
  clockEntries,
  pendingTimeOff,
}: AdminTabsProps) {
  const tabs: TabId[] = canViewFinancials
    ? ['Overview', 'Students', 'Staff', 'Professional Development', 'Revenue']
    : ['Overview', 'Students', 'Staff', 'Professional Development']

  const [activeTab, setActiveTab] = useState<TabId>('Overview')

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* ── Tab bar ── */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 mb-8"
        role="tablist"
        aria-label="Admin sections"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className="shrink-0 rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-150"
            style={{
              backgroundColor: activeTab === tab ? '#1E3560' : 'rgba(30,53,96,0.06)',
              color: activeTab === tab ? '#ffffff' : 'rgba(30,53,96,0.6)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'Overview' && (
        <div>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            {[
              { label: 'Total Applications', value: stats.total,   colour: '#1E3560' },
              { label: 'Pending Review',     value: stats.pending,  colour: '#E67E22' },
              { label: 'Accepted',           value: stats.accepted, colour: '#378ADD' },
              { label: 'Enrolled',           value: stats.enrolled, colour: '#22c55e' },
              { label: 'Payments Received',  value: stats.paid,     colour: '#16a34a' },
            ].map(({ label, value, colour }) => (
              <div key={label} className="rounded-xl p-5 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
                <p className="text-3xl font-bold mb-1" style={{ color: colour }}>{value}</p>
                <p className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>{label}</p>
              </div>
            ))}
          </div>

          <AdminTaskManager tasks={tasks} currentUserEmail={currentUserEmail} />
          <AdminStaffCalendar requests={staffTimeOff} workshopDates={workshopDates} />
        </div>
      )}

      {/* ── Students ── */}
      {activeTab === 'Students' && (
        <div>
          <AdminStudentTable students={students} canViewFinancials={canViewFinancials} />
          <AdminAnnouncements initialAnnouncements={announcements} programmes={programmes} />

          {referralData.length > 0 && (
            <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
                <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Referral Sources</h2>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {referralData.map(([source, count]) => {
                  const pct = Math.round((count / students.length) * 100)
                  return (
                    <div key={source}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm" style={{ color: '#1E3560' }}>{source}</span>
                        <span className="text-sm font-bold" style={{ color: '#378ADD' }}>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(30,53,96,0.08)' }}>
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: '#378ADD' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Staff ── */}
      {activeTab === 'Staff' && (
        <AdminStaffPanel clockEntries={clockEntries} pendingTimeOff={pendingTimeOff} currentUserEmail={currentUserEmail} />
      )}

      {/* ── Professional Development ── */}
      {activeTab === 'Professional Development' && (
        <div>
          <AdminWorkshopDates
            initialDates={workshopDates as WorkshopDateItem[]}
            registrations={workshopRegs}
            waitlist={workshopWaitlist}
          />
          <AdminWorkshopRegistrations groups={dateGroups} canViewFinancials={canViewFinancials} />
        </div>
      )}

      {/* ── Revenue ── */}
      {activeTab === 'Revenue' && canViewFinancials && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Revenue Collected', value: formatCAD(totalRevenue),       colour: '#1E3560' },
              { label: "This Month's Revenue",    value: formatCAD(thisMonthRevenue),   colour: '#378ADD' },
              { label: 'Outstanding Balance',     value: formatCAD(outstandingBalance), colour: '#E67E22' },
              { label: 'Paid Students',           value: String(stats.paid),            colour: '#22c55e' },
            ].map(({ label, value, colour }) => (
              <div key={label} className="rounded-xl p-5 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
                <p className="text-3xl font-bold mb-1" style={{ color: colour }}>{value}</p>
                <p className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
