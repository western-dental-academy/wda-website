"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

// Type-to-search picker for "Which dental office do you work at?".
// Picking a listed office sets officeId; anything else typed is kept as officeOther.

export interface OfficeOption {
  _id: string;
  name: string;
  city?: string;
}

export interface OfficeValue {
  officeId: string;
  officeOther: string;
}

function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export default function OfficePicker({
  id,
  value,
  onChange,
}: {
  id: string;
  value: OfficeValue;
  onChange: (v: OfficeValue) => void;
}) {
  const listId = useId();
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [query, setQuery] = useState(value.officeOther);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/offices")
      .then(r => (r.ok ? r.json() : []))
      .then((data: OfficeOption[]) => setOffices(Array.isArray(data) ? data : []))
      .catch(() => setOffices([]));
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = offices.find(o => o._id === value.officeId) ?? null;

  const matches = useMemo(() => {
    const q = fold(query);
    if (!q) return [];
    const words = q.split(" ");
    return offices
      .filter(o => {
        const hay = fold(`${o.name} ${o.city ?? ""}`);
        return words.every(w => hay.includes(w));
      })
      .slice(0, 8);
  }, [offices, query]);

  // Options: listed matches, then "not listed" if they've typed something
  const showOther = query.trim().length > 0;
  const optionCount = matches.length + (showOther ? 1 : 0);

  function pick(o: OfficeOption) {
    onChange({ officeId: o._id, officeOther: "" });
    setQuery("");
    setOpen(false);
  }

  function keepTyped() {
    onChange({ officeId: "", officeOther: query.trim() });
    setOpen(false);
  }

  function clear() {
    onChange({ officeId: "", officeOther: "" });
    setQuery("");
  }

  if (selected) {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-lg px-4 py-3"
        style={{ backgroundColor: "rgba(74,159,212,0.08)", border: "1.5px solid rgba(74,159,212,0.35)" }}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#1E3560" }}>{selected.name}</p>
          {selected.city && <p className="text-xs" style={{ color: "rgba(43,48,58,0.55)" }}>{selected.city}</p>}
        </div>
        <button type="button" onClick={clear} className="shrink-0 text-xs font-semibold underline" style={{ color: "#378ADD" }}>
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open && optionCount > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && optionCount > 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder="Start typing your office name or city"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
          // Keep whatever they type as a fallback until they pick something
          onChange({ officeId: "", officeOther: e.target.value.trim() });
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (!open || optionCount === 0) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => (a + 1) % optionCount); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => (a - 1 + optionCount) % optionCount); }
          else if (e.key === "Enter") {
            e.preventDefault();
            if (active < matches.length) pick(matches[active]);
            else keepTyped();
          } else if (e.key === "Escape") setOpen(false);
        }}
        className="wda-input"
      />
      {open && optionCount > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 rounded-lg bg-white overflow-hidden max-h-72 overflow-y-auto"
          style={{ border: "1.5px solid rgba(30,53,96,0.12)", boxShadow: "0 8px 24px rgba(30,53,96,0.12)" }}
        >
          {matches.map((o, i) => (
            <li
              key={o._id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={active === i}
              onMouseDown={e => { e.preventDefault(); pick(o); }}
              onMouseEnter={() => setActive(i)}
              className="px-4 py-2.5 cursor-pointer"
              style={{ backgroundColor: active === i ? "rgba(74,159,212,0.1)" : undefined }}
            >
              <span className="block text-sm font-semibold" style={{ color: "#1E3560" }}>{o.name}</span>
              {o.city && <span className="block text-xs" style={{ color: "rgba(43,48,58,0.55)" }}>{o.city}</span>}
            </li>
          ))}
          {showOther && (
            <li
              id={`${listId}-${matches.length}`}
              role="option"
              aria-selected={active === matches.length}
              onMouseDown={e => { e.preventDefault(); keepTyped(); }}
              onMouseEnter={() => setActive(matches.length)}
              className="px-4 py-2.5 cursor-pointer text-sm"
              style={{
                color: "rgba(43,48,58,0.7)",
                borderTop: matches.length ? "1px solid rgba(30,53,96,0.08)" : undefined,
                backgroundColor: active === matches.length ? "rgba(74,159,212,0.1)" : undefined,
              }}
            >
              My office isn&apos;t listed. Use &ldquo;{query.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
