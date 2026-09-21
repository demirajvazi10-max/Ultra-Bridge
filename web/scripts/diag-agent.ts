// Runs the real agent outside Next.js and prints every stream event with timing.
// Run from the web folder:  npx tsx --env-file=.env.local scripts/diag-agent.ts
// Prints no secrets. Author: Demir Ajvazi
import {convertToModelMessages, streamText, stepCountIs, type UIMessage} from 'ai'
import {connectAgent, readAgentConfig} from '../lib/agent'
import {pickModel} from '../lib/model'

const t0 = Date.now()
const at = () => `${String(Date.now() - t0).padStart(6)} ms`
const {model, label} = pickModel()
console.log(at(), 'model', label)

async function run(name: string, opts: {tools?: any; system?: string}) {
  console.log(`\n--- ${name} ---`)
  const ac = new AbortController()
  const timer = setTimeout(() => {
    console.log(at(), 'TIMEOUT after 60 s, aborting')
    ac.abort()
  }, 60_000)
  const messages: UIMessage[] = [{id: 'u1', role: 'user', parts: [{type: 'text', text: 'What is the NVDA equivalent of JAWS Insert+F7?'}]}]
  const result = streamText({
    model,
    system: opts.system,
    messages: await convertToModelMessages(messages),
    tools: opts.tools,
    stopWhen: stepCountIs(8),
    abortSignal: ac.signal,
    onError: ({error}) => console.log(at(), 'ERROR', String((error as any)?.message ?? error).slice(0, 600)),
  })
  let text = ''
  try {
    for await (const part of result.fullStream) {
      if (part.type === 'text-delta') text += part.text
      else if (part.type === 'tool-call') console.log(at(), 'tool-call', part.toolName, JSON.stringify(part.input).slice(0, 200))
      else if (part.type === 'tool-result') console.log(at(), 'tool-result', JSON.stringify(part.output).slice(0, 120))
      else if (part.type === 'error') console.log(at(), 'error part', String((part as any).error?.message ?? (part as any).error).slice(0, 600))
      else if (part.type === 'start-step' || part.type === 'finish-step' || part.type === 'finish') console.log(at(), part.type)
    }
  } catch (e: any) {
    console.log(at(), 'THROWN', String(e?.message ?? e).slice(0, 600))
  }
  clearTimeout(timer)
  console.log(at(), 'ANSWER:', text.slice(0, 700) || '(empty)')
}

await run('A: model only, no tools', {system: 'Answer in one sentence.'})

const connected = await connectAgent(readAgentConfig())
console.log(at(), 'connected, tools:', Object.keys(connected.tools).join(', '), '| system prompt chars:', connected.system.length)
await run('B: full agent with Sanity tools', {system: connected.system, tools: connected.tools})
await connected.close()
console.log(at(), 'done')
process.exit(0)
