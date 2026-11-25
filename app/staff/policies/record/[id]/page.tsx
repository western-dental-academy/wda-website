import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PrintButton from '@/components/staff/PrintButton'
import { fmtDate, getStaffByClerkId, isPolicyManager, policyClient } from '@/lib/staff/policies'

export const metadata: Metadata = { title: 'Signed Policy Record', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// Printable record of one signed acknowledgement. Visible to the person who signed it and to policy managers.
export default async function PolicyRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=%2Fstaff%2Fpolicies')
  const viewer = await getStaffByClerkId(userId)
  if (!viewer) redirect('/')

  const ack = await policyClient.fetch(
    `*[_type == "policyAcknowledgement" && _id == $id][0]{
      _id, policyTitle, policyVersion, policyRevision, staffName, staffEmail, jobTitle, signedName, attestation,
      acknowledgedAt, responses, contentSnapshot, ipAddress, countersignedBy, countersignedAt,
      "staffId": staffMember._ref, "requiresCountersign": policy->requiresCountersign
    }`,
    { id },
  )
  if (!ack) notFound()
  const manager = isPolicyManager(viewer.email)
  if (ack.staffId !== viewer._id && !manager) notFound()

  const row = (k: string, v: React.ReactNode) => (
    <div className="grid grid-cols-[150px_1fr] gap-3 py-1.5 text-sm print:text-[12px]" style={{ borderBottom: '1px solid #E6ECF1' }}>
      <dt style={{ color: 'rgba(43,48,58,0.6)' }}>{k}</dt>
      <dd style={{ color: '#2B303A' }}>{v}</dd>
    </div>
  )

  return (
    <div id="policy-record" className="min-h-screen bg-white" style={{ color: '#2B303A' }}>
      {/* Print only this record, not the site navigation and footer */}
      <style>{`@media print {
        body * { visibility: hidden; }
        #policy-record, #policy-record * { visibility: visible; }
        #policy-record { position: absolute; left: 0; top: 0; width: 100%; }
      }`}</style>
      <div className="max-w-3xl mx-auto px-6 py-8 print:py-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href={manager && ack.staffId !== viewer._id ? '/admin?tab=policies' : '/staff/policies'} className="text-sm font-semibold" style={{ color: '#378ADD' }}>
            ← Back
          </Link>
          <PrintButton />
        </div>

        <header className="pb-4 mb-5" style={{ borderBottom: '3px solid #0D3B6E' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#378ADD', fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Western Dental Academy · Signed Policy Acknowledgement
          </p>
          <h1 className="text-2xl font-bold mt-1" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
            {ack.policyTitle}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(43,48,58,0.6)' }}>Version {ack.policyVersion}</p>
        </header>

        <dl className="mb-6">
          {row('Staff member', ack.staffName)}
          {row('Position', ack.jobTitle || '—')}
          {row('Email', ack.staffEmail)}
          {row('Statement agreed', ack.attestation)}
          {row('Signature (typed)', <span className="font-semibold" style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: '#0D3B6E' }}>{ack.signedName}</span>)}
          {row('Signed', `${fmtDate(ack.acknowledgedAt, true)} (Alberta time)`)}
          {(ack.responses ?? []).map((r: { question: string; answer: string }, i: number) => (
            <div key={i}>{row(r.question, r.answer || '—')}</div>
          ))}
          {(ack.requiresCountersign || ack.countersignedAt) &&
            row(
              'Management countersignature',
              ack.countersignedAt ? `${ack.countersignedBy}, ${fmtDate(ack.countersignedAt, true)}` : 'Not yet countersigned',
            )}
          {row('Record ID', <span className="text-xs">{ack._id} · rev {ack.policyRevision} · {ack.ipAddress || 'no IP'}</span>)}
        </dl>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Policy text as signed
          </h2>
          <div className="text-sm print:text-[11px] leading-relaxed whitespace-pre-line rounded-lg p-4 print:p-0" style={{ backgroundColor: '#F4F7F9' }}>
            {ack.contentSnapshot}
          </div>
        </section>
      </div>
    </div>
  )
}
