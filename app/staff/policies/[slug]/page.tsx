import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import PolicySignForm from '@/components/staff/PolicySignForm'
import {
  DEFAULT_ATTESTATION,
  fmtDate,
  getStaffByClerkId,
  policyClient,
  type PolicyQuestion,
} from '@/lib/staff/policies'

export const metadata: Metadata = { title: 'Staff Policy', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    h1: ({ children }) => (
      <h2 className="text-xl font-bold mt-8 mb-3" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>{children}</h2>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>{children}</h3>
    ),
    h4: ({ children }) => <h4 className="font-semibold mt-4 mb-2" style={{ color: '#0D3B6E' }}>{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 pl-4 my-4 italic" style={{ borderColor: '#378ADD' }}>{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1.5">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  },
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/staff/policies/${slug}`)}`)
  const staff = await getStaffByClerkId(userId)
  if (!staff) redirect('/')

  const policy = await policyClient.fetch(
    `*[_type == "policy" && !(_id in path("drafts.**")) && active == true && slug.current == $slug][0]{
      _id, title, version, effectiveDate, summary, body, attestation, questions, requiresCountersign,
      "assignedIds": assignedTo[]._ref
    }`,
    { slug },
  )
  if (!policy) notFound()
  if (policy.assignedIds?.length && !policy.assignedIds.includes(staff._id)) notFound()

  const acks = await policyClient.fetch<
    Array<{ _id: string; policyVersion: string; acknowledgedAt: string; signedName: string; countersignedBy?: string; countersignedAt?: string; responses?: Array<{ question: string; answer: string }> }>
  >(
    `*[_type == "policyAcknowledgement" && !(_id in path("drafts.**")) && policy._ref == $pid && staffMember._ref == $sid] | order(acknowledgedAt desc){
      _id, policyVersion, acknowledgedAt, signedName, countersignedBy, countersignedAt, responses
    }`,
    { pid: policy._id, sid: staff._id },
  )
  const current = acks.find(a => a.policyVersion === policy.version)
  const previous = !current ? acks[0] : undefined

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      <div style={{ backgroundColor: '#0D3B6E' }} className="px-5 pt-10 pb-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/staff/policies" className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            ← All policies
          </Link>
          <h1 className="text-2xl font-bold text-white mt-3" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            {policy.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Version {policy.version}
            {policy.effectiveDate ? ` · Effective ${fmtDate(`${policy.effectiveDate}T12:00:00-06:00`)}` : ''}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {previous && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#FEF3E2', color: '#8a4a0b' }}>
            This policy has been updated since you signed version {previous.policyVersion} on {fmtDate(previous.acknowledgedAt)}.
            Please read it again and sign the new version.
          </div>
        )}

        <article
          className="rounded-2xl px-6 py-7 text-[15px]"
          style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(13,59,110,0.07)', color: '#2B303A' }}
        >
          <PortableText value={policy.body ?? []} components={components} />
        </article>

        {current ? (
          <div className="rounded-2xl px-6 py-5" style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(13,59,110,0.07)' }}>
            <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>
              ✓ You signed this version on {fmtDate(current.acknowledgedAt, true)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(43,48,58,0.6)' }}>
              Signed as “{current.signedName}”.
              {policy.requiresCountersign &&
                (current.countersignedAt
                  ? ` Countersigned by ${current.countersignedBy} on ${fmtDate(current.countersignedAt)}.`
                  : ' Waiting for a management countersignature.')}
            </p>
            {!!current.responses?.length && (
              <dl className="mt-3 space-y-2">
                {current.responses.map((r, i) => (
                  <div key={i} className="text-xs">
                    <dt style={{ color: 'rgba(43,48,58,0.55)' }}>{r.question}</dt>
                    <dd className="font-semibold" style={{ color: '#2B303A' }}>{r.answer || '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link
              href={`/staff/policies/record/${current._id}`}
              className="inline-block mt-4 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: '#0D3B6E' }}
            >
              View signed copy
            </Link>
          </div>
        ) : (
          <PolicySignForm
            policyId={policy._id}
            version={policy.version}
            fullName={staff.fullName}
            attestation={policy.attestation?.trim() || DEFAULT_ATTESTATION}
            questions={(policy.questions ?? []) as PolicyQuestion[]}
          />
        )}
      </div>
    </main>
  )
}
