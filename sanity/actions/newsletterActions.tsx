'use client'

import { useState } from 'react'
import type { DocumentActionComponent, DocumentActionsResolver } from 'sanity'

// Buttons on a Newsletter document in the Studio (in the "..." menu next to Publish):
//   Preview email   opens the issue as subscribers will see it (unpublished edits included)
//   Send test to me emails a [TEST] copy to the staff member signed in to the website
//   Fill from post link  fills Behind the scenes from its Instagram/Facebook/TikTok link
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

const FillFromPostAction: DocumentActionComponent = (props) => {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const doc = (props.draft ?? props.published) as { spotlight?: { postUrl?: string } } | null
  const hasLink = !!doc?.spotlight?.postUrl
  return {
    label: busy ? 'Filling from post…' : 'Fill from post link',
    disabled: busy || !hasLink,
    title: hasLink ? 'Fill the behind-the-scenes photo and caption from the social post link' : 'Paste a social post link into Behind the scenes first',
    onHandle: async () => {
      setBusy(true)
      try {
        const res = await fetch('/api/admin/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: props.id, action: 'fillPost' }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) setMessage(`Couldn't fill it in: ${data.error ?? res.statusText}`)
        else if (data.missing?.length && !data.filled?.filter((f: string) => f !== 'button link').length)
          setMessage(`${data.network ?? 'The site'} didn't share the post's photo or caption. Add them by hand; the button will still link to the post.`)
        else
          setMessage(`Filled in: ${data.filled?.join(', ') || 'nothing new (those fields already had something in them)'}.${data.missing?.length ? ` Couldn't get: ${data.missing.join(', ')}, so add that by hand.` : ''} Edit the caption if you like.`)
      } catch (err) {
        setMessage(`Couldn't fill it in: ${String(err)}`)
      } finally {
        setBusy(false)
      }
    },
    dialog: message
      ? { type: 'dialog', header: 'Behind the scenes', content: message, onClose: () => { setMessage(null); props.onComplete() } }
      : null,
  }
}

export const resolveDocumentActions: DocumentActionsResolver = (prev, context) =>
  context.schemaType === 'newsletter' ? [...prev, FillFromPostAction, PreviewAction, SendTestAction] : prev
