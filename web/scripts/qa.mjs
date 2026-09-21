// Asks the running app a fixed set of questions and writes qa-report.md.
// Start the app first (npm run dev), then from the web folder:  node scripts/qa.mjs
// Author: Demir Ajvazi
import {writeFileSync} from 'node:fs'

const BASE = process.env.QA_BASE_URL || 'http://localhost:3000'
const PAUSE_MS = Number(process.env.QA_PAUSE_MS || 14000)

const QUESTIONS = [
  'What is the NVDA equivalent of JAWS Insert+F7?',
  'Which keys do different jobs in JAWS and NVDA?',
  'Which JAWS commands have no default NVDA equivalent?',
  'How do I read the whole page with NVDA on a laptop?',
  'I use JAWS. What should I learn first in NVDA?',
  'Which commands in your data are not fully verified?',
  'What does Insert+F7 do in NVDA?',
  'Kako u NVDA-u pročitam ceo prozor?',
  'Which JAWS command lists all headings?',
  'What is the NVDA shortcut for the Windows Copilot key?',
  'How do I change the speech rate in JAWS and in NVDA?',
  'What is the difference between the JAWS virtual cursor and NVDA browse mode?',
  'Which NVDA commands in your data were only recalled and not tested?',
  'How do I pause speech in NVDA?',
  'What is the NVDA command to open the Braille settings?',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ask(q, attempt = 1) {
  const t0 = Date.now()
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({messages: [{id: 'u1', role: 'user', parts: [{type: 'text', text: q}]}]}),
    signal: AbortSignal.timeout(90_000),
  })
  if (res.status === 429 && attempt < 3) {
    process.stdout.write(`[app limiter, waiting 65 s] `)
    await sleep(65_000)
    return ask(q, attempt + 1)
  }
  if (!res.ok) return {q, ms: Date.now() - t0, error: `HTTP ${res.status} ${(await res.text()).slice(0, 200)}`}
  const body = await res.text()
  let answer = ''
  const tools = []
  const errors = []
  for (const line of body.split('\n')) {
    if (!line.startsWith('data:')) continue
    const d = line.slice(5).trim()
    if (!d || d === '[DONE]') continue
    try {
      const e = JSON.parse(d)
      if (e.type === 'text-delta') answer += e.delta
      else if (e.type === 'tool-input-available') tools.push(`${e.toolName}: ${JSON.stringify(e.input)}`)
      else if (e.type === 'error') errors.push(e.errorText)
    } catch {}
  }
  if (!answer && errors.some((x) => /quota|429|rate limited|exhaust/i.test(x)) && attempt < 2) {
    process.stdout.write(`[model rate limited, waiting 65 s and trying once more] `)
    await sleep(65_000)
    return ask(q, attempt + 1)
  }
  return {q, ms: Date.now() - t0, answer, tools, errors}
}

const out = ['# Ultra Bridge QA report', '', `Run: ${new Date().toISOString()}`, '']
let ok = 0
for (const [i, q] of QUESTIONS.entries()) {
  process.stdout.write(`${i + 1}/${QUESTIONS.length} ${q} ... `)
  let r
  try {
    r = await ask(q)
  } catch (e) {
    r = {q, ms: 0, error: String(e?.message || e)}
  }
  const hasLevel = /(tested by the author|cross-checked|first-party|third-party|recalled|not confirmed|not in the data|verified)/i.test(r.answer || '')
  const hasSources = /sources?:/i.test(r.answer || '')
  const status = r.error ? 'ERROR' : !r.answer ? 'EMPTY' : 'ok'
  if (status === 'ok') ok++
  console.log(`${status} (${(r.ms / 1000).toFixed(1)} s)`)
  out.push(`## ${i + 1}. ${q}`, '', `Status: ${status}. Time: ${(r.ms / 1000).toFixed(1)} s. Verification wording: ${hasLevel ? 'yes' : 'NO'}. Sources line: ${hasSources ? 'yes' : 'NO'}.`, '')
  if (r.error) out.push(`Error: ${r.error}`, '')
  if (r.errors?.length) out.push(`Stream errors: ${r.errors.join(' | ').slice(0, 400)}`, '')
  if (r.tools?.length) out.push('Queries:', ...r.tools.map((t) => `- ${t.slice(0, 600)}`), '')
  out.push('Answer:', '', r.answer || '(empty)', '')
  writeFileSync('qa-report.md', out.join('\n'))
  if (i < QUESTIONS.length - 1) await sleep(PAUSE_MS)
}
out.splice(3, 0, `Summary: ${ok} of ${QUESTIONS.length} questions answered.`, '')
writeFileSync('qa-report.md', out.join('\n'))
console.log(`\nDone. ${ok}/${QUESTIONS.length} answered. Report: qa-report.md`)
