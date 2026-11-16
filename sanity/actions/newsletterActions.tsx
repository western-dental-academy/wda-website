'use client'

import { useState } from 'react'
import type { DocumentActionComponent, DocumentActionsResolver } from 'sanity'

// Buttons on a Newsletter document in the Studio (in the "..." menu next to Publish):
//   Preview email   opens the issue as subscribers will see it (unpublished edits included)
//   Send test to me emails a [TEST] copy to the staff member signed in to the website
// Both call /api/admin/newsletter, which needs you signed in to the website as staff.

const PreviewAction: DocumentActionComponent = (props) => ({
  label: 'Preview email',
  onHandle: () => {
    window.open(`/api/admin/newsletter?id=${encodeURIComponent(props.id)}`, '_blank', 'noopener')
    props.onComplete()
  },
})

const SendTestAction: DocumentActionComponent = (props) => {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  return {
    label: busy ? 'Sending test…' : 'Send test to me',
    disabled: busy,
    onHandle: async () => {
      setBusy(true)
      try {
        const res = await fetch('/api/admin/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: props.id }),
        })
        const data = await res.json().catch(() => ({}))
        setMessage(res.ok ? `Test sent to ${data.to}. Check your inbox in a minute.` : `Test not sent: ${data.error ?? res.statusText}`)
      } catch (err) {
        setMessage(`Test not sent: ${String(err)}`)
      } finally {
        setBusy(false)
      }
    },
    dialog: message
      ? { type: 'dialog', header: 'Newsletter test', content: message, onClose: () => { setMessage(null); props.onComplete() } }
      : null,
  }
}

export const resolveDocumentActions: DocumentActionsResolver = (prev, context) =>
  context.schemaType === 'newsletter' ? [...prev, PreviewAction, SendTestAction] : prev
