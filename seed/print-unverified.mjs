// Prints every command that is not yet confirmed by a first-party source or a hands-on test.
// Author: Demir Ajvazi
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'
const here = dirname(fileURLToPath(import.meta.url))
const docs = readFileSync(join(here, 'seed.ndjson'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const rows = docs.filter((d) => d._type === 'command' && ['recalled', 'third-party'].includes(d.verification))
for (const level of ['recalled', 'third-party']) {
  console.log(`\n${level.toUpperCase()} (${rows.filter((r) => r.verification === level).length})`)
  for (const r of rows.filter((x) => x.verification === level)) console.log(`- ${r.label}`)
}
