// Logs to the console and, when possible, to a file next to the app so problems can be read
// without copying text out of a terminal window. The file is ignored by git.
// Author: Demir Ajvazi
import {appendFileSync} from 'node:fs'

const FILE = process.env.ULTRA_LOG_FILE || (process.env.NODE_ENV === 'production' ? '' : 'ultra-bridge.log')

function describe(e: Error): string {
  const x = e as Error & {statusCode?: number; responseBody?: string; cause?: unknown}
  const parts = [`${e.name}: ${e.message}`]
  if (x.statusCode) parts.push(`status=${x.statusCode}`)
  if (typeof x.responseBody === 'string') parts.push(`body=${x.responseBody.replace(/\s+/g, ' ').slice(0, 400)}`)
  return parts.join(' ')
}

function write(level: string, args: unknown[]) {
  const text = args
    .map((a) => (a instanceof Error ? describe(a) : typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ')
    .slice(0, 1500)
  if (!FILE) return
  try {
    appendFileSync(FILE, `${new Date().toISOString()} ${level} ${text}\n`)
  } catch {
    // Read-only file systems (for example serverless hosting) simply skip the file.
  }
}

export const log = {
  info: (...args: unknown[]) => {
    console.log(...args)
    write('INFO', args)
  },
  warn: (...args: unknown[]) => {
    console.warn(...args)
    write('WARN', args)
  },
  error: (...args: unknown[]) => {
    console.error(...args)
    write('ERROR', args)
  },
}
