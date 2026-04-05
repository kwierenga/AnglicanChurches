/**
 * Add an image entry to data/media.csv and rebuild.
 *
 * Usage (interactive):   tsx scripts/add-media.ts
 * Usage (with args):     tsx scripts/add-media.ts --church kingston-parish-church --url https://... --caption "Nave interior" --credit "John Smith"
 */
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const CHURCHES_CSV = path.resolve('data/churches.csv')
const MEDIA_CSV    = path.resolve('data/media.csv')

// ── helpers ──────────────────────────────────────────────────────────────────

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())))
}

function loadChurchIds(): string[] {
  if (!fs.existsSync(CHURCHES_CSV)) return []
  const rows: any[] = parse(fs.readFileSync(CHURCHES_CSV, 'utf8'), { columns: true, skip_empty_lines: true })
  return rows.map(r => r.id)
}

function currentMaxOrder(churchId: string): number {
  if (!fs.existsSync(MEDIA_CSV)) return 0
  const rows: any[] = parse(fs.readFileSync(MEDIA_CSV, 'utf8'), { columns: true, skip_empty_lines: true })
  const orders = rows.filter(r => r.church_id === churchId).map(r => Number(r.order) || 0)
  return orders.length ? Math.max(...orders) : 0
}

function appendRow(row: Record<string, string>) {
  // If file missing or empty, write with header
  const exists = fs.existsSync(MEDIA_CSV) && fs.readFileSync(MEDIA_CSV, 'utf8').trim().length > 0
  if (!exists) {
    fs.writeFileSync(MEDIA_CSV, 'church_id,type,url,caption,credit,license,order\n')
  }
  const line = stringify([row], { header: false })
  fs.appendFileSync(MEDIA_CSV, line)
}

// ── arg parsing ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
function getArg(flag: string): string {
  const i = args.indexOf(flag)
  return i !== -1 && args[i + 1] ? args[i + 1] : ''
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const churchIds = loadChurchIds()
  if (churchIds.length === 0) {
    console.error('❌ No churches found in data/churches.csv')
    process.exit(1)
  }

  let churchId = getArg('--church')
  let url      = getArg('--url')
  let caption  = getArg('--caption')
  let credit   = getArg('--credit')
  let license  = getArg('--license') || 'Unknown'

  const needsPrompt = !churchId || !url
  const rl = needsPrompt
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : null

  if (needsPrompt) {
    console.log('\nAvailable church IDs:')
    churchIds.forEach(id => console.log(`  ${id}`))
    console.log()
  }

  if (!churchId) {
    churchId = await ask(rl!, 'Church ID: ')
  }
  if (!churchIds.includes(churchId)) {
    console.error(`❌ Unknown church ID "${churchId}". Check data/churches.csv.`)
    rl?.close(); process.exit(1)
  }

  if (!url) {
    url = await ask(rl!, 'Image URL (Cloudinary, etc.): ')
  }
  if (!url) {
    console.error('❌ URL is required.')
    rl?.close(); process.exit(1)
  }

  if (!caption && rl) caption = await ask(rl, 'Caption (press Enter to skip): ')
  if (!credit  && rl) credit  = await ask(rl, 'Credit / photographer (press Enter to skip): ')
  if (license === 'Unknown' && rl) {
    const l = await ask(rl, 'License (press Enter for "Unknown"): ')
    if (l) license = l
  }

  rl?.close()

  const order = currentMaxOrder(churchId) + 1
  appendRow({ church_id: churchId, type: 'image', url, caption, credit, license, order: String(order) })

  console.log(`\n✅ Added image #${order} for "${churchId}"`)
  console.log(`   ${url}`)

  // Rebuild
  console.log('\nRebuilding data…')
  const { execSync } = await import('node:child_process')
  execSync('npm run build:data', { stdio: 'inherit' })
}

main()
