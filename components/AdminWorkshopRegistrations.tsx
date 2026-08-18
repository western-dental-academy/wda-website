"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WorkshopRegistration {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  workshop: string;
  registeredAt: string;
  stripePaymentStatus: string;
  checkedIn: boolean;
  checkedInAt?: string;
  workshopDateId?: string;
}

export interface DateGroup {
  dateId: string;
  workshop: string;
  date: string;
  capacity: number;
  registrations: WorkshopRegistration[];
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

function downloadCSV(group: DateGroup) {
  const headers = ["Name", "Email", "Workshop", "Date", "Payment Status", "Checked In", "Checked In At"];
  const rows = group.registrations.map((r) => [
    `${r.firstName} ${r.lastName}`,
    r.email,
    r.workshop,
    fmtDate(r.registeredAt),
    r.stripePaymentStatus,
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
  onCheckIn,
}: {
  registrationId: string;
  onCheckIn: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/workshop-checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to check in");
      }
      onCheckIn(registrationId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handle}
        disabled={loading}
        className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:bg-[#4A9FD4] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#1E3560" }}
      >
        {loading ? "…" : "Check In"}
      </button>
      {error && <p className="text-[11px]" style={{ color: "#dc2626" }}>{error}</p>}
    </div>
  );
}

// ─── Group tab ─────────────────────────────────────────────────────────────────

function GroupTab({ group }: { group: DateGroup }) {
  const [registrations, setRegistrations] = useState<WorkshopRegistration[]>(
    group.registrations
  );

  const paidCount     = registrations.filter((r) => r.stripePaymentStatus === "paid").length;
  const checkedInCount = registrations.filter((r) => r.checkedIn).length;

  function handleCheckIn(id: string) {
    setRegistrations((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, checkedIn: true, checkedInAt: new Date().toISOString() } : r
      )
    );
  }

  return (
    <div>
      {/* Stats strip */}
      <div className="flex flex-wrap gap-4 mb-5">
        {[
          { label: "Capacity", value: group.capacity, colour: "#1E3560" },
          { label: "Registered", value: paidCount, colour: "#378ADD" },
          { label: "Checked In", value: checkedInCount, colour: "#22c55e" },
          { label: "Open Spots", value: Math.max(0, group.capacity - paidCount), colour: "#E67E22" },
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

        {/* CSV button */}
        <button
          onClick={() => downloadCSV({ ...group, registrations })}
          className="ml-auto rounded-xl px-5 py-3 text-xs font-bold transition-colors hover:bg-[#1E3560] hover:text-white self-center"
          style={{
            border: "1.5px solid rgba(30,53,96,0.18)",
            color: "#1E3560",
          }}
        >
          ↓ Download CSV
        </button>
      </div>

      {/* Table */}
      {registrations.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "rgba(43,48,58,0.4)" }}>
          No registrations for this date yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#F4F7F9" }}>
                {["Name", "Email", "Workshop", "Registered", "Payment", "Check In"].map((h) => (
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
                    {r.firstName} {r.lastName}
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
                  <td className="px-4 py-3">
                    {r.checkedIn ? (
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: "#22c55e" }} title="Checked in">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </span>
                        {r.checkedInAt && (
                          <span className="text-[11px]" style={{ color: "rgba(43,48,58,0.4)" }}>
                            {fmtTime(r.checkedInAt)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <CheckInButton registrationId={r._id} onCheckIn={handleCheckIn} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminWorkshopRegistrations({ groups }: { groups: DateGroup[] }) {
  const [activeTab, setActiveTab] = useState(0);

  if (groups.length === 0) {
    return (
      <div
        className="rounded-2xl bg-white overflow-hidden mb-8"
        style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
          <h2 className="text-sm font-bold" style={{ color: "#1E3560" }}>
            Workshop Registrations
          </h2>
        </div>
        <p className="px-6 py-8 text-sm text-center" style={{ color: "rgba(43,48,58,0.4)" }}>
          No workshop dates scheduled yet. Add dates in Sanity Studio under Workshops → Workshop Dates.
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
          Workshop Registrations
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

      {/* Workshop name */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(30,53,96,0.4)" }}>
          Workshop
        </p>
        <p className="text-sm font-bold" style={{ color: "#1E3560" }}>
          {activeGroup.workshop}
        </p>
      </div>

      {/* Active tab content */}
      <div className="px-6 pb-6" role="tabpanel">
        {activeGroup && <GroupTab key={activeGroup.dateId} group={activeGroup} />}
      </div>
    </div>
  );
}
