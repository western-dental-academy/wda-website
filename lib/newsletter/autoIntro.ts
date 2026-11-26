import type { NewsletterContent, PortableBlock } from './content'
import { formatAlberta, monthName } from './schedule'

// The intro note, written automatically when the Intro field is left empty:
// a short seasonal opener for the send month, then a line built from what is
// actually in this issue (upcoming workshops, newest course, tip).

const OPENERS: Record<string, string> = {
  January: 'Happy New Year from all of us at Western Dental Academy! A new year is a great time to set a learning goal or two, and we would love to help you reach them.',
  February: 'February is here, and with it a great chance to warm up with some new learning between the busy days at the office.',
  March: 'Spring is just around the corner, and we have been busy planning new ways to help Dental Professionals keep their skills sharp.',
  April: 'April is Oral Health Month in Canada, a perfect time to celebrate the work you do for your patients every single day.',
  May: 'May is here and the days are getting longer. Thank you for the care you bring to your patients and your team.',
  June: 'Summer is almost here! Before the holidays roll in, here is a look at what is new at Western Dental Academy.',
  July: 'Happy summer from the WDA team! We hope you are finding some time to rest and recharge.',
  August: 'Summer is winding down and fall schedules are filling up. Here is what is coming up at Western Dental Academy.',
  September: 'Welcome to fall! It is a fresh season and a great time to brush up on your skills.',
  October: 'Happy October from all of us at Western Dental Academy! The leaves are changing and so is our lineup.',
  November: 'November is here, and we are grateful for the Dental Professionals who make our community what it is.',
  December: 'As the year wraps up, thank you for being part of the Western Dental Academy community. We wish you a restful and happy holiday season.',
}

export function autoIntroText(content: NewsletterContent): string[] {
  const month = monthName(content.issue.sendDate)
  const paragraphs = [OPENERS[month] ?? `Here is your ${month} update from Western Dental Academy.`]

  const lines: string[] = []
  const news = (content.issue.highlights ?? []).filter(h => h?.title?.trim())
  if (news.length) lines.push(news.length === 1 ? `We have some exciting news to share: ${news[0].title}.` : "We have some exciting news to share, so read on to see what's new.")
  const w = content.workshops
  if (w.length === 1) {
    lines.push(`Our next workshop is ${w[0].title} on ${formatAlberta(new Date(w[0].date), { withTime: false })}.`)
  } else if (w.length > 1) {
    lines.push(`We have ${w.length} workshops coming up, starting with ${w[0].title} on ${formatAlberta(new Date(w[0].date), { withTime: false })}.`)
  }
  if (content.featuredCourse) lines.push(`This month's featured online course is ${content.featuredCourse.title}, and you can take it at your own pace.`)
  if (content.issue.tip?.body?.trim()) lines.push("Scroll down for this month's tip.")

  if (lines.length) paragraphs.push(lines.join(' '))
  paragraphs.push('We hope to see you soon!')
  return paragraphs
}

/** The auto intro as Portable Text, so it renders like a hand-written one. */
export function autoIntroBlocks(content: NewsletterContent): PortableBlock[] {
  return autoIntroText(content).map((text, i) => ({
    _type: 'block',
    _key: `auto${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text }],
  }))
}
