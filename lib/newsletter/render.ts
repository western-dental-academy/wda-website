import type { NewsletterContent, NewsletterCourse, PortableBlock, UpcomingWorkshop } from './content'
import { formatAlberta } from './schedule'

// Email HTML for the newsletter and the welcome email. Table layout with inline
// styles so it holds up in Outlook, Gmail and phone mail apps.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com').replace(/\/$/, '')
export const NEWSLETTER_FROM = 'Western Dental Academy <info@westerndentalacademy.com>'
export const MAILING_ADDRESS = '150 Chippewa Road, Suite 258, Sherwood Park, AB'

const NAVY = '#0D3B6E'
const BLUE = '#378ADD'
const AMBER = '#E67E22'
const INK = '#374151'
const MUTED = '#6b7280'
const PALE = '#F4F7F9'
const HEAD_FONT = "Montserrat, 'Segoe UI', Arial, sans-serif"
const BODY_FONT = "'Open Sans', 'Segoe UI', Arial, sans-serif"

const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/westerndentalacademy/' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61591275340547' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/western-dental-academy/' },
]

export function esc(s: string | undefined | null): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function paragraphs(text: string | undefined, style: string): string {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="${style}">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function firstParagraph(text: string | undefined, max = 230): string {
  const p = (text ?? '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
  // Course descriptions sometimes open with a one-line title; skip it.
  let out = p[0] ?? ''
  if (out.length < 70 && p[1]) out = p[1]
  if (out.length <= max) return out
  return out.slice(0, out.lastIndexOf(' ', max)).replace(/[,;:.]$/, '') + '…'
}

function utm(url: string, campaign: string): string {
  if (!url.startsWith(SITE_URL)) return url
  const sep = url.includes('?') ? '&' : '?'
  const [path, hash] = url.split('#')
  return `${path}${sep}utm_source=newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(campaign)}${hash ? `#${hash}` : ''}`
}

function button(href: string, label: string, colour = AMBER): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:8px;background:${colour};">
    <a href="${esc(href)}" style="display:inline-block;padding:12px 24px;font-family:${HEAD_FONT};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${esc(label)}</a>
  </td></tr></table>`
}

function sectionTitle(text: string): string {
  return `<p style="margin:0 0 14px;font-family:${HEAD_FONT};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BLUE};">${esc(text)}</p>`
}

function section(inner: string, opts: { bg?: string } = {}): string {
  return `<tr><td class="wda-sec" style="padding:28px 32px;background:${opts.bg ?? '#ffffff'};border-top:1px solid #e5e7eb;">${inner}</td></tr>`
}

// ── Portable Text (intro) ────────────────────────────────────────────────────

function renderSpans(block: PortableBlock): string {
  const defs = new Map((block.markDefs ?? []).map(d => [d._key, d]))
  return (block.children ?? []).map(span => {
    let html = esc(span.text).replace(/\n/g, '<br>')
    for (const mark of span.marks ?? []) {
      if (mark === 'strong') html = `<strong>${html}</strong>`
      else if (mark === 'em') html = `<em>${html}</em>`
      else {
        const def = defs.get(mark)
        if (def?.href) html = `<a href="${esc(def.href)}" style="color:${BLUE};text-decoration:underline;">${html}</a>`
      }
    }
    return html
  }).join('')
}

export function renderPortable(blocks: PortableBlock[] | undefined): string {
  const out: string[] = []
  let list: string[] = []
  const flush = () => {
    if (list.length) out.push(`<ul style="margin:0 0 16px;padding-left:22px;font-family:${BODY_FONT};font-size:15px;line-height:1.65;color:${INK};">${list.join('')}</ul>`)
    list = []
  }
  for (const b of blocks ?? []) {
    if (b._type !== 'block') continue
    if (b.listItem) { list.push(`<li style="margin:0 0 6px;">${renderSpans(b)}</li>`); continue }
    flush()
    if (b.style === 'h3') {
      out.push(`<p style="margin:8px 0 10px;font-family:${HEAD_FONT};font-size:17px;font-weight:700;color:${NAVY};">${renderSpans(b)}</p>`)
    } else {
      out.push(`<p style="margin:0 0 16px;font-family:${BODY_FONT};font-size:15px;line-height:1.65;color:${INK};">${renderSpans(b)}</p>`)
    }
  }
  flush()
  return out.join('')
}

export function portableToText(blocks: PortableBlock[] | undefined): string {
  return (blocks ?? [])
    .filter(b => b._type === 'block')
    .map(b => `${b.listItem ? '• ' : ''}${(b.children ?? []).map(c => c.text).join('')}`)
    .join('\n\n')
}

// ── Sections ─────────────────────────────────────────────────────────────────

function workshopPrice(w: UpcomingWorkshop): string {
  const parts: string[] = []
  if (w.price != null) parts.push(w.price === 0 ? 'Free' : `$${w.price}${w.hasVirtualOption ? ' in person' : ''}`)
  if (w.hasVirtualOption && w.virtualPrice != null) parts.push(`$${w.virtualPrice} virtual`)
  if (w.hours != null) parts.push(`${w.hours} CCP hours`)
  return parts.join(' · ')
}

function registerUrl(w: UpcomingWorkshop): string {
  return `${SITE_URL}/register?offering=${encodeURIComponent(w.title)}&dateId=${encodeURIComponent(w.dateId)}`
}

function workshopsSection(workshops: UpcomingWorkshop[], campaign: string): string {
  if (!workshops.length) return ''
  const rows = workshops.map(w => {
    const d = new Date(w.date)
    const month = d.toLocaleDateString('en-CA', { timeZone: 'America/Regina', month: 'short' }).replace('.', '').toUpperCase()
    const day = d.toLocaleDateString('en-CA', { timeZone: 'America/Regina', day: 'numeric' })
    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
      <tr>
        <td width="64" valign="top" style="padding-right:16px;">
          <table role="presentation" width="64" cellpadding="0" cellspacing="0" border="0" style="background:${NAVY};border-radius:10px;">
            <tr><td align="center" style="padding:8px 0 0;font-family:${HEAD_FONT};font-size:11px;font-weight:700;letter-spacing:1px;color:#9cc7f0;">${esc(month)}</td></tr>
            <tr><td align="center" style="padding:0 0 8px;font-family:${HEAD_FONT};font-size:24px;font-weight:700;color:#ffffff;">${esc(day)}</td></tr>
          </table>
        </td>
        <td valign="top">
          <p style="margin:0 0 4px;font-family:${HEAD_FONT};font-size:16px;font-weight:700;color:${NAVY};">${esc(w.title)}</p>
          <p style="margin:0 0 6px;font-family:${BODY_FONT};font-size:13px;color:${MUTED};">${esc(formatAlberta(d))}${w.hasVirtualOption ? ' · In person or virtual' : ''}</p>
          ${w.description ? `<p style="margin:0 0 8px;font-family:${BODY_FONT};font-size:14px;line-height:1.55;color:${INK};">${esc(firstParagraph(w.description, 170))}</p>` : ''}
          <p style="margin:0;font-family:${BODY_FONT};font-size:13px;color:${INK};">
            ${workshopPrice(w) ? `<span style="color:${MUTED};">${esc(workshopPrice(w))}</span> &nbsp;·&nbsp; ` : ''}
            <a href="${esc(utm(registerUrl(w), campaign))}" style="color:${AMBER};font-weight:700;text-decoration:none;">Register →</a>
          </p>
        </td>
      </tr>
    </table>`
  }).join('')
  return section(`${sectionTitle('Upcoming workshops')}${rows}
    <p style="margin:4px 0 0;font-family:${BODY_FONT};font-size:13px;"><a href="${esc(utm(`${SITE_URL}/professional-development`, campaign))}" style="color:${BLUE};text-decoration:none;">See all professional development →</a></p>`)
}

