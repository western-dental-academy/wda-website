import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gift Certificates',
  description: 'Give the gift of learning — WDA gift certificates are redeemable for any professional development event or workshop at Western Dental Academy.',
}

export default function GiftCertificatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
