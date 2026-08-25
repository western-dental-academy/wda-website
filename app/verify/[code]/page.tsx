import { createClient } from '@sanity/client'
import Link from 'next/link'
import type { Metadata } from 'next'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export const metadata: Metadata = {
  title: 'Certificate Verification',
  description: 'Verify a Western Dental Academy certificate of completion.',
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const student = await client.fetch(
    `*[_type == "student" && certificateId == $code][0]{
      firstName, lastName, certificateId, certificateIssuedDate,
      program->{ title }
    }`,
    { code }
  )

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20" style={{ backgroundColor: '#F4F7F9' }}>
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src="/WesternDentalAcademyLogo-Alternate.svg"
              alt="Western Dental Academy"
              style={{ height: '72px', width: 'auto', margin: '0 auto 24px' }}
            />
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#378ADD' }}>
            Certificate Verification
          </p>
        </div>

        {student ? (
          /* ── Valid certificate ── */
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(30,53,96,0.09)' }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} className="w-8 h-8" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: '#1E3560', fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Certificate Verified
            </h1>
            <p className="text-sm mb-8" style={{ color: 'rgba(43,48,58,0.6)' }}>
              This is an authentic Western Dental Academy certificate.
            </p>

            <div className="text-left rounded-xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#F4F7F9' }}>
              {[
                { label: 'Graduate', value: `${student.firstName} ${student.lastName}` },
                { label: 'Program', value: student.program?.title ?? 'Dental Assisting Certificate' },
                { label: 'Certificate ID', value: student.certificateId },
                {
                  label: 'Issued',
                  value: student.certificateIssuedDate
                    ? new Date(student.certificateIssuedDate).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—',
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(30,53,96,0.4)' }}>
                    {label}
                  </p>
                  <p className="text-sm font-medium" style={{ color: '#1E3560' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Invalid certificate ── */
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(30,53,96,0.09)' }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(220,38,38,0.08)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} className="w-8 h-8" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: '#1E3560', fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Certificate Not Found
            </h1>
            <p className="text-sm mb-8" style={{ color: 'rgba(43,48,58,0.6)' }}>
              The certificate ID <strong style={{ color: '#1E3560' }}>{code}</strong> could not be verified. Please check the ID and try again.
            </p>
            <p className="text-xs" style={{ color: 'rgba(43,48,58,0.4)' }}>
              If you believe this is an error, contact{' '}
              <a href="mailto:info@westerndentalacademy.com" style={{ color: '#378ADD' }}>
                info@westerndentalacademy.com
              </a>
            </p>
          </div>
        )}

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(43,48,58,0.35)' }}>
          westerndentalacademy.com
        </p>
      </div>
    </main>
  )
}