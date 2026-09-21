// Unit test for the provider fallback. Run: npx tsx scripts/test-fallback.ts
// Author: Demir Ajvazi
import {streamText, simulateReadableStream} from 'ai'
import {MockLanguageModelV3} from 'ai/test'
import {createFallbackModel} from '../lib/fallback-model'

const usage = {inputTokens: {total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0}, outputTokens: {total: 1, text: 1, reasoning: 0}}
const okParts = (text: string) => [
  {type: 'stream-start', warnings: []},
  {type: 'text-start', id: 't'},
  {type: 'text-delta', id: 't', delta: text},
  {type: 'text-end', id: 't'},
  {type: 'finish', finishReason: {unified: 'stop', raw: 'stop'}, usage},
]
const good = (id: string, text: string) =>
  new MockLanguageModelV3({modelId: id, doStream: async () => ({stream: simulateReadableStream({chunks: okParts(text) as never[]})})})
const throwing = (id: string) =>
  new MockLanguageModelV3({modelId: id, doStream: async () => { throw new Error(`${id}: 429 quota exceeded`) }})
const errorFirst = (id: string) =>
  new MockLanguageModelV3({
    modelId: id,
    doStream: async () => ({stream: simulateReadableStream({chunks: [{type: 'stream-start', warnings: []}, {type: 'error', error: new Error(`${id}: overloaded`)}] as never[]})}),
  })

async function answer(model: ReturnType<typeof createFallbackModel>) {
  const r = streamText({model, prompt: 'hi', maxRetries: 0, onError: () => {}})
  let text = ''
  for await (const p of r.fullStream) {
    if (p.type === 'text-delta') text += p.text
    else if (p.type === 'error') throw (p as {error: Error}).error
  }
  return text
}

let failures = 0
async function check(name: string, run: () => Promise<string>, expected: string | RegExp) {
  let got: string
  try { got = await run() } catch (e) { got = `THROWN ${(e as Error).message}` }
  const ok = typeof expected === 'string' ? got === expected : expected.test(got)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  (got: ${got})`}`)
}

const log: string[] = []
const record = (f: {modelId: string}, _e: unknown, n?: {modelId: string}) => log.push(`${f.modelId}->${n?.modelId ?? 'none'}`)

await check('first provider works, second untouched', () => answer(createFallbackModel([good('a', 'from a'), good('b', 'from b')])), 'from a')
await check('first throws (429), second answers', () => answer(createFallbackModel([throwing('a'), good('b', 'from b')], {onFallback: record})), 'from b')
await check('first stream errors right away, second answers', () => answer(createFallbackModel([errorFirst('a'), good('b', 'from b')], {onFallback: record})), 'from b')
await check('two fail, third answers', () => answer(createFallbackModel([throwing('a'), errorFirst('b'), good('c', 'from c')], {onFallback: record})), 'from c')
await check('all fail, error is reported', () => answer(createFallbackModel([throwing('a'), throwing('b')])), /THROWN b: 429 quota exceeded/)
await check('fallback callback saw the hand-offs', async () => log.join(','), 'a->b,a->b,a->b,b->c')
const silent = (id: string) =>
  new MockLanguageModelV3({modelId: id, doStream: async ({abortSignal}) => new Promise((_, reject) => abortSignal?.addEventListener('abort', () => reject(new Error('aborted'))))})
const stalled = (id: string) =>
  new MockLanguageModelV3({modelId: id, doStream: async () => ({stream: new ReadableStream({start(c) { c.enqueue({type: 'stream-start', warnings: []}) }})})})
await check('silent provider is skipped after the timeout', () => answer(createFallbackModel([silent('a'), good('b', 'from b')], {firstOutputTimeoutMs: 300})), 'from b')
await check('stalled stream is skipped after the timeout', () => answer(createFallbackModel([stalled('a'), good('b', 'from b')], {firstOutputTimeoutMs: 300})), 'from b')
let aCalls = 0
const counted = new MockLanguageModelV3({modelId: 'a', doStream: async () => { aCalls++; const e = new Error('429') as Error & {statusCode: number}; e.statusCode = 429; throw e }})
const twice = createFallbackModel([counted, good('b', 'from b')])
await answer(twice)
await answer(twice)
await check('a rate limited model is skipped on the next question', async () => String(aCalls), '1')
process.exit(failures ? 1 : 0)
