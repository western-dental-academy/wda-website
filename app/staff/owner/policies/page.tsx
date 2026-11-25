import { redirect } from 'next/navigation'

// The policy report now lives in the WDA Hub (Policies tab)
export default function OwnerPoliciesPage() {
  redirect('/admin?tab=policies')
}
