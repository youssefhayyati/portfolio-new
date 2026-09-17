import { chromium } from 'playwright-core'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })
for (let run = 1; run <= 2; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const msgs = []
  page.on('console', (m) => { if (/hydrat|mismatch/i.test(m.text())) msgs.push(`${m.type()}: ${m.text().slice(0, 300)}`) })
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3000)
  console.log(`run ${run}:`, msgs.length ? msgs : 'no hydration messages')
  await page.close()
}
await browser.close()