function coursesSection(featured: NewsletterCourse | undefined, others: NewsletterCourse[], campaign: string): string {
  if (!featured) return ''
  const enroll = (c: NewsletterCourse) => utm(`${SITE_URL}/register?category=course&offering=${encodeURIComponent(c.title)}`, campaign)
  const meta = (c: NewsletterCourse) => [c.price != null ? `$${c.price}` : '', c.hours != null ? `${c.hours} ${c.hours === 1 ? 'hour' : 'hours'}` : '', 'online, at your own pace'].filter(Boolean).join(' · ')
  const featuredHtml = `
    ${featured.imageUrl ? `<a href="${esc(enroll(featured))}"><img src="${esc(featured.imageUrl)}?w=1072&h=603&fit=crop&auto=format" width="536" alt="${esc(featured.imageAlt || featured.title)}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:10px;margin:0 0 16px;"></a>` : ''}
    <p style="margin:0 0 4px;font-family:${HEAD_FONT};font-size:19px;font-weight:700;color:${NAVY};">${esc(featured.title)}</p>
    <p style="margin:0 0 10px;font-family:${BODY_FONT};font-size:13px;color:${MUTED};">${esc(meta(featured))}</p>
    <p style="margin:0 0 18px;font-family:${BODY_FONT};font-size:15px;line-height:1.6;color:${INK};">${esc(firstParagraph(featured.description))}</p>
    ${button(enroll(featured), 'Start this course')}`
  const othersHtml = others.length ? `
    <p style="margin:26px 0 8px;font-family:${HEAD_FONT};font-size:14px;font-weight:700;color:${NAVY};">More online brush-up courses</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${others.map(c => `<tr><td style="padding:8px 0;border-top:1px solid #eef0f3;font-family:${BODY_FONT};font-size:14px;color:${INK};">
        <a href="${esc(enroll(c))}" style="color:${NAVY};font-weight:600;text-decoration:none;">${esc(c.title)}</a>
        <span style="color:${MUTED};font-size:13px;"> · ${esc([c.price != null ? `$${c.price}` : '', c.hours != null ? `${c.hours} ${c.hours === 1 ? 'hr' : 'hrs'}` : ''].filter(Boolean).join(' · '))}</span>
      </td></tr>`).join('')}
    </table>` : ''
  return section(`${sectionTitle('Online course spotlight')}${featuredHtml}${othersHtml}`, { bg: PALE })
}

