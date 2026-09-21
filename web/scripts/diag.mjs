// Connectivity check for Ultra Bridge. Run from the web folder: node scripts/diag.mjs
// Prints only status codes and timings. It never prints secrets. Author: Demir Ajvazi
import {readFileSync} from 'node:fs'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
  if (m) env[m[1]] = m[2]
}

async function step(name, fn) {
  const t0 = Date.now()
  try {
    const out = await fn()
    console.log(`OK    ${name} (${Date.now() - t0} ms) ${out ?? ''}`)
  } catch (e) {
    console.log(`FAIL  ${name} (${Date.now() - t0} ms) ${e?.name}: ${e?.message}${e?.cause ? ' / cause: ' + (e.cause.code || e.cause.message) : ''}`)
  }
}

const url = env.SANITY_CONTEXT_MCP_URL
const auth = {Authorization: `Bearer ${env.SANITY_ORGANIZATION_TOKEN}`}
console.log('keys present:', ['SANITY_CONTEXT_MCP_URL', 'SANITY_ORGANIZATION_TOKEN', 'GOOGLE_GENERATIVE_AI_API_KEY'].map((k) => `${k}=${env[k] ? 'yes' : 'NO'}`).join(', '))

await step('Sanity initial-context', async () => {
  const r = await fetch(`${url}/initial-context`, {headers: auth, signal: AbortSignal.timeout(15000)})
  return `status ${r.status}, ${(await r.text()).length} chars`
})

await step('Sanity MCP initialize', async () => {
  const r = await fetch(url, {
    method: 'POST',
    headers: {...auth, 'content-type': 'application/json', accept: 'application/json, text/event-stream'},
    body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'initialize', params: {protocolVersion: '2025-03-26', capabilities: {}, clientInfo: {name: 'diag', version: '1'}}}),
    signal: AbortSignal.timeout(15000),
  })
  return `status ${r.status}`
})

await step('Sanity MCP GET stream (what the AI SDK opens)', async () => {
  const r = await fetch(url, {headers: {...auth, accept: 'text/event-stream'}, signal: AbortSignal.timeout(8000)})
  const status = r.status
  await r.body?.cancel()
  return `status ${status}`
})

const model = env.GEMINI_MODEL || 'gemini-2.5-flash'
await step(`Gemini ${model}`, async () => {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {'content-type': 'application/json', 'x-goog-api-key': env.GOOGLE_GENERATIVE_AI_API_KEY ?? ''},
    body: JSON.stringify({contents: [{role: 'user', parts: [{text: 'Reply with the single word: ready'}]}]}),
    signal: AbortSignal.timeout(30000),
  })
  const body = await r.text()
  return `status ${r.status}${r.ok ? '' : ' ' + body.slice(0, 200)}`
})
console.log('done')
process.exit(0)
