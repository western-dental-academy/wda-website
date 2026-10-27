'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Entrant {
  name: string
  comments: number
  balls: number
}

interface Ball {
  owner: string
  n: number
  x: number
  y: number
  vx: number
  vy: number
}

interface DrawRecord {
  at: string
  name: string
  ball: number
  of: number
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SAMPLE = `jen.rda, Need this! @kayla_dental @mo.hygiene @sarahsmiles
kayla_dental, Entering! @jen.rda @dentalbff @amy.ca
mo.hygiene, @jen.rda @kayla_dental @tooth_fairy_yeg
jen.rda, again! @lisa.d @tooth_fairy_yeg @dentalbff
sarahsmiles, So fun @mo.hygiene @amy.ca
dentalbff, @jen.rda @kayla_dental @sarahsmiles @amy.ca
tooth_fairy_yeg, Love WDA @mo.hygiene @lisa.d @jen.rda
amy.ca, @kayla_dental @dentalbff @sarahsmiles
westerndentalacademy, Thanks everyone for entering!`

const W = 840, H = 940, CX = 420, CY = 460, RAD = 330, BR = 34
const BALL_COLOURS = ['#E67E22', '#4A9FD4', '#F4F7FB']
const inputStyle = { borderColor: 'rgba(30,53,96,0.2)', backgroundColor: '#ffffff', color: '#2B303A' }

// ── Entry rules ────────────────────────────────────────────────────────────────

// One comment per line: "username, comment" (also accepts "username: comment" or tab-separated exports).
// Instagram: a comment counts only if it tags 3+ other people. Facebook: every comment counts.
function parseEntries(raw: string, platform: 'ig' | 'fb', maxEntries: number, excludeRaw: string) {
  const exclude = new Set(excludeRaw.split(/[\s,]+/).map(s => s.replace(/^@/, '').toLowerCase()).filter(Boolean))
  const map = new Map<string, { name: string; comments: number }>()
  let skipped = 0
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t) continue
    const m = t.match(/^"?@?([^,:\t"]+?)"?\s*[,:\t]\s*(.*)$/)
    if (!m) { skipped++; continue }
    const name = m[1].trim()
    const key = name.toLowerCase()
    if (/^(username|user|name|author)$/i.test(name) || exclude.has(key)) continue
    const tags = new Set((m[2].match(/@[\w.]+/g) ?? []).map(s => s.toLowerCase()).filter(s => s.slice(1) !== key))
    if (!map.has(key)) map.set(key, { name, comments: 0 })
    if (platform === 'fb' || tags.size >= 3) map.get(key)!.comments++
    else skipped++
  }
  const entrants: Entrant[] = [...map.values()]
    .map(e => ({ ...e, balls: Math.min(e.comments, Math.max(1, maxEntries)) }))
    .filter(e => e.balls > 0)
    .sort((a, b) => b.balls - a.balls || a.name.localeCompare(b.name))
  return { entrants, skipped }
}

// Unbiased pick using the browser's cryptographic random generator
function secureIndex(n: number) {
  const max = Math.floor(0x100000000 / n) * n
  const a = new Uint32Array(1)
  do crypto.getRandomValues(a); while (a[0] >= max)
  return a[0] % n
}

function makeBalls(entrants: Entrant[]): Ball[] {
  const balls: Ball[] = []
  let n = 1
  for (const e of entrants) {
    for (let i = 0; i < e.balls; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * (RAD - 60)
      balls.push({ owner: e.name, n: n++, x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 })
    }
  }
  return balls
}

// ── Component ──────────────────────────────────────────────────────────────────

// Opens in a working state with clearly marked example names
const INITIAL = parseEntries(SAMPLE, 'ig', 5, 'westerndentalacademy')