function tipSection(tip: NewsletterContent['issue']['tip']): string {
  if (!tip?.body?.trim()) return ''
  return section(`${sectionTitle('Tip of the month')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="border-left:4px solid ${BLUE};padding:4px 0 4px 18px;">
        ${tip.title ? `<p style="margin:0 0 8px;font-family:${HEAD_FONT};font-size:17px;font-weight:700;color:${NAVY};">${esc(tip.title)}</p>` : ''}
        ${paragraphs(tip.body, `margin:0 0 10px;font-family:${BODY_FONT};font-size:15px;line-height:1.6;color:${INK};`)}
      </td>
    </tr></table>`)
}

function spotlightSection(s: NewsletterContent['issue']['spotlight'], campaign: string): string {
  if (!s?.title?.trim() && !s?.body?.trim()) return ''
  return section(`${sectionTitle('Behind the scenes')}
    ${s.imageUrl ? `<img src="${esc(s.imageUrl)}?w=1072&auto=format" width="536" alt="${esc(s.imageAlt || s.title || '')}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:10px;margin:0 0 16px;">` : ''}
    ${s.title ? `<p style="margin:0 0 8px;font-family:${HEAD_FONT};font-size:17px;font-weight:700;color:${NAVY};">${esc(s.title)}</p>` : ''}
    ${paragraphs(s.body, `margin:0 0 12px;font-family:${BODY_FONT};font-size:15px;line-height:1.6;color:${INK};`)}
    ${s.linkUrl ? `<p style="margin:4px 0 0;font-family:${BODY_FONT};font-size:14px;"><a href="${esc(utm(s.linkUrl, campaign))}" style="color:${BLUE};font-weight:700;text-decoration:none;">${esc(s.linkLabel || 'Read more')} →</a></p>` : ''}`)
}

