import { createClient } from '@sanity/client'
import { fillMonth } from './schedule'

// Loads a newsletter issue plus the parts that fill themselves in:
// upcoming workshop dates and active online courses.

export const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export const WORKSHOP_WINDOW_DAYS = 60

export interface PortableSpan { _type: 'span'; text: string; marks?: string[] }
export interface PortableBlock {
  _type: 'block'
  _key?: string
  style?: string
  listItem?: string
  children?: PortableSpan[]
  markDefs?: { _key: string; _type: string; href?: string }[]
}

export interface NewsletterIssue {
  _id: string
  subject: string
  previewText?: string
  headline: string
  heroImageUrl?: string
  heroImageAlt?: string
  intro?: PortableBlock[]
  showWorkshops?: boolean
  featuredCourseId?: string
  showAllCourses?: boolean
  highlights?: NewsletterHighlight[]
  tip?: { title?: string; body?: string }
  spotlight?: { postUrl?: string; title?: string; body?: string; imageUrl?: string; imageAlt?: string; linkUrl?: string; linkLabel?: string }
  showReferral?: boolean
  sendDate: string
  sendTime: string
  readyToSend?: boolean
  deliveryStatus?: string
  sentTo?: string[]
}

export interface NewsletterHighlight {
  _key?: string
  label?: string
  title: string
  body?: string
  details?: string[]
  linkUrl?: string
  linkLabel?: string
}

export interface UpcomingWorkshop {
  dateId: string
  date: string
  title: string
  category?: string
  description?: string
  price?: number
  hasVirtualOption?: boolean
  virtualPrice?: number
  hours?: number
}

export interface NewsletterCourse {
  _id: string
  title: string
  description?: string
  price?: number
  hours?: number
  imageUrl?: string
  imageAlt?: string
  createdAt: string
}

export interface NewsletterContent {
  issue: NewsletterIssue
  workshops: UpcomingWorkshop[]
  featuredCourse?: NewsletterCourse
  otherCourses: NewsletterCourse[]
}

export const ISSUE_PROJECTION = `{
  _id, subject, previewText, headline,
  "heroImageUrl": heroImage.asset->url, "heroImageAlt": heroImage.alt,
  intro, showWorkshops, "featuredCourseId": featuredCourse._ref, showAllCourses,
  highlights[]{ _key, label, title, body, details, linkUrl, linkLabel },
  tip,
  spotlight{ postUrl, title, body, linkUrl, linkLabel, "imageUrl": image.asset->url, "imageAlt": image.alt },
  showReferral, sendDate, sendTime, readyToSend, deliveryStatus, sentTo
}`

/** Loads an issue by id. Pass draft=true to read the unpublished draft (for previews and tests). */
export async function loadIssue(id: string, opts: { draft?: boolean } = {}): Promise<NewsletterIssue | null> {
  const baseId = id.replace(/^drafts\./, '')
  if (opts.draft) {
    const draft = await sanity.fetch<NewsletterIssue | null>(
      `*[_id == $id][0]${ISSUE_PROJECTION}`, { id: `drafts.${baseId}` },
    )
    if (draft) return draft
  }
  return sanity.fetch<NewsletterIssue | null>(
    `*[_id == $id && !(_id in path("drafts.**"))][0]${ISSUE_PROJECTION}`, { id: baseId },
  )
}

/** Fills in the automatic sections as they will look on the issue's send day. */
export async function buildContent(issue: NewsletterIssue, sendAt: Date): Promise<NewsletterContent> {
  // Workshops: from the send time (or now, if later) to 60 days after it.
  const from = new Date(Math.max(sendAt.getTime(), Date.now())).toISOString()
  const to = new Date(sendAt.getTime() + WORKSHOP_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const [workshops, courses] = await Promise.all([
    issue.showWorkshops === false
      ? Promise.resolve([] as UpcomingWorkshop[])
      : sanity.fetch<UpcomingWorkshop[]>(
          `*[_type == "workshopDate" && !(_id in path("drafts.**")) && active != false
              && dateTime(date) > dateTime($from) && dateTime(date) < dateTime($to)
              && offering->category in ["workshop", "guest-speaker"]]
            | order(date asc)[0...8]{
              "dateId": _id, date,
              "title": offering->title, "category": offering->category,
              "description": offering->description, "price": offering->price,
              "hasVirtualOption": offering->hasVirtualOption, "virtualPrice": offering->virtualPrice,
              "hours": offering->hours
            }`,
          { from, to },
        ),
    sanity.fetch<NewsletterCourse[]>(
      `*[_type == "onlineCourse" && !(_id in path("drafts.**")) && active == true]
        | order(_createdAt desc){
          _id, title, description, price, hours,
          "imageUrl": image.asset->url, "imageAlt": image.alt, "createdAt": _createdAt
        }`,
    ),
  ])

  const featuredCourse = courses.find(c => c._id === issue.featuredCourseId) ?? courses[0]
  const otherCourses = issue.showAllCourses === false
    ? []
    : courses.filter(c => c._id !== featuredCourse?._id)

  return { issue: withMonth(issue), workshops: workshops.filter(w => w.title), featuredCourse, otherCourses }
}

/** The issue with {month} in its subject, preview text and headline filled in. */
export function withMonth(issue: NewsletterIssue): NewsletterIssue {
  return {
    ...issue,
    subject: fillMonth(issue.subject, issue.sendDate),
    previewText: issue.previewText ? fillMonth(issue.previewText, issue.sendDate) : issue.previewText,
    headline: fillMonth(issue.headline, issue.sendDate),
  }
}
