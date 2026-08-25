'use client'

import { useState, useMemo } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Task {
  _id: string
  title: string
  description?: string
  assignedTo?: string
  assignedBy?: string
  dueDate?: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'To Do' | 'In Progress' | 'Complete'
  createdAt: string
  completedAt?: string
}

interface Props {
  tasks: Task[]
  currentUserEmail: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STAFF_OPTIONS = [
  { label: 'Aiden',    email: 'aiden@westerndentalacademy.com' },
  { label: 'Lance',    email: 'lance@westerndentalacademy.com' },
  { label: 'Ryan',     email: 'ryan@westerndentalacademy.com' },
  { label: 'Jolene',   email: 'jolene@westerndentalacademy.com' },
  { label: 'Alana',    email: 'alana@westerndentalacademy.com' },
  { label: 'Collette', email: 'collette@westerndentalacademy.com' },
  { label: 'Tamara',   email: 'tammy@westerndentalacademy.com' },
]

const STAFF_NAME: Record<string, string> = Object.fromEntries(
  STAFF_OPTIONS.map(({ label, email }) => [email, label])
)

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Urgent: { bg: 'rgba(220,38,38,0.08)',  color: '#dc2626', border: 'rgba(220,38,38,0.2)' },
  High:   { bg: 'rgba(230,126,34,0.08)', color: '#E67E22', border: 'rgba(230,126,34,0.2)' },
  Medium: { bg: 'rgba(55,138,221,0.08)', color: '#378ADD', border: 'rgba(55,138,221,0.2)' },
  Low:    { bg: 'rgba(43,48,58,0.06)',   color: 'rgba(43,48,58,0.45)', border: 'rgba(43,48,58,0.12)' },
}

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Complete'] as const
type StatusOption = typeof STATUS_OPTIONS[number]

type TabKey          = 'all' | 'mine' | 'byMe' | 'overdue'
type StatusFilter    = 'all' | StatusOption
type PriorityFilter  = 'all' | 'High' | 'Urgent'

const BLANK_FORM = { title: '', description: '', assignedTo: '', dueDate: '', priority: 'Medium' }

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function dueDateStatus(dueDate: string | undefined, status: string) {
  if (!dueDate || status === 'Complete') return 'none'
  const t = todayStr()
  if (dueDate < t)  return 'overdue'
  if (dueDate === t) return 'today'
  return 'future'
}