function referralSection(campaign: string): string {
  return section(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NAVY};border-radius:12px;"><tr>
      <td style="padding:22px 24px;">
        <p style="margin:0 0 6px;font-family:${HEAD_FONT};font-size:17px;font-weight:700;color:#ffffff;">Refer a friend, get 25% off</p>
        <p style="margin:0 0 14px;font-family:${BODY_FONT};font-size:14px;line-height:1.6;color:rgba(255,255,255,0.8);">When a colleague registers for a workshop or online course and adds your email as the person who referred them, we'll email you a 25% off code for your next one.</p>
        <a href="${esc(utm(`${SITE_URL}/professional-development`, campaign))}" style="font-family:${HEAD_FONT};font-size:14px;font-weight:700;color:#FFB45C;text-decoration:none;">Share WDA with a colleague →</a>
      </td>
    </tr></table>`)
}

// ── Shell ────────────────────────────────────────────────────────────────────

function shell(opts: { title: string; preheader?: string; body: string; unsubscribeUrl: string; reason: string }): string {
  const social = SOCIAL.map(s => `<a href="${s.href}" style="color:${BLUE};text-decoration:none;font-weight:600;">${s.label}</a>`).join(' &nbsp;·&nbsp; ')
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<title>${esc(opts.title)}</title>
<style>
  @media (max-width:620px) {
    .wda-sec { padding-left:20px !important; padding-right:20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${PALE};">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(opts.preheader)}${'&nbsp;&zwnj;'.repeat(60)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PALE};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">
      <tr><td align="center" style="background:${NAVY};padding:26px 32px;">
        <a href="${SITE_URL}"><img src="${SITE_URL}/Inverted.png" width="200" alt="Western Dental Academy" style="display:block;width:200px;height:auto;border:0;"></a>
      </td></tr>
      ${opts.body}
      <tr><td class="wda-sec" style="background:${PALE};padding:24px 32px;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
        <p style="margin:0 0 10px;">${social}</p>
        <p style="margin:0 0 6px;"><strong style="color:${NAVY};">Western Dental Academy</strong> · Dental training facility · Built by Dental Educators</p>
        <p style="margin:0 0 6px;">${esc(MAILING_ADDRESS)} · <a href="mailto:info@westerndentalacademy.com" style="color:${MUTED};">info@westerndentalacademy.com</a></p>
        <p style="margin:0 0 6px;">${esc(opts.reason)}</p>
        <p style="margin:0;"><a href="${esc(opts.unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp; <a href="${SITE_URL}/privacy-policy" style="color:${MUTED};text-decoration:underline;">Privacy policy</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

const REASON = "You're receiving this because you subscribed to Western Dental Academy updates."

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/unsubscribe?token=${encodeURIComponent(token)}`
}

export function renderNewsletter(content: NewsletterContent, opts: { unsubscribeToken: string; firstName?: string }): { html: string; text: string } {
  const { issue } = content
  const campaign = `newsletter-${issue.sendDate}`
  const greeting = opts.firstName ? `<p style="margin:0 0 16px;font-family:${BODY_FONT};font-size:15px;color:${INK};">Hi ${esc(opts.firstName)},</p>` : ''

  const body = [
    `<tr><td class="wda-sec" style="padding:32px 32px 12px;">
      <p style="margin:0 0 18px;font-family:${HEAD_FONT};font-size:25px;line-height:1.25;font-weight:700;color:${NAVY};">${esc(issue.headline)}</p>
      ${issue.heroImageUrl ? `<img src="${esc(issue.heroImageUrl)}?w=1072&auto=format" width="536" alt="${esc(issue.heroImageAlt || '')}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:10px;margin:0 0 20px;">` : ''}
      ${greeting}
      ${renderPortable(issue.intro)}
    </td></tr>`,
    workshopsSection(content.workshops, campaign),
    coursesSection(content.featuredCourse, content.otherCourses, campaign),
    tipSection(issue.tip),
    spotlightSection(issue.spotlight, campaign),
    issue.showReferral === false ? '' : referralSection(campaign),
  ].join('')

  const unsub = unsubscribeUrl(opts.unsubscribeToken)
  const html = shell({ title: issue.subject, preheader: issue.previewText, body, unsubscribeUrl: unsub, reason: REASON })

  // Plain-text part
  const t: string[] = [issue.headline, '']
  if (opts.firstName) t.push(`Hi ${opts.firstName},`, '')
  t.push(portableToText(issue.intro), '')
  if (content.workshops.length) {
    t.push('UPCOMING WORKSHOPS', '')
    for (const w of content.workshops) {
      t.push(`${w.title}`, `${formatAlberta(new Date(w.date))}${workshopPrice(w) ? ` · ${workshopPrice(w)}` : ''}`, `Register: ${registerUrl(w)}`, '')
    }
  }
  if (content.featuredCourse) {
    const c = content.featuredCourse
    t.push('ONLINE COURSE SPOTLIGHT', '', c.title, firstParagraph(c.description), `${SITE_URL}/register?category=course&offering=${encodeURIComponent(c.title)}`, '')
    for (const o of content.otherCourses) t.push(`- ${o.title}${o.price != null ? ` ($${o.price})` : ''}`)
    if (content.otherCourses.length) t.push('')
  }
  if (issue.tip?.body) t.push('TIP OF THE MONTH', '', issue.tip.title ?? '', issue.tip.body, '')
  if (issue.spotlight?.body || issue.spotlight?.title) t.push('BEHIND THE SCENES', '', issue.spotlight.title ?? '', issue.spotlight.body ?? '', issue.spotlight.linkUrl ?? '', '')
  if (issue.showReferral !== false) t.push("REFER A FRIEND, GET 25% OFF: when a colleague registers and adds your email as the person who referred them, we'll email you a 25% off code.", '')
  t.push('---', 'Western Dental Academy', MAILING_ADDRESS, REASON, `Unsubscribe: ${unsub}`)

  return { html, text: t.join('\n').replace(/\n{3,}/g, '\n\n') }
}