export default function AdminGiveawayDraw() {
  const [raw, setRaw] = useState(SAMPLE)
  const [platform, setPlatform] = useState<'ig' | 'fb'>('ig')
  const [maxEntries, setMaxEntries] = useState(5)
  const [exclude, setExclude] = useState('westerndentalacademy')
  const [entrants, setEntrants] = useState<Entrant[]>(INITIAL.entrants)
  const [skipped, setSkipped] = useState(INITIAL.skipped)
  const [isSample, setIsSample] = useState(true)
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [ballCount, setBallCount] = useState(INITIAL.entrants.reduce((s, e) => s + e.balls, 0))
  const [drawing, setDrawing] = useState(false)
  const [winner, setWinner] = useState<Ball | null>(null)
  const [history, setHistory] = useState<DrawRecord[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const balls = useRef<Ball[]>([])
  const anim = useRef({ mixUntil: 0, pending: null as Ball | null, winner: null as Ball | null, rise: 0 })

  const active = entrants.filter(e => !removed.has(e.name.toLowerCase()))
  const totalBalls = active.reduce((s, e) => s + e.balls, 0)

  const load = useCallback((text: string, sample: boolean) => {
    const { entrants: list, skipped: sk } = parseEntries(text, platform, maxEntries, exclude)
    setEntrants(list)
    setSkipped(sk)
    setIsSample(sample)
    setRemoved(new Set())
    balls.current = makeBalls(list)
    setBallCount(balls.current.length)
    anim.current = { mixUntil: 0, pending: null, winner: null, rise: 0 }
    setWinner(null)
  }, [platform, maxEntries, exclude])

  function draw() {
    if (!balls.current.length || drawing) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    anim.current.winner = null
    anim.current.rise = 0
    anim.current.pending = balls.current[secureIndex(balls.current.length)]
    anim.current.mixUntil = performance.now() + (reduce ? 300 : 3800)
    setWinner(null)
    setDrawing(true)
  }

  function removeAndRedraw() {
    if (!winner) return
    const next = new Set(removed)
    next.add(winner.owner.toLowerCase())
    setRemoved(next)
    balls.current = makeBalls(entrants.filter(e => !next.has(e.name.toLowerCase())))
    setBallCount(balls.current.length)
    anim.current = { mixUntil: 0, pending: null, winner: null, rise: 0 }
    setWinner(null)
  }

  // ── Machine animation ──
  useEffect(() => {
    const cv = canvasRef.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    let frame = 0
    if (!balls.current.length) balls.current = makeBalls(INITIAL.entrants)

    // Only state setters and refs are used here, so this never goes stale
    const onWinner = (b: Ball) => {
      setDrawing(false)
      setWinner(b)
      const record = { at: new Date().toLocaleString('en-CA', { timeZone: 'America/Regina' }), name: b.owner, ball: b.n, of: balls.current.length }
      setHistory(h => [record, ...h].slice(0, 30))
    }

    const drawBall = (b: Ball, scale: number) => {
      const r = BR * scale, i = (b.n - 1) % 3
      const g = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.4, r * 0.1, b.x, b.y, r)
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, BALL_COLOURS[i]); g.addColorStop(1, i === 2 ? '#9FB3CF' : BALL_COLOURS[i])
      ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
      ctx.beginPath(); ctx.arc(b.x, b.y, r * 0.52, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill()
      ctx.fillStyle = '#14254A'; ctx.font = `800 ${Math.round(r * 0.62)}px Montserrat, sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(b.n), b.x, b.y + 1)
    }

    const step = (now: number) => {
      const a = anim.current, list = balls.current
      const mixing = !!a.pending && now < a.mixUntil
      for (const b of list) {
        if (b === a.winner || (b === a.pending && !mixing)) continue
        b.vy += mixing ? 0.05 : 0.35
        if (mixing) { b.vx += (Math.random() - 0.5) * 3.2; b.vy -= Math.random() * 1.9 }
        b.vx *= 0.99; b.vy *= 0.99; b.x += b.vx; b.y += b.vy
        const dx = b.x - CX, dy = b.y - CY, d = Math.hypot(dx, dy), lim = RAD - BR - 6
        if (d > lim) {
          const nx = dx / d, ny = dy / d
          b.x = CX + nx * lim; b.y = CY + ny * lim
          const dot = b.vx * nx + b.vy * ny; b.vx -= 1.8 * dot * nx; b.vy -= 1.8 * dot * ny
        }
      }
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const p = list[i], q = list[j]
        if (p === a.winner || q === a.winner) continue
        const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1
        if (d < BR * 2) {
          const o = (BR * 2 - d) / 2, nx = dx / d, ny = dy / d
          p.x -= nx * o; p.y -= ny * o; q.x += nx * o; q.y += ny * o
          const t = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny
          if (t < 0) { p.vx += t * nx * 0.9; p.vy += t * ny * 0.9; q.vx -= t * nx * 0.9; q.vy -= t * ny * 0.9 }
        }
      }
      // Winning ball rises into the chute
      if (a.pending && !mixing) {
        const b = a.pending, top = CY - RAD - 40
        a.rise = Math.min(1, a.rise + 0.025)
        b.x += (CX - b.x) * 0.12; b.y += (top - b.y) * 0.08; b.vx = b.vy = 0
        if (a.rise >= 1 && Math.abs(b.y - top) < 3) { a.winner = b; a.pending = null; onWinner(b) }
      }

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0B1630'
      ctx.beginPath(); ctx.moveTo(CX - 150, 930); ctx.lineTo(CX + 150, 930); ctx.lineTo(CX + 70, CY + RAD - 10); ctx.lineTo(CX - 70, CY + RAD - 10); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#E67E22'; ctx.fillRect(CX - 160, 905, 320, 25)
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(CX - 46, CY - RAD - 90, 92, 100)
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.strokeRect(CX - 46, CY - RAD - 90, 92, 100)
      const gg = ctx.createRadialGradient(CX - 120, CY - 140, 40, CX, CY, RAD)
      gg.addColorStop(0, 'rgba(255,255,255,.16)'); gg.addColorStop(1, 'rgba(74,159,212,.10)')
      ctx.beginPath(); ctx.arc(CX, CY, RAD, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill()
      for (const b of list) if (b !== a.winner && b !== a.pending) drawBall(b, 1)
      ctx.beginPath(); ctx.arc(CX, CY, RAD, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 6; ctx.stroke()
      ctx.beginPath(); ctx.arc(CX - 110, CY - 120, RAD * 0.55, Math.PI * 1.05, Math.PI * 1.45); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 10; ctx.stroke()
      if (a.winner) drawBall(a.winner, 1.5)
      else if (a.pending && !mixing) drawBall(a.pending, 1 + a.rise * 0.5)
      if (!list.length) {
        ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '600 30px "Open Sans", sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('No balls yet', CX, CY)
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  const winnerEntrant = winner ? entrants.find(e => e.name === winner.owner) : null

  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
        <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Giveaway Draw</h2>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>
          Paste the comments, check the entries, then draw. One ball per entry; the winner is picked at random by the browser&apos;s secure random generator.
        </p>
      </div>

      {/* Stage */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
        style={{ background: 'radial-gradient(120% 90% at 50% 0%, #1E3A78 0%, #122450 55%, #0E1C40 100%)' }}>
        <div className="w-full max-w-[420px] mx-auto">
          <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block" aria-label="Lottery machine with numbered balls" />
        </div>
        <div className="flex flex-col gap-3 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A3B4D2' }}>
            {ballCount} ball{ballCount === 1 ? '' : 's'} in the machine
          </p>
          <div aria-live="polite" className="rounded-2xl p-5 flex flex-col gap-1.5 min-h-[150px] justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1.5px solid ${winner ? '#E67E22' : '#2A4278'}` }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#E67E22' }}>
              {winner ? `Winner · ball #${winner.n}` : drawing ? 'Drawing…' : 'Ready to draw'}
            </p>
            <p className="text-3xl font-black break-words" style={{ color: '#EEF3FB', fontFamily: 'var(--font-montserrat), sans-serif' }}>
              {winner ? `@${winner.owner}` : drawing ? '…' : ballCount ? 'Press Draw' : 'Add entries'}
            </p>
            <p className="text-sm" style={{ color: '#A3B4D2' }}>
              {winner && winnerEntrant
                ? `${winnerEntrant.balls} of ${ballCount} balls. Next: DM them the skill-testing question.`
                : drawing ? 'Mixing the balls' : `${active.length} people in the draw`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={draw} disabled={drawing || ballCount === 0}
              className="rounded-full px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: '#E67E22' }}>
              {winner ? 'Draw again' : 'Draw a winner'}
            </button>
            {winner && !drawing && (
              <button onClick={removeAndRedraw} className="rounded-full px-5 py-3 text-sm font-semibold border"
                style={{ borderColor: '#2A4278', color: '#EEF3FB' }}>
                No reply? Remove &amp; redraw
              </button>
            )}
          </div>
          <p className="text-xs" style={{ color: '#A3B4D2' }}>Tip: screen-record this panel during the draw for the winner announcement video.</p>
        </div>
      </div>

      {/* Setup + entrants */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4 min-w-0">
          <p className="text-xs font-bold" style={{ color: '#1E3560' }}>1. Paste comments</p>
          <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: '#1E3560' }}>
            Platform rules
            <select value={platform} onChange={e => setPlatform(e.target.value as 'ig' | 'fb')}
              className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none" style={inputStyle}>
              <option value="ig">Instagram: comment must tag 3+ people</option>
              <option value="fb">Facebook: any comment counts</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: '#1E3560' }}>
            Comments, one per line: username, comment
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={8} spellCheck={false}
              className="w-full rounded-lg px-3 py-2.5 text-xs border focus:outline-none font-mono" style={inputStyle} />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: '#1E3560' }}>
              Max entries per person
              <input type="number" min={1} max={50} value={maxEntries} onChange={e => setMaxEntries(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none" style={inputStyle} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: '#1E3560' }}>
              Exclude (staff, WDA accounts)
              <input type="text" value={exclude} onChange={e => setExclude(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none" style={inputStyle} />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => load(raw, raw === SAMPLE)} disabled={drawing}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: '#378ADD' }}>
              Load entries
            </button>
            <button onClick={() => { setRaw(''); load('', false) }} disabled={drawing}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold border" style={{ borderColor: 'rgba(30,53,96,0.2)', color: 'rgba(30,53,96,0.6)' }}>
              Clear
            </button>
          </div>
          <p className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>
            Works with most comment exports (CSV or &quot;username: comment&quot;). Run Instagram and Facebook as separate draws, or switch the rule and paste both.
          </p>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <p className="text-xs font-bold" style={{ color: '#1E3560' }}>2. Check entries</p>
          <p className="text-xs" style={{ color: 'rgba(43,48,58,0.6)' }}>
            {isSample && entrants.length > 0 && <span className="font-bold" style={{ color: '#E67E22' }}>Example names, not real entries. </span>}
            {entrants.length
              ? `${active.length} entrant${active.length === 1 ? '' : 's'}, ${totalBalls} ball${totalBalls === 1 ? '' : 's'}.${skipped ? ` ${skipped} comment${skipped === 1 ? '' : 's'} didn't qualify.` : ''}`
              : 'No qualifying entries yet.'}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(30,53,96,0.07)' }}>
                  {['Entrant', 'Valid comments', 'Balls', 'Odds'].map((h, i) => (
                    <th key={h} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${i ? 'text-right' : 'text-left'}`} style={{ color: 'rgba(43,48,58,0.4)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entrants.map(e => {
                  const out = removed.has(e.name.toLowerCase())
                  return (
                    <tr key={e.name} style={{ borderBottom: '1px solid rgba(30,53,96,0.05)', opacity: out ? 0.45 : 1 }}>
                      <td className="px-3 py-2 font-medium" style={{ color: '#1E3560' }}>@{e.name}</td>
                      <td className="px-3 py-2 text-right">{e.comments}</td>
                      <td className="px-3 py-2 text-right">{out ? '—' : e.balls}</td>
                      <td className="px-3 py-2 text-right">{out ? 'removed' : totalBalls ? `${(100 * e.balls / totalBalls).toFixed(1)}%` : ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs font-bold mt-2" style={{ color: '#1E3560' }}>Draw history (until you leave this page)</p>
          {history.length === 0
            ? <p className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>No draws yet.</p>
            : (
              <ol className="text-xs list-decimal pl-5 flex flex-col gap-1" style={{ color: 'rgba(43,48,58,0.7)' }}>
                {history.slice(0, 10).map((h, i) => <li key={i}>{h.at}: @{h.name} (ball #{h.ball} of {h.of})</li>)}
              </ol>
            )}
        </div>
      </div>
    </div>
  )
}