function formatDueDate(dueDate: string) {
  return new Date(dueDate + 'T12:00:00').toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminTaskManager({ tasks: initialTasks, currentUserEmail }: Props) {
  const [tasks,          setTasks]         = useState<Task[]>(initialTasks)
  const [tab,            setTab]           = useState<TabKey>('all')
  const [statusFilter,   setStatusFilter]  = useState<StatusFilter>('all')
  const [priorityFilter, setPriFilter]     = useState<PriorityFilter>('all')
  const [showForm,       setShowForm]      = useState(false)
  const [expanded,       setExpanded]      = useState<Set<string>>(new Set())
  const [busy,           setBusy]          = useState<Set<string>>(new Set())
  const [formData,       setFormData]      = useState(BLANK_FORM)
  const [formError,      setFormError]     = useState('')
  const [formBusy,       setFormBusy]      = useState(false)

  // ── Filtered task list ───────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const t = todayStr()
    return tasks.filter(task => {
      if (tab === 'mine'    && task.assignedTo !== currentUserEmail) return false
      if (tab === 'byMe'   && task.assignedBy !== currentUserEmail) return false
      if (tab === 'overdue' && (
        !task.dueDate || task.status === 'Complete' || task.dueDate >= t
      )) return false
      if (statusFilter   !== 'all' && task.status   !== statusFilter)   return false
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
      return true
    })
  }, [tasks, tab, statusFilter, priorityFilter, currentUserEmail])

  // ── Actions ──────────────────────────────────────────────────────────────────

  function setItemBusy(id: string, on: boolean) {
    setBusy(prev => { const n = new Set(prev); on ? n.add(id) : n.delete(id); return n })
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    setItemBusy(id, true)
    try {
      const res = await fetch(`/api/staff/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error()
      setTasks(prev => prev.map(t => t._id === id ? { ...t, ...patch } : t))
    } catch {
      // optimistic update failed — leave state unchanged
    } finally {
      setItemBusy(id, false)
    }
  }

  async function deleteTask(id: string) {
    if (!confirm('Delete this task?')) return
    setItemBusy(id, true)
    try {
      const res = await fetch(`/api/staff/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTasks(prev => prev.filter(t => t._id !== id))
    } catch {
      setItemBusy(id, false)
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) { setFormError('Title is required.'); return }
    setFormBusy(true); setFormError('')
    try {
      const res = await fetch('/api/staff/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       formData.title.trim(),
          description: formData.description.trim() || undefined,
          assignedTo:  formData.assignedTo || undefined,
          dueDate:     formData.dueDate    || undefined,
          priority:    formData.priority,
        }),
      })
      if (!res.ok) throw new Error()
      const created: Task = await res.json()
      setTasks(prev => [created, ...prev])
      setFormData(BLANK_FORM)
      setShowForm(false)
    } catch {
      setFormError('Failed to create task. Please try again.')
    } finally {
      setFormBusy(false)
    }
  }

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
    })
  }

  function canDelete(task: Task) {
    return task.assignedBy === currentUserEmail ||
           currentUserEmail === 'aiden@westerndentalacademy.com'
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>

      {/* ── Header ── */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between gap-4"
        style={{ borderColor: 'rgba(30,53,96,0.08)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Task Manager</h2>
        <button
          onClick={() => { setShowForm(v => !v); setFormError('') }}
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:bg-[#2563EB]"
          style={{ backgroundColor: '#378ADD' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden>
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          New Task
        </button>
      </div>

      {/* ── New Task Form ── */}
      {showForm && (
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: 'rgba(30,53,96,0.08)', backgroundColor: '#F4F7F9' }}
        >
          <form onSubmit={createTask} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'rgba(30,53,96,0.5)' }}>
                  Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
                  placeholder="Task title"
                  className="w-full rounded-lg px-3 py-2 text-sm border bg-white outline-none focus:ring-2 focus:ring-[#378ADD]/25"
                  style={{ borderColor: 'rgba(30,53,96,0.18)', color: '#1E3560' }}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'rgba(30,53,96,0.5)' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                  placeholder="Optional details…"
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 text-sm border bg-white outline-none focus:ring-2 focus:ring-[#378ADD]/25 resize-none"
                  style={{ borderColor: 'rgba(30,53,96,0.18)', color: '#1E3560' }}
                />
              </div>

              {/* Assign to */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'rgba(30,53,96,0.5)' }}>
                  Assign To
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={e => setFormData(d => ({ ...d, assignedTo: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm border bg-white cursor-pointer outline-none focus:ring-2 focus:ring-[#378ADD]/25"
                  style={{ borderColor: 'rgba(30,53,96,0.18)', color: '#1E3560' }}
                >
                  <option value="">Unassigned</option>
                  {STAFF_OPTIONS.map(s => (
                    <option key={s.email} value={s.email}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'rgba(30,53,96,0.5)' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData(d => ({ ...d, dueDate: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm border bg-white cursor-pointer outline-none focus:ring-2 focus:ring-[#378ADD]/25"
                  style={{ borderColor: 'rgba(30,53,96,0.18)', color: '#1E3560' }}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'rgba(30,53,96,0.5)' }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData(d => ({ ...d, priority: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm border bg-white cursor-pointer outline-none focus:ring-2 focus:ring-[#378ADD]/25"
                  style={{ borderColor: 'rgba(30,53,96,0.18)', color: '#1E3560' }}
                >
                  {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-xs mb-3" style={{ color: '#dc2626' }}>{formError}</p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={formBusy}
                className="rounded-lg px-5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors duration-150 hover:bg-[#15294a]"
                style={{ backgroundColor: '#1E3560' }}
              >
                {formBusy ? 'Creating…' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); setFormData(BLANK_FORM) }}
                className="rounded-lg px-5 py-2 text-xs font-semibold transition-colors duration-150 hover:bg-[#e0e8f0]"
                style={{ color: 'rgba(30,53,96,0.55)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filters ── */}
      <div
        className="px-6 pt-4 pb-3 border-b flex flex-wrap gap-3 items-center justify-between"
        style={{ borderColor: 'rgba(30,53,96,0.08)' }}
      >
        {/* Tab pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {([
            { key: 'all',     label: 'All'            },
            { key: 'mine',    label: 'My Tasks'        },
            { key: 'byMe',    label: 'Assigned by Me'  },
            { key: 'overdue', label: 'Overdue'         },
          ] as { key: TabKey; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150"
              style={tab === key
                ? { backgroundColor: '#1E3560', color: '#ffffff' }
                : { backgroundColor: 'rgba(30,53,96,0.07)', color: 'rgba(30,53,96,0.55)' }}
            >
              {label}
              {key === 'overdue' && (() => {
                const t = todayStr()
                const n = tasks.filter(task => task.dueDate && task.dueDate < t && task.status !== 'Complete').length
                return n > 0 ? (
                  <span
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                    style={{ backgroundColor: '#dc2626', color: '#fff' }}
                  >
                    {n}
                  </span>
                ) : null
              })()}
            </button>
          ))}
        </div>

        {/* Status + priority dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg px-2.5 py-1.5 text-xs border bg-white cursor-pointer outline-none"
            style={{ borderColor: 'rgba(30,53,96,0.15)', color: 'rgba(30,53,96,0.65)' }}
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Complete">Complete</option>
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriFilter(e.target.value as PriorityFilter)}
            className="rounded-lg px-2.5 py-1.5 text-xs border bg-white cursor-pointer outline-none"
            style={{ borderColor: 'rgba(30,53,96,0.15)', color: 'rgba(30,53,96,0.65)' }}
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* ── Task List ── */}
      <div className="p-4 flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <p className="text-center py-10 text-sm" style={{ color: 'rgba(43,48,58,0.38)' }}>
            {tasks.length === 0 ? 'No tasks yet — create one above.' : 'No tasks match these filters.'}
          </p>
        )}

        {filtered.map(task => {
          const dSt       = dueDateStatus(task.dueDate, task.status)
          const isComplete = task.status === 'Complete'
          const isBusy     = busy.has(task._id)
          const isExpanded = expanded.has(task._id)
          const pStyle     = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.Medium
          const longDesc   = (task.description?.length ?? 0) > 120

          return (
            <div
              key={task._id}
              className="rounded-xl p-4 transition-all duration-200"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid rgba(30,53,96,0.09)',
                borderLeft: dSt === 'overdue' ? '4px solid #dc2626' : '1.5px solid rgba(30,53,96,0.09)',
                opacity: isComplete ? 0.52 : 1,
              }}
            >
              <div className="flex items-start gap-3">

                {/* Left: content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <p
                    className="text-sm font-bold leading-snug"
                    style={{
                      color: '#1E3560',
                      textDecoration: isComplete ? 'line-through' : 'none',
                      textDecorationColor: 'rgba(30,53,96,0.35)',
                    }}
                  >
                    {task.title}
                  </p>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(43,48,58,0.58)' }}>
                      {isExpanded ? task.description : task.description.slice(0, 120)}
                      {longDesc && (
                        <button
                          onClick={() => toggleExpanded(task._id)}
                          className="ml-1 font-semibold hover:underline"
                          style={{ color: '#378ADD' }}
                        >
                          {isExpanded ? 'less' : '…more'}
                        </button>
                      )}
                    </p>
                  )}

                  {/* Meta pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {/* Assigned to */}
                    {task.assignedTo && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(30,53,96,0.07)', color: '#1E3560' }}
                      >
                        → {STAFF_NAME[task.assignedTo] ?? task.assignedTo}
                      </span>
                    )}

                    {/* Priority */}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}` }}
                    >
                      {task.priority}
                    </span>

                    {/* Due date */}
                    {task.dueDate && (
                      <span
                        className="text-[10px] font-semibold"
                        style={{
                          color: dSt === 'overdue' ? '#dc2626'
                               : dSt === 'today'   ? '#E67E22'
                               : 'rgba(43,48,58,0.42)',
                        }}
                      >
                        {dSt === 'overdue' && '⚠ '}
                        {dSt === 'today' ? 'Due today' : `Due ${formatDueDate(task.dueDate)}`}
                      </span>
                    )}

                    {/* Assigned by */}
                    {task.assignedBy && task.assignedBy !== currentUserEmail && (
                      <span className="text-[10px]" style={{ color: 'rgba(43,48,58,0.32)' }}>
                        from {STAFF_NAME[task.assignedBy] ?? task.assignedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: controls */}
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">

                  {/* Status dropdown */}
                  <select
                    value={task.status}
                    disabled={isBusy}
                    onChange={e => {
                      const s = e.target.value as StatusOption
                      updateTask(task._id, {
                        status: s,
                        ...(s === 'Complete' ? { completedAt: new Date().toISOString() } : {}),
                      })
                    }}
                    className="rounded-lg px-2 py-1.5 text-[10px] font-semibold border cursor-pointer outline-none disabled:opacity-40"
                    style={{
                      borderColor: 'rgba(30,53,96,0.15)',
                      color: task.status === 'Complete'   ? '#16a34a'
                           : task.status === 'In Progress' ? '#378ADD'
                           : 'rgba(43,48,58,0.55)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {/* Complete checkmark */}
                  {!isComplete && (
                    <button
                      onClick={() => updateTask(task._id, { status: 'Complete', completedAt: new Date().toISOString() })}
                      disabled={isBusy}
                      title="Mark complete"
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[#dcfce7] disabled:opacity-40"
                      style={{ color: '#16a34a' }}
                      aria-label="Mark task complete"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    </button>
                  )}

                  {/* Delete */}
                  {canDelete(task) && (
                    <button
                      onClick={() => deleteTask(task._id)}
                      disabled={isBusy}
                      title="Delete task"
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[#fee2e2] disabled:opacity-40"
                      style={{ color: 'rgba(220,38,38,0.55)' }}
                      aria-label="Delete task"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                        <path fillRule="evenodd" clipRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
