/**
 * Scrapes news from the Anglican Diocese of Jamaica website
 * and writes a JSON file for the frontend to consume.
 * Items older than 6 months are automatically removed.
 *
 * Usage: npx tsx scripts/fetch-news.ts
 */
import * as cheerio from 'cheerio'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DIOCESE_URL = 'https://www.anglicandioceseja.org'
const NEWS_URL   = `${DIOCESE_URL}/news`
const OUT_DIR    = join(__dirname, '..', 'data', 'build')
const OUT_FILE   = join(OUT_DIR, 'news.json')
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

interface NewsItem {
  title: string
  date: string
  category: string
  summary: string
  url: string
  source: string
}

// URL segments that indicate non-article pages
const NON_ARTICLE = [
  '/about-us/', '/our-ministries/', '/facilities/', '/the-anglican-communion/',
  '/contact-us/', '/resources/', '/schools/', '/youth-ministry/',
  '/donate', '/privacy', '/terms', '/category/', '/tag/', '/page/',
  '/education-youth/', '/cycle-of-prayer/', '/baptism/', '/confirmation/',
  '/stewardship/', '/anglican-youth/', '/brotherhood/', '/mothers-union/',
  '/supplementary-ministry', '/vision-purpose', '/churches-by-parish',
  '/find-a-church', '/the-anglican-2/', '/pdf-resource/',
  '/cathedral-chapter', '/clerical-directory', '/property-db', '/property-database',
  '/worship-resources', '/spiritual-path', '/brochures', '/bookmarker',
  '/200th-anniversary', '/bible-study', '/lenten', '/advent',
  '/back-to-school', '/restore-hope', '/anglican-brochures',
  '/our-spiritual-path', '/worship-resources', '/links/'
]

function isArticleUrl(url: string): boolean {
  const path = new URL(url).pathname
  if (path === '/' || path === '/news/' || path === '/news') return false
  return !NON_ARTICLE.some(seg => path.includes(seg))
}

function parseDate(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''

  // ISO date from meta tag
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) return trimmed.slice(0, 10)

  // "November 2025"
  const monthYear = trimmed.match(/^(\w+)\s+(\d{4})$/)
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }

  // "September 28, 2025"
  const d = new Date(trimmed)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)

  return ''
}

function isWithinSixMonths(dateStr: string): boolean {
  if (!dateStr) return true
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return true
  return Date.now() - d.getTime() < SIX_MONTHS_MS
}

// Match dates like "February 8th, 2026", "November 10, 2025", "July 2024", "September 28, 2025"
const DATE_RE = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}(?:st|nd|rd|th)?,?\s+)?\d{4}\b/i

async function fetchArticleDetails(url: string): Promise<{date: string, summary: string, category: string}> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!r.ok) return { date: '', summary: '', category: '' }
    const html = await r.text()
    const $ = cheerio.load(html)

    // Date: try structured markup first
    let date = parseDate(
      $('meta[property="article:published_time"]').attr('content') ||
      $('time[datetime]').attr('datetime') ||
      $('time').first().text() ||
      $('.date, .entry-date, .post-date').first().text() ||
      ''
    )

    // Fallback: scan full page text for date pattern
    // Note: cheerio strips <br> without adding spaces, so "2026My" can happen.
    // We insert spaces around tags before extracting text.
    if (!date) {
      const bodyHtml = $.html()
      const spaced = bodyHtml.replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ')
      const $spaced = cheerio.load(spaced)
      const bodyText = $spaced.text()
      const match = bodyText.match(DATE_RE)
      if (match) {
        const cleaned = match[0].replace(/(\d+)(st|nd|rd|th)/g, '$1')
        date = parseDate(cleaned)
      }
    }

    // Summary: first meaningful paragraph (with <br> replaced by spaces)
    let summary = ''
    $('article p, .entry-content p, .post-content p, .elementor-widget-text-editor p').each((_, el) => {
      if (summary) return
      // Replace <br> with space before extracting text
      const html = $(el).html() || ''
      const cleaned = html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (cleaned.length > 40) summary = cleaned.slice(0, 300)
    })

    // Category
    const category = $('[rel="tag"], .category-link, .post-categories a').first().text().trim()

    return { date, summary, category }
  } catch {
    return { date: '', summary: '', category: '' }
  }
}

async function fetchDioceseNews(): Promise<NewsItem[]> {
  console.log(`Fetching ${NEWS_URL} ...`)
  const res = await fetch(NEWS_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  // Collect all unique article links from the page
  const urlSet = new Set<string>()
  const items: { title: string; url: string }[] = []

  $('a').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()
    if (!href.includes('anglicandioceseja.org')) return
    if (!text || text.length < 15) return
    if (urlSet.has(href)) return

    try {
      if (!isArticleUrl(href)) return
    } catch { return }

    urlSet.add(href)
    items.push({ title: text, url: href })
  })

  console.log(`Found ${items.length} article links, fetching details...`)

  // Fetch article pages in batches of 5 for dates & summaries
  const results: NewsItem[] = []
  for (let i = 0; i < items.length; i += 5) {
    const batch = items.slice(i, i + 5)
    const details = await Promise.all(batch.map(item => fetchArticleDetails(item.url)))
    batch.forEach((item, j) => {
      results.push({
        title: item.title,
        date: details[j].date,
        category: details[j].category || 'Diocese',
        summary: details[j].summary,
        url: item.url,
        source: 'Anglican Diocese of Jamaica'
      })
    })
  }

  return results
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  let existing: NewsItem[] = []
  if (existsSync(OUT_FILE)) {
    try { existing = JSON.parse(readFileSync(OUT_FILE, 'utf-8')) } catch {}
  }

  const fresh = await fetchDioceseNews()
  console.log(`Parsed ${fresh.length} news articles from Diocese`)

  // Merge by URL
  const byUrl = new Map<string, NewsItem>()
  for (const item of existing) byUrl.set(item.url, item)
  for (const item of fresh) byUrl.set(item.url, item)

  // Remove items older than 6 months
  const all = [...byUrl.values()].filter(item => isWithinSixMonths(item.date))

  // Sort: newest first, undated at end
  all.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })

  writeFileSync(OUT_FILE, JSON.stringify(all, null, 2))
  console.log(`✅ Wrote ${all.length} news items → ${OUT_FILE}`)
}

main().catch(err => { console.error(err); process.exit(1) })
