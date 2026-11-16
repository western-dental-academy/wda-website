import { sanity } from './content'

// "Behind the scenes" from a social post link. Paste an Instagram, Facebook,
// TikTok or LinkedIn post link into the newsletter and this fills in the photo
// and caption from the post's public preview (the same data a link preview in
// a chat app uses). The photo is copied into Sanity, because the social
// networks' image links expire after a few days and would break in inboxes.
// Anything already typed in is left alone, so the caption can be edited.

export interface PostPreview { imageUrl?: string; caption?: string; network?: string }

const NETWORKS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)(facebook\.com|fb\.watch|fb\.com)$/, 'Facebook'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)linkedin\.com$/, 'LinkedIn'],
]

export function networkFor(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return NETWORKS.find(([re]) => re.test(host))?.[1]
  } catch {
    return undefined
  }
}

export function postButtonLabel(url: string): string {
  const n = networkFor(url)
  return n ? `See the post on ${n}` : 'See the post'
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

function meta(html: string, prop: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`,
    'i',
  )
  const m = html.match(re)
  const v = m?.[1] ?? m?.[2]
  return v ? decodeEntities(v).trim() : undefined
}

/** Turns a post's preview description into just the caption, without hashtags. */
export function cleanCaption(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  let text = raw
  // Instagram: '12 likes, 3 comments - westerndentalacademy on November 9, 2026: "Caption".'
  const quoted = text.match(/^[^"]{0,200}?\bon [A-Z][a-z]+ \d{1,2}, \d{4}:\s*"([\s\S]*)"\s*\.?\s*$/)
  if (quoted) text = quoted[1]
  // Instagram/TikTok titles: 'Western Dental Academy on Instagram: "Caption"'
  const titled = text.match(/^[^"]{0,120}? on (?:Instagram|TikTok|Facebook):\s*"([\s\S]*)"\s*$/)
  if (titled) text = titled[1]
  text = text
    .replace(/(\s*#[\p{L}\p{N}_]+)+\s*$/u, '') // trailing hashtags
    .replace(/[ \t]+\n/g, '\n')
    .trim()
  if (text.length > 600) text = text.slice(0, text.lastIndexOf(' ', 600)).replace(/[,;:.]$/, '') + '…'
  return text || undefined
}

/** Reads the public preview (photo + caption) of a social post. Never throws. */
export async function fetchPostPreview(url: string): Promise<PostPreview> {
  const network = networkFor(url)
  try {
    const res = await fetch(url, {
      headers: {
        // Social sites only hand link previews to link-preview crawlers
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept-Language': 'en-CA,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    })
    if (!res.ok) return { network }
    const html = (await res.text()).slice(0, 600_000)
    return {
      network,
      imageUrl: meta(html, 'og:image') ?? meta(html, 'twitter:image'),
      caption: cleanCaption(meta(html, 'og:description') ?? meta(html, 'description') ?? meta(html, 'og:title')),
    }
  } catch (err) {
    console.error('Post preview fetch failed:', url, err)
    return { network }
  }
}

interface SpotlightDoc {
  _id: string
  spotlight?: { title?: string; body?: string; postUrl?: string; linkUrl?: string; linkLabel?: string; image?: { asset?: { _ref?: string } } }
}

export interface FillResult { filled: string[]; missing: string[]; network?: string }

/**
 * Fills the behind-the-scenes photo, caption and button from its post link.
 * Works on the draft if there is one (so it shows up in the Studio while
 * editing), otherwise on the published issue; the send job passes
 * preferDraft: false to fill the published issue. Only empty fields are filled.
 */
export async function fillSpotlightFromPost(id: string, opts: { preferDraft?: boolean } = {}): Promise<FillResult | null> {
  const preferDraft = opts.preferDraft !== false
  const baseId = id.replace(/^drafts\./, '')
  const docs = await sanity.fetch<SpotlightDoc[]>(
    `*[_id in [$draft, $base]]{ _id, spotlight{ title, body, postUrl, linkUrl, linkLabel, image } }`,
    { draft: `drafts.${baseId}`, base: baseId },
  )
  const doc = preferDraft
    ? docs.find(d => d._id.startsWith('drafts.')) ?? docs[0]
    : docs.find(d => !d._id.startsWith('drafts.'))
  const postUrl = doc?.spotlight?.postUrl?.trim()
  if (!doc || !postUrl) return null

  const s = doc.spotlight ?? {}
  const preview = await fetchPostPreview(postUrl)
  const set: Record<string, unknown> = {}
  const filled: string[] = []
  const missing: string[] = []

  if (!s.image?.asset?._ref) {
    if (preview.imageUrl) {
      try {
        const img = await fetch(preview.imageUrl, { signal: AbortSignal.timeout(15_000), cache: 'no-store' })
        if (!img.ok) throw new Error(`image ${img.status}`)
        const buf = Buffer.from(await img.arrayBuffer())
        const asset = await sanity.assets.upload('image', buf, {
          filename: `newsletter-${(preview.network ?? 'post').toLowerCase()}-${Date.now()}.jpg`,
          contentType: img.headers.get('content-type') ?? 'image/jpeg',
        })
        set['spotlight.image'] = {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: preview.caption ? preview.caption.split('\n')[0].slice(0, 120) : `Western Dental Academy on ${preview.network ?? 'social media'}`,
        }
        filled.push('photo')
      } catch (err) {
        console.error('Post image copy failed:', err)
        missing.push('photo')
      }
    } else missing.push('photo')
  }
  if (!s.body?.trim()) {
    if (preview.caption) { set['spotlight.body'] = preview.caption; filled.push('caption') }
    else missing.push('caption')
  }
  if (!s.linkUrl?.trim()) { set['spotlight.linkUrl'] = postUrl; filled.push('button link') }
  if (!s.linkLabel?.trim() || s.linkLabel === 'Read more') set['spotlight.linkLabel'] = postButtonLabel(postUrl)

  if (Object.keys(set).length) {
    await sanity.patch(doc._id).setIfMissing({ spotlight: {} }).set(set).commit()
  }
  return { filled, missing, network: preview.network }
}
