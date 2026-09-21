// Reports which parts of the setup are present, without revealing any secret. Author: Demir Ajvazi
import {pickModel} from '@/lib/model'

export const dynamic = 'force-dynamic'

export async function GET() {
  let model = 'none'
  try {
    model = pickModel().label
  } catch {}
  return Response.json({
    structuredData: Boolean(process.env.SANITY_CONTEXT_MCP_URL && process.env.SANITY_ORGANIZATION_TOKEN),
    knowledgeBase: Boolean(process.env.SANITY_CONTEXT_KB_MCP_URL),
    model,
  })
}
