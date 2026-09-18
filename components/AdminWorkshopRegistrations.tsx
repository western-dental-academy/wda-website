"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WorkshopRegistration {
  _id: string;
  firstName: string;
  lastName: string;
  pronouns?: string;
  mediaConsent?: boolean;
  newsletterOptIn?: boolean;
  email: string;
  workshop: string;
  registeredAt: string;
  stripePaymentStatus: string;
  checkedIn: boolean;
  checkedInAt?: string;
  workshopDateId?: string;
  certificateSent?: boolean;
  deliveryMethod?: string;
  dietaryRestrictions?: string;
}

export interface WorkshopWaitlistEntry {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  workshopDateId: string;
  joinedAt: string;
  notified: boolean;
  notifiedAt?: string;
}

export interface DateGroup {
  dateId: string;
  workshop: string;
  date: string;
  capacity: number;
  registrations: WorkshopRegistration[];
  waitlist: WorkshopWaitlistEntry[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "America/Edmonton",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-CA", {
    timeZone: "America/Edmonton",
    hour: "numeric",
    minute: "2-digit",
  });
}

function downloadCSV(group: DateGroup, canViewFinancials: boolean) {
  const headers = ["Name", "Email", "Workshop", "Date", ...(canViewFinancials ? ["Payment Status"] : []), "Checked In", "Checked In At"];
  const rows = group.registrations.map((r) => [
    `${r.firstName} ${r.lastName}`,
    r.email,
    r.workshop,
    fmtDate(r.registeredAt),
    ...(canViewFinancials ? [r.stripePaymentStatus] : []),
    r.checkedIn ? "Yes" : "No",
    r.checkedInAt ? fmtDate(r.checkedInAt) + " " + fmtTime(r.checkedInAt) : "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateLabel = fmtDate(group.date).replace(/,/g, "").replace(/\s+/g, "-");
  a.href = url;
  a.download = `workshop-registrations-${dateLabel}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Check-in button ───────────────────────────────────────────────────────────

function CheckInButton({
  registrationId,
  checkedIn,
  checkedInAt,
  onToggle,
}: {
  registrationId: string;
  checkedIn: boolean;
  checkedInAt?: string;
  onToggle: (id: string, newValue: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    const newValue = !checkedIn;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/workshop-checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, checkedIn: newValue }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to update check-in");
      }
      onToggle(registrationId, newValue);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {checkedIn ? (
        <div className="flex items-center gap-1.5">
          {checkedInAt && (
            <span className="text-[11px]" style={{ color: "rgba(43,48,58,0.4)" }}>
              {fmtTime(checkedInAt)}
            </span>
          )}
          <button
            onClick={handle}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "rgba(43,48,58,0.08)", color: "rgba(43,48,58,0.55)" }}
          >
            {loading ? "…" : "✕ Undo Check In"}
          </button>
        </div>
      ) : (
        <button
          onClick={handle}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#22c55e" }}
        >
          {loading ? "…" : "Check In"}
        </button>
      )}
      {error && <p className="text-[11px]" style={{ color: "#dc2626" }}>{error}</p>}
    </div>
  );
}

// ─── Notify waitlist button ────────────────────────────────────────────────────

function NotifyButton({ entry, workshop, workshopDate, onNotified }: {
  entry: WorkshopWaitlistEntry;
  workshop: string;
  workshopDate: string;
  onNotified: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handle() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/workshop-waitlist-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waitlistId:     entry._id,
          firstName:      entry.firstName,
          lastName:       entry.lastName,
          recipientEmail: entry.email,
          workshop,
          workshopDate,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'Failed to notify');
      }
      onNotified(entry._id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handle}
        disabled={loading}
        className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:bg-[#CF6D17] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#E67E22' }}
      >
        {loading ? '…' : 'Notify'}
      </button>
      {error && <p className="text-[11px]" style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  );
}

// ─── Per-registrant newsletter invite button ──────────────────────────────────

function InviteButton({ registrantId, onSent }: { registrantId: string; onSent: (id: string) => void }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function handle() {
    setStatus('sending');
    try {
      const res = await fetch('/api/admin/newsletter-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrantIds: [registrantId] }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'Failed to send invite');
      }
      setStatus('done');
      onSent(registrantId);
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: 'rgba(55,138,221,0.12)', color: '#378ADD' }}>
        Invite Sent
      </span>
    );
  }

  return (
    <button
      onClick={handle}
      disabled={status === 'sending'}
      className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors hover:bg-[#378ADD] hover:text-white disabled:opacity-50"
      style={{ borderColor: '#378ADD', color: '#378ADD' }}
    >
      {status === 'sending' ? '…' : status === 'error' ? 'Retry' : 'Invite'}
    </button>
  );
}

// ─── Group tab ─────────────────────────────────────────────────────────────────

function GroupTab({ group, canViewFinancials }: { group: DateGroup; canViewFinancials: boolean }) {
  const [registrations, setRegistrations] = useState<WorkshopRegistration[]>(
    group.registrations
  );
  const [waitlist, setWaitlist] = useState<WorkshopWaitlistEntry[]>(group.waitlist);
  const [subTab, setSubTab] = useState<'registrations' | 'waitlist'>('registrations');
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'confirming' | 'sending' | 'done' | 'error'>('idle');
  const [bulkResult, setBulkResult] = useState<{ sent: number; skipped: number; alreadySubscribed: number } | null>(null);

  const paidCount     = registrations.filter((r) => r.stripePaymentStatus === "paid").length;
  const checkedInCount = registrations.filter((r) => r.checkedIn).length;

  function handleInviteSent(id: string) {
    setInvitedIds(prev => new Set([...prev, id]));
  }

  async function handleBulkInvite() {
    setBulkStatus('sending');
    setBulkResult(null);
    try {
      const uninvitedIds = registrations
        .filter(r => !r.newsletterOptIn && !invitedIds.has(r._id))
        .map(r => r._id);
      if (uninvitedIds.length === 0) {
        setBulkResult({ sent: 0, skipped: 0, alreadySubscribed: 0 });
        setBulkStatus('done');
        return;
      }
      const res = await fetch('/api/admin/newsletter-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrantIds: uninvitedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setInvitedIds(prev => new Set([...prev, ...uninvitedIds]));
      setBulkResult({ sent: data.sent, skipped: data.skipped, alreadySubscribed: data.alreadySubscribed ?? 0 });
      setBulkStatus('done');
    } catch {
      setBulkStatus('error');
    }
  }

  function handleToggleCheckIn(id: string, newValue: boolean) {
    setRegistrations((prev) =>
      prev.map((r) =>
        r._id === id
          ? {
              ...r,
              checkedIn: newValue,
              checkedInAt: newValue ? new Date().toISOString() : undefined,
              certificateSent: newValue ? r.certificateSent : false,
            }
          : r
      )
    );
  }

  function handleNotified(id: string) {
    setWaitlist(prev =>
      prev.map(e => e._id === id ? { ...e, notified: true, notifiedAt: new Date().toISOString() } : e)
    );
  }

  const workshopDateDisplay = fmtDate(group.date);

  return (
    <div>
      {/* Stats strip */}
      <div className="flex flex-wrap gap-4 mb-5">
        {[
          { label: "Capacity", value: group.capacity, colour: "#1E3560" },
          { label: "Registered", value: paidCount, colour: "#378ADD" },
          { label: "Checked In", value: checkedInCount, colour: "#22c55e" },
          { label: "Open Spots", value: Math.max(0, group.capacity - paidCount), colour: "#E67E22" },
          { label: "Waitlisted", value: waitlist.length, colour: "#8b5cf6" },
        ].map(({ label, value, colour }) => (
          <div
            key={label}
            className="rounded-xl px-5 py-3 bg-white"
            style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}
          >
            <p className="text-xl font-bold" style={{ color: colour }}>{value}</p>
            <p className="text-[11px]" style={{ color: "rgba(43,48,58,0.5)" }}>{label}</p>
          </div>
        ))}

        {/* CSV + invite buttons */}
        {subTab === 'registrations' && (
          <div className="ml-auto flex items-center gap-2 self-center flex-wrap">
            {/* Bulk newsletter invite */}
            {bulkStatus === 'idle' && (
              <button
                onClick={() => setBulkStatus('confirming')}
                className="rounded-xl px-5 py-3 text-xs font-bold text-white transition-colors"
                style={{ backgroundColor: '#378ADD' }}
              >
                ✉ Send Newsletter Invites
              </button>
            )}
            {bulkStatus === 'confirming' && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs" style={{ backgroundColor: 'rgba(55,138,221,0.08)', border: '1.5px solid rgba(55,138,221,0.3)' }}>
                <span style={{ color: '#1E3560' }}>Send to all non-opted-in registrants?</span>
                <button
                  onClick={handleBulkInvite}
                  className="rounded-lg px-3 py-1 font-bold text-white"
                  style={{ backgroundColor: '#378ADD' }}
                >
                  Send
                </button>
                <button
                  onClick={() => setBulkStatus('idle')}
                  className="rounded-lg px-3 py-1 font-semibold"
                  style={{ color: 'rgba(30,53,96,0.55)', border: '1px solid rgba(30,53,96,0.15)' }}
                >
                  Cancel
                </button>
              </div>
            )}
            {bulkStatus === 'sending' && (
              <span className="text-xs px-4 py-3" style={{ color: 'rgba(43,48,58,0.55)' }}>Sending invites…</span>
            )}
            {bulkStatus === 'done' && bulkResult && (
              <span className="text-xs px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)', color: '#15803d' }}>
                ✓ Sent {bulkResult.sent} invite{bulkResult.sent !== 1 ? 's' : ''}
                {bulkResult.alreadySubscribed > 0 ? ` · ${bulkResult.alreadySubscribed} already subscribed` : ''}
                {bulkResult.skipped > 0 ? ` · ${bulkResult.skipped} skipped` : ''}
              </span>
            )}
            {bulkStatus === 'error' && (
              <span className="text-xs px-4 py-3 rounded-xl cursor-pointer" style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }} onClick={() => setBulkStatus('idle')}>
                Error — click to retry
              </span>
            )}

            <button
              onClick={() => downloadCSV({ ...group, registrations }, canViewFinancials)}
              className="rounded-xl px-5 py-3 text-xs font-bold transition-colors hover:bg-[#1E3560] hover:text-white"
              style={{ border: "1.5px solid rgba(30,53,96,0.18)", color: "#1E3560" }}
            >
              ↓ Download CSV
            </button>
          </div>
        )}
      </div>

      {/* Sub-tab selector */}
      <div className="flex gap-1 mb-5">
        {(['registrations', 'waitlist'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className="rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-150 capitalize"
            style={{
              backgroundColor: subTab === tab ? '#1E3560' : 'rgba(30,53,96,0.06)',
              color: subTab === tab ? '#ffffff' : 'rgba(30,53,96,0.6)',
            }}
          >
            {tab === 'registrations' ? `Registrations (${registrations.length})` : `Waitlist (${waitlist.length})`}
          </button>
        ))}
      </div>

      {/* Registrations table */}
      {subTab === 'registrations' && (registrations.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "rgba(43,48,58,0.4)" }}>
          No registrations for this date yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#F4F7F9" }}>
                {["Name", "Email", "Workshop", "Registered", ...(canViewFinancials ? ["Payment"] : []), "Check In"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "rgba(30,53,96,0.45)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {registrations.map((r) => (
                <tr key={r._id} style={{ borderBottom: "1px solid rgba(30,53,96,0.06)" }}>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "#1E3560" }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{r.firstName} {r.lastName}</span>
                      {r.deliveryMethod === 'virtual' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(55,138,221,0.12)", color: "#378ADD" }}>Virtual</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(13,59,110,0.08)", color: "#0D3B6E" }}>In-Person</span>
                      )}
                    </div>
                    {r.pronouns && (
                      <span className="block text-[11px] font-normal mt-0.5" style={{ color: "rgba(43,48,58,0.45)" }}>
                        {r.pronouns}
                      </span>
                    )}
                    {r.mediaConsent && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
                        Media OK
                      </span>
                    )}
                    {r.newsletterOptIn && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>
                        Newsletter
                      </span>
                    )}
                    {!r.newsletterOptIn && !invitedIds.has(r._id) && (
                      <InviteButton registrantId={r._id} onSent={handleInviteSent} />
                    )}
                    {!r.newsletterOptIn && invitedIds.has(r._id) && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: 'rgba(55,138,221,0.12)', color: '#378ADD' }}>
                        Invite Sent
                      </span>
                    )}
                    {r.dietaryRestrictions && (
                      <span className="block text-[11px] font-normal mt-0.5" style={{ color: "rgba(43,48,58,0.55)" }}>
                        Dietary: {r.dietaryRestrictions}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "rgba(43,48,58,0.65)" }}>
                    {r.email}
                  </td>
                  <td className="px-4 py-3" style={{ color: "rgba(43,48,58,0.65)", maxWidth: 220 }}>
                    {r.workshop}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "rgba(43,48,58,0.55)" }}>
                    {fmtDate(r.registeredAt)}
                  </td>
                  {canViewFinancials && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize"
                        style={{
                          backgroundColor:
                            r.stripePaymentStatus === "paid"
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(230,126,34,0.1)",
                          color:
                            r.stripePaymentStatus === "paid" ? "#16a34a" : "#E67E22",
                        }}
                      >
                        {r.stripePaymentStatus}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckInButton
                        registrationId={r._id}
                        checkedIn={r.checkedIn}
                        checkedInAt={r.checkedInAt}
                        onToggle={handleToggleCheckIn}
                      />
                      {r.certificateSent && (
                        <span title="Certificate sent" className="text-base leading-none">🎓</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Waitlist table */}
      {subTab === 'waitlist' && (waitlist.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "rgba(43,48,58,0.4)" }}>
          No one on the waitlist for this date.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#F4F7F9" }}>
                {["Name", "Email", "Phone", "Joined", "Status", "Notify"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "rgba(30,53,96,0.45)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {waitlist.map((e) => (
                <tr key={e._id} style={{ borderBottom: "1px solid rgba(30,53,96,0.06)" }}>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "#1E3560" }}>
                    {e.firstName} {e.lastName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "rgba(43,48,58,0.65)" }}>
                    {e.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "rgba(43,48,58,0.55)" }}>
                    {e.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "rgba(43,48,58,0.55)" }}>
                    {fmtDate(e.joinedAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {e.notified ? (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a" }}
                      >
                        Notified {e.notifiedAt ? fmtDate(e.notifiedAt) : ''}
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        style={{ backgroundColor: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}
                      >
                        Waiting
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.notified ? (
                      <span className="text-[11px]" style={{ color: "rgba(43,48,58,0.35)" }}>Sent</span>
                    ) : (
                      <NotifyButton
                        entry={e}
                        workshop={group.workshop}
                        workshopDate={workshopDateDisplay}
                        onNotified={handleNotified}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminWorkshopRegistrations({ groups, canViewFinancials }: { groups: DateGroup[]; canViewFinancials: boolean }) {
  const [activeTab, setActiveTab] = useState(0);

  if (groups.length === 0) {
    return (
      <div
        className="rounded-2xl bg-white overflow-hidden mb-8"
        style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
          <h2 className="text-sm font-bold" style={{ color: "#1E3560" }}>
            PD Registrations
          </h2>
        </div>
        <p className="px-6 py-8 text-sm text-center" style={{ color: "rgba(43,48,58,0.4)" }}>
          No event dates scheduled yet. Add dates in Sanity Studio under Events → Workshop Dates.
        </p>
      </div>
    );
  }

  const activeGroup = groups[activeTab];

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden mb-8"
      style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
        <h2 className="text-sm font-bold" style={{ color: "#1E3560" }}>
          PD Registrations
        </h2>
      </div>

      {/* Date tabs */}
      <div
        className="flex flex-wrap gap-1 px-6 pt-4 pb-2 border-b"
        style={{ borderColor: "rgba(30,53,96,0.08)" }}
        role="tablist"
        aria-label="Workshop date tabs"
      >
        {groups.map((g, i) => {
          const active = activeTab === i;
          const paidCount = g.registrations.filter((r) => r.stripePaymentStatus === "paid").length;
          return (
            <button
              key={g.dateId}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(i)}
              className="rounded-lg px-4 py-2 text-xs font-bold transition-all duration-150"
              style={{
                backgroundColor: active ? "#1E3560" : "rgba(30,53,96,0.06)",
                color: active ? "#ffffff" : "rgba(30,53,96,0.6)",
              }}
            >
              {fmtDate(g.date)}
              <span
                className="ml-2 rounded-full px-1.5 py-0.5 text-[10px]"
                style={{
                  backgroundColor: active ? "rgba(255,255,255,0.2)" : "rgba(30,53,96,0.1)",
                  color: active ? "#ffffff" : "rgba(30,53,96,0.55)",
                }}
              >
                {paidCount}/{g.capacity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Event name */}
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(30,53,96,0.4)" }}>
          Event
        </p>
        <p className="text-sm font-bold" style={{ color: "#1E3560" }}>
          {activeGroup.workshop}
        </p>
      </div>

      {/* Active tab content */}
      <div className="px-6 pb-6" role="tabpanel">
        {activeGroup && <GroupTab key={activeGroup.dateId} group={activeGroup} canViewFinancials={canViewFinancials} />}
      </div>
    </div>
  );
}
