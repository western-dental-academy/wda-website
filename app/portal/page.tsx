import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import Link from 'next/link'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export default async function PortalPage() {
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

  const student = await client.fetch(
    `*[_type == "student" && email == $email][0]{
      _id, firstName, lastName, email, status, moodleUserId
    }`,
    { email }
  )

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      <div style={{ backgroundColor: '#1E3560' }} className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Student Portal
          </p>
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            Welcome back, {student?.firstName ?? user?.firstName ?? 'Student'}.
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!student && (
          <div className="rounded-xl p-8 text-center bg-white">
            <h2 className="text-lg font-bold text-[#1E3560] mb-2">No Application Found</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(43,48,58,0.6)' }}>
              No application was found for {email}.
            </p>
            <Link
              href="/apply"
              className="rounded-lg px-6 py-2.5 text-sm font-bold text-white"
              style={{ backgroundColor: '#E67E22' }}
            >
              Apply Now
            </Link>
          </div>
        )}

        {student && student.status === 'pending' && (
          <div className="rounded-xl p-8 bg-white">
            <h2 className="text-lg font-bold text-[#1E3560] mb-2">Application Under Review</h2>
            <p className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>
              Our admissions team will be in touch within one to two business days.
            </p>
          </div>
        )}

        {student && student.status === 'accepted' && (
          <div className="rounded-xl p-8 bg-white">
            <h2 className="text-lg font-bold text-[#1E3560] mb-2">You are enrolled</h2>
            <p className="text-sm mb-4" style={{ color: 'rgba(43,48,58,0.6)' }}>
              Your Moodle account is ready. Visit Moodle to access your course.
            </p>
            <Link
              href={`${process.env.MOODLE_URL}/course/view.php?id=2`}
              className="rounded-lg px-6 py-2.5 text-sm font-bold text-white"
              style={{ backgroundColor: '#1E3560' }}
            >
              Go to Moodle
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}