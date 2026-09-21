// Local stand-in for Sanity Context MCP, backed by the seed file and groq-js.
// It speaks the same tool names as the hosted service (initial_context, groq_query,
// schema_explorer, knowledge_base_read) so the agent code can be tested offline.
// Author: Demir Ajvazi
import http from 'node:http'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'
import {parse, evaluate} from 'groq-js'
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import {z} from 'zod'

const here = dirname(fileURLToPath(import.meta.url))
const seedPath = process.env.SEED_FILE ?? join(here, '..', '..', 'seed', 'seed.ndjson')
const dataset = readFileSync(seedPath, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l))

export const TOKEN = 'mock-token'
const PORT = Number(process.env.MOCK_PORT ?? 4010)

function schemaOverview() {
  const byType = {}
  for (const d of dataset) {
    const t = (byType[d._type] ??= {count: 0, fields: new Set()})
    t.count++
    Object.keys(d).forEach((k) => !k.startsWith('_') && t.fields.add(k))
  }
  return Object.entries(byType)
    .map(([type, {count, fields}]) => `${type} (${count} documents): ${[...fields].join(', ')}`)
    .join('\n')
}

async function runGroq(query) {
  try {
    const tree = parse(query)
    const value = await evaluate(tree, {dataset})
    const result = await value.get()
    const count = Array.isArray(result) ? result.length : result == null ? 0 : 1
    return {meta: {executedQuery: query, perspective: 'published', resultCount: count, returnedCount: count, warnings: []}, result}
  } catch (err) {
    return {meta: {executedQuery: query, warnings: []}, result: {error: String(err.message ?? err)}}
  }
}

const guides = dataset.filter((d) => d._type === 'guide')

function buildServer(mode) {
  const server = new McpServer({name: 'mock-sanity-context', version: '0.0.1'})
  const text = (t) => ({content: [{type: 'text', text: typeof t === 'string' ? t : JSON.stringify(t)}]})
  if (mode === 'knowledge_base') {
    server.registerTool('initial_context', {description: 'Outline of the knowledge base'}, async () => text(kbOutline()))
    server.registerTool(
      'knowledge_base_read',
      {
        description: 'Read entries from a knowledge base by path.',
        inputSchema: {knowledgeBase: z.string(), paths: z.array(z.string()).min(1).max(20)},
      },
      async ({paths}) => {
        const found = []
        const missing = []
        for (const p of paths) {
          const g = guides.find((x) => `/guides/${x.slug.current}` === p)
          if (g) found.push(`# ${p}\n${g.body}`)
          else missing.push(p)
        }
        return text(found.join('\n\n') + (missing.length ? `\n\nNot found: ${missing.join(', ')}` : ''))
      },
    )
  } else {
    server.registerTool('initial_context', {description: 'Schema overview and query instructions'}, async () => text(groqContext()))
    server.registerTool(
      'schema_explorer',
      {description: 'Explore the schema of a document type', inputSchema: {type: z.string(), path: z.string().optional()}},
      async ({type}) => {
        const sample = dataset.find((d) => d._type === type)
        return text(sample ? {type, exampleDocument: sample} : {error: `Unknown type ${type}`})
      },
    )
    server.registerTool(
      'groq_query',
      {description: 'Run a GROQ query against the dataset', inputSchema: {query: z.string()}},
      async ({query}) => text(await runGroq(query)),
    )
  }
  return server
}

function groqContext() {
  return `This dataset is queried with GROQ.\n\nDocument types:\n${schemaOverview()}\n\nReferences are followed with ->. Use groq_query for exact answers.`
}
function kbOutline() {
  return guides.map((g) => `- /guides/${g.slug.current} [core] ${g.title}: ${g.summary}`).join('\n')
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    res.writeHead(401, {'content-type': 'application/json'}).end('{"error":"unauthorized"}')
    return
  }
  const mode = url.searchParams.get('mode') === 'knowledge_base' ? 'knowledge_base' : 'groq'
  if (req.method === 'GET' && url.pathname.endsWith('/initial-context')) {
    res.writeHead(200, {'content-type': 'text/plain'}).end(mode === 'knowledge_base' ? kbOutline() : groqContext())
    return
  }
  if (!url.pathname.includes('/mcp/')) {
    res.writeHead(404).end('not found')
    return
  }
  const chunks = []
  for await (const c of req) chunks.push(c)
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined
  const mcp = buildServer(mode)
  const transport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined, enableJsonResponse: true})
  res.on('close', () => {
    transport.close()
    mcp.close()
  })
  await mcp.connect(transport)
  await transport.handleRequest(req, res, body)
})

export function start(port = PORT) {
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await start()
  console.log(`Mock Sanity Context listening on http://127.0.0.1:${PORT}`)
  console.log(`  GROQ endpoint: http://127.0.0.1:${PORT}/v1/context/organizations/mock/mcp/ultra-bridge`)
  console.log(`  KB endpoint:   http://127.0.0.1:${PORT}/v1/context/organizations/mock/mcp/ultra-bridge?mode=knowledge_base&knowledgeBases=kb-mock`)
  console.log(`  Token: ${TOKEN}`)
}