export function renderWelcome(opts: { unsubscribeToken: string; firstName?: string; courses: NewsletterCourse[] }): { subject: string; html: string; text: string } {
  const campaign = 'welcome'
  const hi = opts.firstName ? `Hi ${esc(opts.firstName)},` : 'Hi there,'
  const courseList = opts.courses.slice(0, 5).map(c =>
    `<li style="margin:0 0 6px;"><a href="${esc(utm(`${SITE_URL}/register?category=course&offering=${encodeURIComponent(c.title)}`, campaign))}" style="color:${NAVY};font-weight:600;text-decoration:none;">${esc(c.title)}</a>${c.price != null ? `<span style="color:${MUTED};"> · $${c.price}</span>` : ''}</li>`,
  ).join('')
  const p = `margin:0 0 16px;font-family:${BODY_FONT};font-size:15px;line-height:1.65;color:${INK};`
  const body = `<tr><td class="wda-sec" style="padding:32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;"><tr>
      <td valign="middle" style="padding-right:14px;"><img src="${SITE_URL}/wes/wes-wave.png" width="72" height="72" alt="Wes, the WDA tooth, waving" style="display:block;border:0;"></td>
      <td valign="middle"><p style="margin:0;font-family:${HEAD_FONT};font-size:24px;font-weight:700;color:${NAVY};">Welcome to the WDA community!</p></td>
    </tr></table>
    <p style="${p}">${hi}</p>
    <p style="${p}">Thanks for subscribing. Once a month we'll send you a short update with upcoming workshops and guest speakers, new online courses, and a practical tip you can use chairside. No spam, and you can unsubscribe any time.</p>
    ${courseList ? `<p style="margin:0 0 8px;font-family:${HEAD_FONT};font-size:15px;font-weight:700;color:${NAVY};">Want to get started now? Try an online brush-up course:</p>
    <ul style="margin:0 0 20px;padding-left:22px;font-family:${BODY_FONT};font-size:14px;line-height:1.6;color:${INK};">${courseList}</ul>` : ''}
    ${button(utm(`${SITE_URL}/professional-development`, campaign), 'See upcoming professional development')}
    <p style="margin:22px 0 0;font-family:${BODY_FONT};font-size:14px;line-height:1.6;color:${INK};">Talk soon,<br>The Western Dental Academy team</p>
  </td></tr>`
  const unsub = unsubscribeUrl(opts.unsubscribeToken)
  const html = shell({ title: 'Welcome to Western Dental Academy', preheader: "You're on the list. Here's what to expect each month.", body, unsubscribeUrl: unsub, reason: REASON })
  const text = [
    'Welcome to the WDA community!', '',
    opts.firstName ? `Hi ${opts.firstName},` : 'Hi there,', '',
    "Thanks for subscribing. Once a month we'll send you a short update with upcoming workshops and guest speakers, new online courses, and a practical tip you can use chairside. No spam, and you can unsubscribe any time.", '',
    ...opts.courses.slice(0, 5).map(c => `- ${c.title}`), '',
    `Upcoming professional development: ${SITE_URL}/professional-development`, '',
    'The Western Dental Academy team', '---', MAILING_ADDRESS, `Unsubscribe: ${unsub}`,
  ].join('\n')
  return { subject: 'Welcome to Western Dental Academy', html, text }
}
