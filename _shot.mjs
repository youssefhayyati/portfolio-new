import { chromium } from 'playwright-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const OUT = 'C:/Users/youss/AppData/Local/Temp/claude/c--Users-youss-portfolio-nuxt/c15ebce8-ff21-4722-9c26-9c3f0bab341a/scratchpad'
const URL = 'http://localhost:3000'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })

const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1500)

const maxScroll = await page.evaluate(() =>
  Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight
)
console.log('maxScroll:', maxScroll)

const steps = 14
for (let i = 0; i <= steps; i++) {
  const y = Math.round((maxScroll * i) / steps)
  await page.evaluate((yy) => window.scrollTo(0, yy), y)
  await page.waitForTimeout(1100)
  const n = String(i).padStart(2, '0')
  await page.screenshot({ path: `${OUT}/shot-${n}.png` })
  const label = await page.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
    const sec = el?.closest('section, footer')
    return sec?.id || (sec?.className || '').slice(0, 40) || 'n/a'
  })
  console.log(`shot-${n}.png  y=${y}  center=${label}`)
}

console.log('CONSOLE_ERRORS:', errors.length)
errors.slice(0, 20).forEach((e) => console.log('  -', e))
await browser.close()
