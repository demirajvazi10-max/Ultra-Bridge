// End-to-end test: real browser, real Next server, mock Sanity Context, offline model.
// Checks behaviour AND accessibility (axe-core) because this app is meant for screen reader users.
import {chromium} from 'playwright-core'
import {readFileSync} from 'node:fs'
import {spawn} from 'node:child_process'
import {start, TOKEN} from '../mock/context-server.mjs'

const PORT = 3100
const MOCK = 4013
const results = []
const check = (name, ok, extra = '') => {
  results.push(ok)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`)
}

const mock = await start(MOCK)
const base = `http://127.0.0.1:${MOCK}/v1/context/organizations/mock/mcp/ultra-bridge`
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  env: {
    ...process.env,
    SANITY_CONTEXT_MCP_URL: base,
    SANITY_CONTEXT_KB_MCP_URL: base + '?mode=knowledge_base&knowledgeBases=kb-mock',
    SANITY_ORGANIZATION_TOKEN: TOKEN,
    ULTRA_MODEL: 'offline',
    RATE_LIMIT_PER_MINUTE: '40',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverLog = ''
server.stdout.on('data', (d) => (serverLog += d))
server.stderr.on('data', (d) => (serverLog += d))
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/api/health`)).ok) break } catch {}
  await new Promise((r) => setTimeout(r, 500))
}

const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox']})
const axeSource = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
async function axe(page, label) {
  await page.evaluate(axeSource)
  const res = await page.evaluate(async () => await window.axe.run(document, {runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']}))
  const serious = res.violations.filter((v) => ['serious', 'critical', 'moderate'].includes(v.impact))
  check(`axe: no violations (${label})`, serious.length === 0, serious.map((v) => `${v.id}[${v.impact}] x${v.nodes.length}`).join(', '))
  if (serious.length) for (const v of serious) console.log('   ', v.id, v.help, v.nodes.slice(0, 2).map((n) => n.html.slice(0, 120)))
}

try {
  const health = await (await fetch(`http://127.0.0.1:${PORT}/api/health`)).json()
  check('health reports data, KB and offline model', health.structuredData && health.knowledgeBase && health.model.includes('offline'), JSON.stringify(health))

  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({colorScheme: scheme, viewport: {width: 1000, height: 900}})
    const page = await ctx.newPage()
    await page.goto(`http://127.0.0.1:${PORT}/`)
    await page.waitForSelector('#question')
    await axe(page, `${scheme}, empty state`)
    if (scheme === 'light') {
      check('page has exactly one h1', (await page.locator('h1').count()) === 1)
      check('input has an accessible label', (await page.getByLabel('Your question about JAWS and NVDA keyboard commands').count()) === 1)
      await page.keyboard.press('Tab')
      const first = await page.evaluate(() => document.activeElement?.textContent?.trim())
      check('first Tab stop is the skip link', first === 'Skip to main content', first)
    }

    // Ask by typing and pressing Enter, like a keyboard user
    await page.fill('#question', 'What is the NVDA equivalent of JAWS Insert+F7?')
    await page.press('#question', 'Enter')
    await page.waitForFunction(() => /^Answer\./.test(document.querySelector('[role=status]')?.textContent ?? ''), null, {timeout: 20000})
    const announced = await page.locator('[role=status]').textContent()
    check(`(${scheme}) answer announced once complete with real data`, /NVDA\+F7/.test(announced) && /Show a list of all links/.test(announced), announced.slice(0, 110))
    check(`(${scheme}) focus stays in the input`, await page.evaluate(() => document.activeElement?.id === 'question'))
    check(`(${scheme}) input cleared after asking`, (await page.inputValue('#question')) === '')
    const summary = await page.locator('summary').first().textContent()
    check(`(${scheme}) "how this was found" is offered`, /How this was found \(1 lookup\)/.test(summary), summary)
    await page.locator('summary').first().click()
    const q = await page.locator('details pre code').first().textContent()
    check(`(${scheme}) shows the GROQ query behind the answer`, q.includes('_type=="command"'), q.slice(0, 60))
    await axe(page, `${scheme}, with answer and details open`)

    // Suggestion button flow
    await page.getByRole('button', {name: 'Which keys do different jobs in JAWS and NVDA?'}).click()
    await page.waitForFunction(() => /radio button/.test(document.querySelector('[role=status]')?.textContent ?? ''), null, {timeout: 20000})
    const collisions = await page.locator('[role=status]').textContent()
    check(`(${scheme}) collision question returns the relationship answer`, /R: in JAWS/.test(collisions) && /Q: in JAWS/.test(collisions))
    const headings = await page.locator('h3').allTextContents()
    check(`(${scheme}) each turn has a heading for H navigation`, headings.filter((h) => h === 'You asked').length === 2 && headings.filter((h) => h === 'Ultra Bridge answers').length === 2, headings.join(' | '))

    // Read again + clear
    await page.getByRole('button', {name: 'Read last answer again'}).click()
    await page.waitForFunction(() => /^Answer\./.test(document.querySelector('[role=status]')?.textContent ?? ''))
    check(`(${scheme}) "Read last answer again" re-announces`, true)
    if (scheme === 'light') await page.screenshot({path: '/tmp/ultra-bridge-light.png', fullPage: true})
    if (scheme === 'dark') await page.screenshot({path: '/tmp/ultra-bridge-dark.png', fullPage: true})
    await page.getByRole('button', {name: 'Clear conversation'}).click()
    check(`(${scheme}) clear conversation empties the log`, (await page.locator('.turn').count()) === 0)
    await ctx.close()
  }

  // Mobile width: no horizontal scroll
  const mctx = await browser.newContext({viewport: {width: 360, height: 740}})
  const mpage = await mctx.newPage()
  await mpage.goto(`http://127.0.0.1:${PORT}/`)
  const overflow = await mpage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  check('no horizontal scrolling at 360px width', !overflow)
  await mctx.close()

  // API behaviour
  const post = (body, ip) => fetch(`http://127.0.0.1:${PORT}/api/chat`, {method: 'POST', headers: {'content-type': 'application/json', 'x-forwarded-for': ip}, body})
  check('bad JSON returns 400', (await post('not json', '9.9.9.1')).status === 400)
  check('empty messages returns 400', (await post('{"messages":[]}', '9.9.9.2')).status === 400)
  const long = JSON.stringify({messages: [{id: '1', role: 'user', parts: [{type: 'text', text: 'x'.repeat(1200)}]}]})
  check('over-long message returns 400', (await post(long, '9.9.9.3')).status === 400)
  let limited = 0
  for (let i = 0; i < 45; i++) if ((await post('{"messages":[]}', '9.9.9.4')).status === 429) limited++
  check('rate limit kicks in (429)', limited >= 4, `limited=${limited}`)
} catch (err) {
  console.error('E2E crashed:', err)
  results.push(false)
} finally {
  await browser.close()
  server.kill()
  mock.close()
}
const failed = results.filter((r) => !r).length
console.log(failed ? `\n${failed} FAILED of ${results.length}` : `\nALL ${results.length} CHECKS PASSED`)
if (failed) console.log('--- server log ---\n' + serverLog.slice(-2000))
process.exit(failed ? 1 : 0)
