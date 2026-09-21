// Runs the real agent wiring against the local mock Context server with the offline model.
import {start, TOKEN} from '../mock/context-server.mjs'
import {connectAgent, streamAnswer} from '../lib/agent'
import {createOfflineModel} from '../lib/offline-model'
import type {UIMessage} from 'ai'

const server: any = await start(4011)
const base = 'http://127.0.0.1:4011/v1/context/organizations/mock/mcp/ultra-bridge'
// Each question must produce a groq_query call and an answer that contains real data from the dataset.
const questions: [string, RegExp[]][] = [
  ['What is the NVDA equivalent of JAWS Insert+F7?', [/NVDA\+F7/, /Show a list of all links/]],
  ['Which keys do different jobs in JAWS and NVDA?', [/R: in JAWS it means "Jump to the next landmark/, /radio button/, /Q: in JAWS/, /S: in JAWS/]],
  ['Which JAWS commands have no default NVDA equivalent?', [/Search for a command by name/, /Jump to the next article/]],
  ['Which commands in your data are not fully verified?', [/recalled/, /Insert\+Tab/]],
  ['I use JAWS. What should I learn first in NVDA?', [/Numpad 5/, /radio button/]],
]
let failed = 0
for (const [q, expected] of questions) {
  const connected = await connectAgent({token: TOKEN, groqUrl: base, kbUrl: base + '?mode=knowledge_base&knowledgeBases=kb-mock'})
  const messages: UIMessage[] = [{id: 'u1', role: 'user', parts: [{type: 'text', text: q}]}]
  const result = await streamAnswer({messages, model: createOfflineModel(), connected})
  const text = await result.text
  const steps = await result.steps
  const calls = steps.flatMap((s) => s.toolCalls.map((c) => c.toolName))
  console.log('\nQ:', q, '\nTools:', calls.join(','), '\nKB:', connected.usingKnowledgeBase, '\n' + text.slice(0, 700))
  const missing = expected.filter((re) => !re.test(text))
  if (!text.includes('Offline demo') || calls.length === 0 || missing.length) { failed++; console.log('MISSING:', missing.map(String).join(' | ')) }
}
console.log('\nToolset names:', Object.keys((await connectAgent({token: TOKEN, groqUrl: base, kbUrl: base + '?mode=knowledge_base&knowledgeBases=kb-mock'})).tools).join(', '))
// Wrong token must fail cleanly
try {
  await connectAgent({token: 'wrong', groqUrl: base})
  console.log('ERROR: wrong token was accepted'); failed++
} catch (e: any) { console.log('\nWrong token rejected as expected:', String(e.message).slice(0, 80)) }
server.close()
console.log(failed ? `\nFAILED ${failed}` : '\nALL OK')
process.exit(failed ? 1 : 0)
