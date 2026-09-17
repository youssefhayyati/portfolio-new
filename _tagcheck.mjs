import { chromium } from 'playwright-core'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const OUT = process.argv[2]

const run = async (w, h, name) => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true })
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)) })
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 })
  await page.mouse.move(2, 2)
  // collapse the dev tuner so it is not in the shot
  await page.waitForTimeout(3600)
  await page.screenshot({ path: `${OUT}/${name}-rising.png` })
  await page.waitForTimeout(12000)
  const btn = page.locator('.cowl-tuner button', { hasText: 'cowl fit' })
  if (await btn.count()) await btn.click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  const info = await page.evaluate(() => {
    const t = document.querySelector('.hero-tagline')
    const r = t.getBoundingClientRect()
    const lines = [...t.querySelectorAll('.tagline-line')].map((l) => {
      const lr = l.getBoundingClientRect()
      return { w: Math.round(lr.width), scrollW: l.scrollWidth, transform: getComputedStyle(l).transform }
    })
    return {
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      fontSize: getComputedStyle(t).fontSize,
      lines,
      docOverflowX: document.documentElement.scrollWidth > window.innerWidth,
    }
  })
  console.log(name, JSON.stringify(info))
  console.log(name, 'errors', errors)
  await browser.close()
}

await run(1440, 900, 'tag-desktop')
await run(1920, 1080, 'tag-wide')
await run(1024, 768, 'tag-laptop')
await run(400, 860, 'tag-phone')
